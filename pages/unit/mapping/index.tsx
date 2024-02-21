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
import { useRouter } from "next/router";
import mqtt from "mqtt";
import ButtonInformation from "@/components/unit-information-button/unitInformationButton";
import ControlInstruction from "@/components/control-instruction/controlInstruction";
import TokenExpired from "@/components/token-expired/tokenExpired";

interface MappingProps { }

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

export default function Mapping(props: MappingProps): JSX.Element {
    const [showConfirmClosePageDialog, setShowConfirmClosePageDialog] =
        useState<boolean>(false);
    const [showConfirmMappingDialog, setShowConfirmMappingDialog] =
        useState<boolean>(false);
    const [savingConfirmDialog, setSavingConfirmDialog] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Idle");
    const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || "http://localhost:5000");
    const [brokerUrl, setBrokerUrl] = useState<string>(process.env.WS_MQTT_BROKER_URL || "ws://localhost:9001");
    const [rosUrl, setRosUrl] = useState<string>(process.env.WS_ROSBRIDGE_URL || "ws://localhost:9090");
    const [topic, setTopic] = useState<string>(`${sessionStorage.getItem("username")}/${sessionStorage.getItem("unit_name")}/camera`);
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

    const handleOptionClick = (text: string): void => {
        if (text === 'Delete All Pinpoints') {
            // Check if options 1 to 4 have been selected
            if (selectedOptions.length === 4) {
                setSelectedOptions(options.map((option) => option.text));
            }
        } else {
            // Check if the option is not already selected
            if (!selectedOptions.includes(text)) {
                setSelectedOptions((prevSelected) => [...prevSelected, text]);
            }
        }
    };

    const handleToggleMenu = (): void => {
        setShowMenu((prevShowMenu) => !prevShowMenu);
    };

    const router = useRouter();


    const onConfirmButtonClick = (): void => {
        setShowConfirmClosePageDialog(true);
    };

    const onConfirmMappingButtonClick = (): void => {
        setShowConfirmMappingDialog(true);
    };

    const handleCancel = (): void => {
        setShowConfirmClosePageDialog(false);
    };

    const handleDatabaseCancel = (): void => {
        setShowConfirmMappingDialog(false);
    };

    const changeStatus = (newStatus: string): void => {
        isChecked === true ? setStatus(newStatus) : setStatus("Idle");
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
        axios.post(`${backendUrl}/api/mapping`, {
            start: start,
            pause: pause,
            stop: stop,
            unit_name: sessionStorage.getItem('unit_name')
        }, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        })
            .then(function (response) {
                console.log(response);
                if (start) {
                    changeStatus("On Progress");
                }
                else if (pause) {
                    changeStatus("Paused");
                }
                else if (stop) {
                    changeStatus("Idle");
                    alert("Map saved successfully");
                    setStopButton(false)
                }
            })
            .catch(function (error) {
                console.log(error);
            });


    }

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setIsChecked(event.target.checked);
        if (event.target.checked) {
            setLidar(true, false);
        } else {
            setLidar(false, false);
        }
    };

    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        var enableRos = false;
        async function checkToken() {
            await axios.get(`${backendUrl}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setRender(true);
                        enableRos = true;
                    }
                    else {
                        router.push('/');
                    }
                })
                .catch((error) => {
                    setTokenExpired(false)
                });
        }
        checkToken();
        const ROSLIB = (window as any).ROSLIB;
        const ros = new ROSLIB.Ros({
            url: rosUrl,
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
            width: mapRef.current?.clientWidth || 1070,
            height: mapRef.current?.clientHeight || 1070,
            background: "#DCDCDC",
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
        const mqtt_client = mqtt.connect(brokerUrl);
        mqtt_client.on('connect', () => {
            // mqtt_client.subscribe(topic);
            console.log('Connected to MQTT broker');
        });

        mqtt_client.on('message', (receivedTopic, message) => {
            // if (receivedTopic === topic) {
            //     const receivedImageBlob = new Blob([message]);
            //     setImageBlob(showImage ? receivedImageBlob : null);
            // }
        });

        mqtt_client.on('close', () => {
            console.log('Connection to MQTT is closed');
        })

        const mapNameFromSession = sessionStorage.getItem('mapName');
        setMapName(mapNameFromSession ?? ''); // If mapNameFromSession is null, use an empty string

        setFirstLoaded(sessionStorage.getItem('firstLoadMappingPage') === null ? 'true' : 'false');

        return () => {
            // clean up when exiting the page
            ros.close();
            mqtt_client.end();
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
        zoomCrossConst.push(zoomInConst)
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
        zoomCrossConst.push(zoomOutConst)
    }

    const rotateCW = () => {
        var rotate = new (window as any).ROS2D.Rotate({
            rootObject: viewer.scene
        });
        rotate.startRotate(20);
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
        var newConst = 1 / result;
        zoom.zoom(newConst)
        zoomCrossConst = []
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

    //get home base point from SLAM initial point
    const getHomeBasePoint = () => {
        if (gridClient.navigator != null) {
            homePoint = gridClient.navigator.getHomeBasePoint();
            console.log(homePoint);
        } else {
            console.log("navigator null")
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

    return (
        <> {render ?
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
                    <div className={styles.container}>
                        {showControlInstruction || firstLoaded == 'true' ? <ControlInstruction onClick={handleControlInstructionClick} height={80} width={90} imgUrl='/images/instruction_mapping.svg' /> : ''}
                        <div className={styles.parents}>
                            <div className={styles.statusSection}>
                                <div
                                    className={`${styles.status} ${status === "Idle" ? styles.idle : ""
                                        }`}
                                >
                                    <img src="/icons/information-circle-svgrepo-com.svg" alt="" />
                                    <p>
                                        Status : <span>{status}</span>
                                    </p>
                                </div>

                                <div className={styles.lidar}>
                                    <p>LIDAR</p>
                                </div>

                                <div className={styles.lidarButton}>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            className={styles.toggleInput}
                                            checked={isChecked}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                            <CloseButton onClick={onConfirmButtonClick} />
                            <div className={styles.navigation}>
                                <Navigation imageSrc={imageBlob ? URL.createObjectURL(imageBlob) : undefined} />
                            </div>
                            <div>
                            </div>
                            <div className={styles.mapSection}>
                                <div className={styles.topDiv}>
                                    <p>Create a New Map</p>
                                    <div
                                        className={`${styles.playButton} ${status == "On Progress" ? styles.buttonActive : ""
                                            }`}
                                        onClick={() => {
                                            if (isChecked) {
                                                if (status != "On Progress") {
                                                    console.log("Play request sent");
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
                                        className={`${styles.pauseButton} ${status == "Paused" && count != 0 ? styles.buttonActive : ""}`}
                                        onClick={() => {
                                            if (isChecked) {
                                                if (status != "Idle") {
                                                    setcount(1)
                                                    console.log("Pause request sent");
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
                                        className={`${styles.stopButton} ${stopButton ? styles.buttonActive : ''}`}
                                        onClick={() => {
                                            if (isChecked) {
                                                if (status !== "Idle") {
                                                    setStopButton(true); // Toggle the active state
                                                    console.log("Stop request sent");
                                                    setMapping(false, false, true);
                                                } else {
                                                    alert("Cannot stop when Lidar button turned on");
                                                }
                                            } else {
                                                alert("Please turn on the LIDAR before mapping.");
                                            }
                                            // setStopButton(false);
                                        }}
                                    >
                                        <p>Stop</p>
                                        <img src="/icons/2.svg" alt="" />
                                    </div>

                                    {/* <div className={styles.settingsButton}>
                                        <img src="/icons/Setting.svg" alt="" />
                                        <p>Please turn on the LIDAR before mapping.</p>
                                    </div> */}
                                </div>
                                <div className={styles.centerDiv} id="map" onMouseMove={whenMouseMove} onMouseDown={whenMouseDown} onMouseUp={whenMouseUp}>
                                    <div className={styles.buttonNavigation}>
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
                                    <div className={styles.footerMap}>
                                        <div className={styles.emergencyButton}>
                                            <img src="/icons/emergency.svg" alt="" />
                                            <p>Emergency Button</p>
                                        </div>
                                        <div className={styles.mapName}>{mapName}</div>
                                    </div>

                                    <div className={styles.footerMap}>
                                        <div className={styles.emergencyButton}>
                                            <img src="/icons/emergency.svg" alt="" />
                                            <p>Emergency Button</p>
                                        </div>
                                        <div className={styles.mapName}>{mapName}</div>
                                    </div>
                                    {/* <img src="/icons/Frame.svg" alt="" /> */}
                                </div>
                            </div>
                            <Footer status={false} />
                        </div>
                    </div>

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
