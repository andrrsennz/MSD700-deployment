import { MouseEvent, useState, ChangeEvent, useEffect, useRef } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import Navigation from "@/components/unit-navigation/navigation";
import styles from "./mapping.module.css";
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import MapSaving from "@/components/map-saving/mapSaving";
import ConfirmSaving from "@/components/confirm-saving-mapping/confirmSaving";
import Script from "next/script";
import axios from "axios";
import Head from "next/head";
import mqtt from "mqtt";
import ButtonInformation from "@/components/unit-information-button/unitInformationButton";
import ControlInstruction from "@/components/control-instruction/controlInstruction";
import TokenExpired from "@/components/token-expired/tokenExpired";
import MobileLidarSection from "@/components/mobile-lidar-section/mobileLidarSection";
import MobileTopSection from "@/components/mobile-top-section/mobileTopSection";
import MapPreviewSection from "@/components/mobile-map-preview-section/mobileMapPreviewSection";
import MobileBottomSection from "@/components/mobile-bottom-section/mobileBottomSection";
import MobileNavigation from "@/components/mobile-navigation/mobileNavigation";
import MobileInstruction from "@/components/mobile-instruction/mobileInstruction";
import GreetingsUnit from "@/components/greetings-unit/greetingsUnit";
import EmergencyButton from "@/components/emergency-button/emergencyButton";
import LidarSwitch from "@/components/lidar-switch/lidarSwitch";
import { changeStatus, setStatus } from '@/store/stateLidar'; // Adjust import path as needed
import { RootState } from '@/store/types';
import { useSelector, useDispatch } from 'react-redux';

interface MappingProps {
    handleMobileNavigation: () => void; // Define handleMobileNavigation prop
    handleMobileInstruction: () => void;
}

var ros: any
var viewer: any
var paN: any
var movecoor: any = [];
var isDrag = false;
var startcoor: any = [];
var showImage: boolean = false;
var gridClient: any;
var multiPointMode = false;
var getInit = false;
var setHomeBaseMode = false;
var homePoint: any = null;
var navmode = false;
var focusViewMode = false;

interface Option {
    icon: string;
    text: string;
}

const options: Option[] = [
    { icon: '/icons/2.svg', text: 'Single Pinpoint' },
    { icon: '/icons/2.svg', text: 'Multiple Pinpoints' },
    { icon: '/icons/2.svg', text: 'Set Home Base' },
    { icon: '/icons/2.svg', text: 'Initial Pose' },
    { icon: '/icons/2.svg', text: 'Delete All Pinpoints' },
];

const Mapping: React.FC<MappingProps> = () => {
    const [showConfirmClosePageDialog, setShowConfirmClosePageDialog] =
        useState<boolean>(false);
    const [showConfirmMappingDialog, setShowConfirmMappingDialog] =
        useState<boolean>(false);
    const [savingConfirmDialog, setSavingConfirmDialog] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(true);
    const [status, setStatus] = useState<string>("Idle");
    const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || "http://localhost:5000");
    const [brokerUrl, setBrokerUrl] = useState<string>(process.env.WS_MQTT_BROKER_URL || "ws://localhost:9001");
    const [rosUrl, setRosUrl] = useState<string>(process.env.WS_ROSBRIDGE_URL || "ws://localhost:9090");
    // const [topic, setTopic] = useState<string>(`${sessionStorage.getItem("username")}/${sessionStorage.getItem("unit_name")}/camera`);
    const [count, setcount] = useState<Number>(0);
    const [stopButton, setStopButton] = useState<boolean>(false);
    const [render, setRender] = useState<boolean>(true);
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [mapName, setMapName] = useState<string>('');
    const [showControlInstruction, setShowControlInstruction] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [firstLoaded, setFirstLoaded] = useState<string>('false')
    const [tokenExpired, setTokenExpired] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [mapPreview, setMapPreview] = useState(false);
    const [mapPreviewStatus, setMapPreviewStatus] = useState(0);
    const [lidarExtend, setLidarExtend] = useState<Boolean>(false);
    const [controlExtend, setControlExtend] = useState<Boolean>(false);
    const [mobileNavigation, setMobileNavigation] = useState<boolean>(false);
    const [mobileInstruction, setMobileInstruction] = useState<boolean>(false);
    const [buttonMapStatus, setButtonMapStatus] = useState<string>()
    const [playButtonClicked, setPlayButtonClicked] = useState<boolean>(false);

    const [emergencyStatus, setEmergencyStatus] = useState<boolean>(false);

    const { value } = useSelector((state: RootState) => state.lidarState);


    useEffect(() => {
        // Read value from localStorage when the component mounts
        const savedStatus = localStorage.getItem('emergencyStatus');
        if (savedStatus !== null) {
            setEmergencyStatus(JSON.parse(savedStatus));
        }
    }, []);

    const onConfirmButtonClick = (): void => {
        setShowConfirmClosePageDialog(true);
    };

    const handleCancel = (): void => {
        setShowConfirmClosePageDialog(false);
    };

    const handleDatabaseCancel = (): void => {
        setShowConfirmMappingDialog(false);
    };

    const changeStatus = (newStatus: string): void => {
        value === true ? setStatus(newStatus) : setStatus("Idle");
    };

    const onConfirmSaveMappingButtonClick = (): void => {
        setSavingConfirmDialog(true);
    };

    const setLidar = (enable: boolean, use_own_map: boolean): void => {
        axios.post(`${backendUrl}/api/lidar`, {
            enable: enable,
            use_own_map: use_own_map,
            unit_name: sessionStorage.getItem('unit_name')
        }, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });

        showImage = enable;
    }

    const setMapping = (start: boolean, pause: boolean, stop: boolean): void => {

        sessionStorage.setItem('mappingStart', start.toString());
        sessionStorage.setItem('mappingPause', pause.toString());
        sessionStorage.setItem('mappingStop', stop.toString());

        // axios.post(`${backendUrl}/api/mapping`, {
        //     start: start,
        //     pause: pause,
        //     stop: stop,
        //     unit_name: sessionStorage.getItem('unit_name')
        // }, {
        //     headers: {
        //         'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        //     }
        // })
        //     .then(function (response) {
        if (start) {
            changeStatus("On Progress");
            setButtonMapStatus('play');
            setPlayButtonClicked(true)
        }
        else if (pause) {
            changeStatus("Idle");
            setButtonMapStatus('pause')
        }
        else if (stop && playButtonClicked) {
            changeStatus("Idle");
            // alert("Map saved successfully");
            setStopButton(false)
            setButtonMapStatus('')
            setPlayButtonClicked(false)
        }
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });
    }

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setIsChecked(event.target.checked);

        console.log(" event.target.checked : ", event.target.checked);


        sessionStorage.setItem('isChecked', `${event.target.checked}`)
        if (event.target.checked) {
            setLidar(true, false);
        } else {
            setLidar(false, false);
        }
    };

    const mapRef = useRef<HTMLDivElement>(null);

    const booleanConverter = (status: any) => {
        if (status == 'true') {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        var enableRos = false;
        async function checkToken() {
            // await axios.get(`${backendUrl}`, {
            //     headers: {
            //         'Authorization': `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`
            //     }
            // })
            //     .then((response) => {
            //         if (response.status === 200) {
            //             setRender(true);
            //             enableRos = true;
            //         }
            //         else {
            //             setTokenExpired(true);
            //         }
            //     })
            //     .catch((error) => {
            //         setTokenExpired(true)
            //     });
        }
        checkToken();
        const ROSLIB = (window as any).ROSLIB;
        const ros = new ROSLIB.Ros({
            url: "ws://192.168.1.55:9090",
        });

        // Handle ROS connection errors
        ros.on('error', (error: Error) => {
            console.error('Error connecting to ROS:', error);
        });

        // Handle ROS connection closure
        ros.on('close', () => {
            console.log('Connection to ROS is closed.');
        });

        // Create the main viewer.
        viewer = new (window as any).ROS2D.Viewer({
            divID: 'map',
            width: mapRef.current?.clientWidth || window.innerWidth,
            height: mapRef.current?.clientHeight || window.innerHeight,
            background: "#7F7F7F",
        });

        paN = new (window as any).ROS2D.PanView({
            rootObject: viewer.scene,
        });

        // Setup the map client.
        gridClient = new (window as any).NAV2D.OccupancyGridClientNav({
            ros: ros,
            rootObject: viewer.scene,
            viewer: viewer,
            withOrientation: false,
            withCommand: false,
            continuous: true
        });

        // getHomeBasePoint();
        // if (navmode == false) {
        //     setTimeout(()=>{
        //         getHomeBasePoint();
        //         console.log("get home point")
        //       },1000);
        // }

        var zoomView = new (window as any).ROS2D.ZoomView({
            rootObject: viewer.scene
        });

        // Setup the map client if ROS is connected
        ros.on('connection', () => {
            console.log('Connected to ROS websocket server.');
        });

        // MQTT Client Setup
        // const mqtt_client = mqtt.connect(brokerUrl);
        // mqtt_client.on('connect', () => {
        //     // mqtt_client.subscribe(topic);
        //     console.log('Connected to MQTT broker');
        // });

        // mqtt_client.on('message', (receivedTopic, message) => {
        //     // if (receivedTopic === topic) {
        //     //     const receivedImageBlob = new Blob([message]);
        //     //     setImageBlob(showImage ? receivedImageBlob : null);
        //     // }
        // });

        // mqtt_client.on('close', () => {
        //     console.log('Connection to MQTT is closed');
        // })

        const mapNameFromSession = sessionStorage.getItem('mapName');

        setMapName(mapNameFromSession ?? ''); // If mapNameFromSession is null, use an empty string

        setFirstLoaded(sessionStorage.getItem('firstLoadMappingPage') === null ? 'true' : 'false');

        if (sessionStorage.getItem('isChecked')) {
            const isCheckedBoolean = booleanConverter(sessionStorage.getItem('isChecked'))
            setIsChecked(isCheckedBoolean)
        } else {
            setIsChecked(false)
        }

        // Check and set mapping status
        const mappingStart = sessionStorage.getItem('mappingStart') === 'true';
        const mappingPause = sessionStorage.getItem('mappingPause') === 'true';
        const mappingStop = sessionStorage.getItem('mappingStop') === 'true';

        if (mappingStart !== null || mappingPause !== null || mappingStop !== null) {
            setMapping(mappingStart, mappingPause, mappingStop);
        }

        return () => {
            // clean up when exiting the page
            ros.close();
            // mqtt_client.end();
            setLidar(false, false);
        };
    }, []);

    var zoomCrossConst: number[] = []
    var firstZoomVar = 1

    const zoomIn = () => {
        var zoom = new (window as any).ROS2D.ZoomView({
            ros: ros,
            rootObject: viewer.scene,
        });
        zoom.startZoom(250, 250);
        const zoomInConst = 1.2
        firstZoomVar = firstZoomVar * zoomInConst;
        zoom.zoom(zoomInConst);
        zoomCrossConst.push(zoomInConst);
        gridClient.navigator.reScale();
        gridClient.navigator.setZoom(firstZoomVar);
    }

    const zoomOut = () => {
        var zoom = new (window as any).ROS2D.ZoomView({
            ros: ros,
            rootObject: viewer.scene,
        });
        zoom.startZoom(250, 250);
        const zoomOutConst = 0.8
        firstZoomVar = firstZoomVar * zoomOutConst
        zoom.zoom(zoomOutConst);
        zoomCrossConst.push(zoomOutConst);
        gridClient.navigator.reScale();
        gridClient.navigator.setZoom(firstZoomVar);
    }

    const rotateCW = () => {
        var rotate = new (window as any).ROS2D.Rotate({
            rootObject: viewer.scene
        });
        rotate.startRotate(90);
        gridClient.navigator.reScale();
    }

    const restart = () => {
        var zoom = new (window as any).ROS2D.ZoomView({
            ros: ros,
            rootObject: viewer.scene,
        });
        var rotate = new (window as any).ROS2D.Rotate({
            rootObject: viewer.scene
        });
        rotate.resetRotate();
        zoom.startZoom(250, 250);
        var result = zoomCrossConst.reduce((accumulator, currentValue) => accumulator * currentValue, 1);
        var newConst = 1 / firstZoomVar;
        zoom.zoom(newConst);
        firstZoomVar = 1;
        zoomCrossConst = [];
        gridClient.navigator.reScale();
        gridClient.navigator.setZoom(firstZoomVar);
    }

    const whenMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            paN.startPan(event.clientX, event.clientY);
            isDrag = true;
            startcoor[0] = event.clientX;
            startcoor[1] = event.clientY;
        }

    }

    const whenMouseUp = (event: MouseEvent) => {
        isDrag = false;
    }

    const whenMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isDrag) {
            // Perform the action when the mouse is clicked and moving
            paN.pan(e.clientX, e.clientY);
        }
    };

    const whenTouchDown = (event: any) => {
        // event.preventDefault();
        if (event.touches.length === 2) {
            paN.startPan(event.touches[0].clientX, event.touches[0].clientY);
            isDrag = true;
            startcoor[0] = event.touches[0].clientX;
            startcoor[1] = event.touches[0].clientX;
        }
    }

    const whenTouchUp = (event: any) => {
        isDrag = false;
    }

    const whenTouchMove = (e: any) => {
        if (isDrag && e.touches.length === 2) {
            // Perform the action when the mouse is clicked and moving
            paN.pan(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    //get home base point from SLAM initial point
    // const getHomeBasePoint = () => {
    //     if (gridClient.navigator != null) {
    //         homePoint = gridClient.navigator.getHomeBasePoint();
    //         console.log(homePoint);
    //     } else {
    //         console.log("navigator null")
    //     }
    // }

    //set focus view on robot
    const focusView = () => {
        if (focusViewMode == false) {
            focusViewMode = true;
            gridClient.navigator.setFocusView(true);
            var button = document.getElementById("setFocusBtn")
            if (button != null) {
                // button.innerText = "Focus View On"
                console.log("button changes")
            }
        }
        else if (focusViewMode == true) {
            focusViewMode = false;
            gridClient.navigator.setFocusView(false);
            var button = document.getElementById("setFocusBtn")
            if (button != null) {
                // button.innerText = "Focus View Off"
                console.log("button changes")
            }
        }
    }

    const handleInfoIconClick = () => {
        setShowControlInstruction(!showControlInstruction); // Toggle the state
    };

    const handleControlInstructionClick = () => {
        setShowControlInstruction(false);
        sessionStorage.setItem('firstLoadMappingPage', 'false')
        setFirstLoaded('false')
    };

    const handleCloseButtonClick = () => {
        setShowConfirmDialog(true); // or false, depending on your logic
    };

    const handleMapPreview = () => {
        setMapPreview(!mapPreview)
    }

    const handleMapPreviewStatus = (value: any) => {
        setMapPreviewStatus(value)
    }

    const handleLidarExtend = () => {
        setLidarExtend(!lidarExtend)
    }

    const handleControlExtend = () => {
        setControlExtend(!controlExtend)
    }

    const handleMobileNavigation = () => {
        setMobileNavigation(!mobileNavigation);
    }

    const handleMobileInstruction = () => {
        setMobileInstruction(!mobileInstruction);
        sessionStorage.setItem('firstLoadMappingPage', 'false')
        setFirstLoaded('false')
    }

    const handleLidarChecked = () => { }

    const handleEmergencyStatus = () => {
        setEmergencyStatus((prevStatus) => {
            const newStatus = !prevStatus;
            localStorage.setItem('emergencyStatus', JSON.stringify(newStatus));
            return newStatus;
        });
    };



    return (
        <>
            {render ?
                (
                    <>
                        <Head>
                            <title>Mapping</title>
                            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                        </Head>
                        <ConfirmElement
                            message="Are you sure you want to close this app?"
                            status={showConfirmClosePageDialog}
                            onCancel={handleCancel}
                        />
                        <ConfirmSaving
                            message="Are you sure you want to stop and save the map?"
                            status={showConfirmMappingDialog}
                            onCancel={handleDatabaseCancel}
                            onConfirm={onConfirmSaveMappingButtonClick}
                        />
                        <MapSaving status={savingConfirmDialog} />
                        <TokenExpired status={tokenExpired} />
                        {mobileNavigation ? <MobileNavigation onClick={handleMobileNavigation} /> : ""}
                        {mobileInstruction || firstLoaded == 'true' ? <MobileInstruction onClick={handleMobileInstruction} imgUrl={"/images/mobile_instruction_mapping.svg"} /> : ""}

                        <div className={styles.container}>
                            {showControlInstruction || firstLoaded == 'true' ? <ControlInstruction onClick={handleControlInstructionClick} height={80} imgUrl='/images/instruction_mapping.svg' /> : ''}

                            <div className={styles.parents}>
                                <div className={`${styles.topSection} ${styles.mobileDisplayNone}`}>
                                    <GreetingsUnit />

                                    <div className={`${styles.statusSection} ${styles.mobileDisplayNone}`}>
                                        <div
                                            className={`${styles.status} ${status === "Idle" ? styles.idle : ""
                                                }`}
                                        >
                                            <img src="/icons/info.png" alt="" />
                                            <p>
                                                Status : <span>{status}</span>
                                            </p>
                                        </div>

                                        <div className={styles.lidar}>
                                            <p>LIDAR</p>
                                        </div>

                                        <div className={styles.lidarButton}>
                                            <LidarSwitch backendUrl={backendUrl}  />
                                        </div>
                                        {/* <div className={styles.lidarButton}>
                                        <label className={styles.toggleSwitch}>
                                            <input
                                                type="checkbox"
                                                className={styles.toggleInput}
                                                checked={isChecked}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div> */}

                                    </div>
                                </div>

                                <MobileTopSection onConfirmButtonClick={handleCloseButtonClick} />


                                <div className={styles.mobileDisplayNone}>
                                    <CloseButton onClick={onConfirmButtonClick} />
                                </div>

                                <div className={styles.unitParents}>
                                    <MobileLidarSection // Use the new component here
                                        isChecked={isChecked}
                                        handleCheckboxChange={handleCheckboxChange}
                                    />
                                    <div className={`${styles.navigation} ${styles.mobileDisplayNone}`}>
                                        <Navigation imageSrc={imageBlob ? URL.createObjectURL(imageBlob) : undefined} />
                                    </div>

                                    <div className={`${styles.mapSection} ${mapPreview ? "" : styles.mapSectionWithoutPreview}`}>
                                        <div className={`${styles.topDiv} ${styles.mobileDisplayNone}`}>
                                            <p className={styles.runThePrototype}>Create a New Map</p>
                                            <div
                                                className={`${styles.playButton} ${status == "On Progress" ? styles.buttonActive : ""}`}
                                                onClick={() => {
                                                    if (value) {
                                                        if (status != "On Progress") {
                                                            setMapping(true, false, false);
                                                        }
                                                    } else {
                                                        alert("Please turn on the LIDAR before mapping.");
                                                    }
                                                }}
                                            >
                                                <p>Play</p>
                                                <img src="/icons/3.svg" alt="" />
                                            </div>
                                            <div
                                                className={`${styles.pauseButton} ${status == "Paused" && count != 0 || buttonMapStatus == 'pause' ? styles.buttonActive : ""}`}
                                                onClick={() => {
                                                    if (value) {
                                                        if (status != "Idle") {
                                                            setcount(1)
                                                            setMapping(false, true, false);
                                                        }
                                                        else {
                                                            alert("Cannot pause when Lidar button turned on");
                                                        }
                                                    } else {
                                                        alert("Please turn on the LIDAR before mapping.");
                                                    }
                                                }}
                                            >
                                                <p>Pause</p>
                                                <img src="/icons/1.svg" alt="" />
                                            </div>
                                            <div
                                                id="stopButton"
                                                className={`${styles.stopButton}`}
                                                onClick={() => {
                                                    if (value) {
                                                        if (buttonMapStatus == 'play' || buttonMapStatus == 'pause') {
                                                            setShowConfirmMappingDialog(true);
                                                            setStopButton(true);
                                                            setMapping(false, false, true);
                                                        }
                                                    } else {
                                                        alert("Please turn on the LIDAR before mapping.");
                                                    }
                                                }}
                                            >
                                                <p>Stop</p>
                                                <img src="/icons/2.svg" alt="" />
                                            </div>
                                            <div
                                                id="setFocusBtn"
                                                className={styles.focusButton}
                                                onClick={() => {
                                                    focusView();
                                                }}
                                            >
                                                <p>Focus View</p>
                                                <img src="/icons/Position.svg" alt="" />
                                            </div>

                                        </div>

                                        <div className={`${styles.centerDiv}`} id="map" onMouseMove={whenMouseMove} onMouseDown={whenMouseDown} onMouseUp={whenMouseUp} onTouchStart={whenTouchDown} onTouchMove={whenTouchMove} onTouchEnd={whenTouchUp}>
                                            <div className={`${styles.buttonNavigation} ${styles.mobileDisplayNone}`}>
                                                <div className={styles.zoomIn} onClick={zoomIn}>
                                                    <img src="/icons/zoomin.svg" alt="" />
                                                </div>
                                                <div className={styles.zoomOut} onClick={zoomOut}>
                                                    <img src="/icons/zoomout.svg" alt="" />
                                                </div>
                                                <div className={styles.restart} onClick={restart}>
                                                    <img src="/icons/Maximize.svg" alt="" />
                                                </div>
                                                <div className={styles.restart} onClick={rotateCW}>
                                                    <img src="/icons/new reload.svg" alt="" />
                                                </div>
                                            </div>

                                            <div className={`${styles.displayNone} ${styles.controlLidarButton}`}>
                                                <div className={`${styles.lidarButton} ${lidarExtend ? styles.mainLidarButtonActive : ""}`} onClick={handleLidarExtend}>
                                                    {lidarExtend ? <img src="/icons/minus.svg" alt="" /> : <img src="/icons/plus.svg" alt="" />}
                                                </div>
                                                {lidarExtend ? (
                                                    <>
                                                        <div className={`${styles.lidarButton}`}>
                                                            <img src="/icons/3.svg" alt="" />
                                                        </div>
                                                        <div className={`${styles.lidarButton}`}>
                                                            <img src="/icons/1.svg" alt="" />
                                                        </div>
                                                        <div className={`${styles.lidarButton} ${styles.lidarButtonActive}`}>
                                                            <img src="/icons/Home.svg" alt="" />
                                                        </div>
                                                    </>
                                                ) : ""}
                                            </div>

                                            <div className={`${styles.displayNone} ${styles.controlButtonSection} `}>
                                                <div className={`${styles.controlButton} ${controlExtend ? styles.mainControlButtonActive : ""}`} onClick={handleControlExtend}>
                                                    <img src="/icons/Dots.svg" alt="" />
                                                </div>
                                                {controlExtend ? <>
                                                    <div className={`${styles.controlButton} ${styles.controlButtonNonMain}`} onClick={zoomIn}>
                                                        <img src="/icons/zoomin.svg" alt="" />
                                                    </div>
                                                    <div className={`${styles.controlButton} ${styles.controlButtonNonMain}`} onClick={zoomOut}>
                                                        <img src="/icons/zoomout.svg" alt="" />
                                                    </div>
                                                    <div className={`${styles.controlButton} ${styles.controlButtonNonMain}`} onClick={restart}>
                                                        <img src="/icons/Maximize.svg" alt="" />
                                                    </div>
                                                    <div className={`${styles.controlButton} ${styles.controlButtonNonMain}`} onClick={rotateCW}>
                                                        <img src="/icons/new reload.svg" alt="" />
                                                    </div>
                                                </> : ""}
                                            </div>

                                            <div className={`${styles.displayNone} ${styles.focusButton}`}>
                                                <p>Focus View</p>
                                                <img src="/icons/focus_button.svg" alt="" />
                                            </div>

                                            <div className={`${styles.displayNone} ${styles.mobileStatus}`}>
                                                <p>Status : On progress</p>
                                            </div>

                                            <div className={`${styles.displayNone} ${styles.mobileStatus}`}>
                                                <p>Status : On progress</p>
                                            </div>


                                            <div className={`${styles.footerMap} ${styles.mobileDisplayNone}`}>
                                                <EmergencyButton />
                                                <div className={styles.mapName}>Mapping Preview</div>
                                            </div>
                                        </div>
                                    </div>

                                    <MapPreviewSection
                                        mapPreview={mapPreview}
                                        mapPreviewStatus={mapPreviewStatus}
                                        handleMapPreviewStatus={handleMapPreviewStatus}
                                    />

                                    <MobileBottomSection
                                        handleMobileNavigation={handleMobileNavigation}
                                        handleMapPreview={handleMapPreview}
                                        handleMobileInstruction={handleMobileInstruction}
                                        handleMobileSorterDisplay={handleLidarChecked}
                                        mapIndex={false}
                                    />

                                </div>

                                <div className={`${styles.mobileDisplayNone} ${styles.footerSection}`}>
                                    <Footer status={false} />
                                </div>

                            </div>
                        </div >

                        <ButtonInformation onClick={handleInfoIconClick} />
                        <Script src="/script/Nav2D.js" strategy="beforeInteractive" />
                        <Script src="/script/roslib.js" strategy="beforeInteractive" />
                        <Script src="/script/eventemitter2.min.js" strategy="beforeInteractive" />
                        <Script src="/script/easeljs.js" strategy="beforeInteractive" />
                        <Script src="/script/ros2d.js" strategy="beforeInteractive" />
                    </>
                ) : (<>
                </>)}
        </>
    );
}

export default Mapping;