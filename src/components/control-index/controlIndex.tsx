import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import Navigation from "../unit-navigation/navigation";
import styles from "./controlIndex.module.css";
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import MapSaving from "@/components/map-saving/mapSaving";
import ConfirmSaving from "@/components/confirm-saving-mapping/confirmSaving";
import axios from "axios";
import mqtt from "mqtt";
import MobileLidarSection from "@/components/mobile-lidar-section/mobileLidarSection";
import MapPreviewSection from "@/components/mobile-map-preview-section/mobileMapPreviewSection";
import MobileBottomSection from "@/components/mobile-bottom-section/mobileBottomSection";
<<<<<<< HEAD
import { json } from "stream/consumers";
=======
import GreetingsUnit from "../greetings-unit/greetingsUnit";
import MobileTopSection from "../mobile-top-section/mobileTopSection";
import TokenExpired from "../token-expired/tokenExpired";
import ControlInstruction from "../control-instruction/controlInstruction";
import ButtonInformation from "../unit-information-button/unitInformationButton";
import EmergencyButton from "../emergency-button/emergencyButton";
import LidarSwitch from "../lidar-switch/lidarSwitch";
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64

var ros: any;
var viewer: any;
var prevViewer: any;
var mobprevViewer: any;
var paN: any;
var isDrag = false;
var startcoor: any = [];
var showImage: boolean = false;
var gridClient: any;
var prevGridClient: any;
var mobprevGridClient: any;
var multiPointMode = false;
var singlePointMode = false;
var getInit = false;
var setHomeBaseMode = false;
var homePoint: any = null;
var focusViewMode = false;
var pathPlan: any;

interface ControlIndexProps {
  handleMobileNavigation: () => void; // Define handleMobileNavigation prop
  handleMobileInstruction: () => void;

}

const ControlIndex: React.FC<ControlIndexProps> = ({ handleMobileNavigation, handleMobileInstruction }) => {
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
  const [topic, setTopic] = useState<string>('/camera');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [mapName, setMapName] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [mapPreview, setMapPreview] = useState(false);
  const [mapPreviewStatus, setMapPreviewStatus] = useState(0);
  const [lidarExtend, setLidarExtend] = useState<Boolean>(false);
  const [controlExtend, setControlExtend] = useState<Boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(true);
  const [showControlInstruction, setShowControlInstruction] = useState<boolean>(false);
  const [firstLoaded, setFirstLoaded] = useState<string>('false')
  const [lidarStatus, setLidarStatus] = useState(false);

  const handleLidarStatus = (childData: any) => {
    setLidarStatus(childData);
  };

  const [emergencyStatus, setEmergencyStatus] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedStatus = localStorage.getItem('emergencyStatus');
      return savedStatus ? JSON.parse(savedStatus) : false;
    }
    return false;
  });


  const onConfirmButtonClick = () => {
    setShowConfirmClosePageDialog(true);
  };


  const handleCancel = () => {
    setShowConfirmClosePageDialog(false);
  };

  const handleDatabaseCancel = () => {
    setShowConfirmMappingDialog(false);
  };

  const changeStatus = (newStatus: string) => {
    lidarStatus === true ? setStatus(newStatus) : setStatus("Idle");
  };

  const onConfirmSaveMappingButtonClick = () => {
    setSavingConfirmDialog(true);
  };

  const setLidar = (enable: boolean, use_own_map: boolean): void => {
    axios.post(`${backendUrl}/api/lidar`, {
      enable: enable,
      use_own_map: use_own_map,
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

  const setRobot = (start: boolean, pause: boolean, stop: boolean): void => {
    // axios.post(`${backendUrl}/api/mapping`, {
    //   start: start,
    //   pause: pause,
    //   stop: stop
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    //   }
    // })
    //   .then(function (response: any) {
    // console.log(response);
    if (start) {
      console.log("VVVV");

      changeStatus("On Progress");
    }
    else if (pause) {
      changeStatus("Paused");
    }
    else if (stop) {
      changeStatus("Idle");
      alert("Map saved successfully");
    }
    // })
    // .catch(function (error: any) {
    //   console.log(error);
    // });
  }

  const setOwnMap = (enable: boolean, map_name: string): void => {
    axios.post(`${backendUrl}/api/set_own_map`, {
      enable: enable,
      map_name: map_name
    }, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    })
      .then(function (response: any) {
        console.log(response);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setIsChecked(event.target.checked);

    console.log("event.target.checked 1111 : ", event.target.checked);


    sessionStorage.setItem('isChecked', `${event.target.checked}`)
    if (!event.target.checked) {
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
      //   headers: {
      //     'Authorization': `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`
      //   }
      // })
      //   .then((response) => {
      //     if (response.status === 200) {
      //       setRender(true);
      //       enableRos = true;
      //     }
      //     else {
      //       setTokenExpired(true);
      //     }
      //   })
      //   .catch((error) => {
      //     setTokenExpired(true)
      //   });
    }
    checkToken();
    // Connect to ROS.
    const ROSLIB = (window as any).ROSLIB;
    ros = new ROSLIB.Ros({
      url: "ws://localhost:9090",
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
<<<<<<< HEAD
      width: mapRef.current?.clientWidth || 1000,
      height: mapRef.current?.clientHeight || 1000,
=======
      width: mapRef.current?.clientWidth || window.innerWidth,
      height: mapRef.current?.clientHeight || window.innerHeight,
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
      background: "#7F7F7F",
    });


    prevViewer = new (window as any).ROS2D.Viewer({
      divID: 'preview-map',
      width: mapRef.current?.clientWidth || window.innerWidth * 20 / 100,
      height: mapRef.current?.clientHeight || window.innerHeight * 20 / 100,
      background: "#7F7F7F",
    });

    if(document.getElementById("mobilepreview-map") != null) {
      mobprevViewer = new (window as any).ROS2D.Viewer({
        divID: 'mobilepreview-map',
        width: mapRef.current?.clientWidth || 180,
        height: mapRef.current?.clientHeight || 180,
        background: "#7F7F7F",
      });

      mobprevGridClient = new (window as any).NAV2D.PreviewGridClientNav({
        ros: ros,
        rootObject: mobprevViewer.scene,
        viewer: mobprevViewer,
        withOrientation: true,
        withCommand: false,
        continuous: true
      });
    }




    paN = new (window as any).ROS2D.PanView({
      rootObject: viewer.scene,
    });


    // Setup the map client.
    gridClient = new (window as any).NAV2D.OccupancyGridClientNav({
      ros: ros,
      rootObject: viewer.scene,
      viewer: viewer,
      withOrientation: true,
      withCommand: true,
      continuous: true
    });


    prevGridClient = new (window as any).NAV2D.PreviewGridClientNav({
      ros: ros,
      rootObject: prevViewer.scene,
      viewer: prevViewer,
      withOrientation: true,
      withCommand: false,
      continuous: true
    });

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
    //   mqtt_client.subscribe(topic);
    //   console.log('Connected to MQTT broker');
    // });

    // mqtt_client.on('message', (receivedTopic, message) => {
    //   if (receivedTopic === topic) {
    //     const receivedImageBlob = new Blob([message]);
    //     setImageBlob(showImage ? receivedImageBlob : null);
    //   }
    // });

    // mqtt_client.on('close', () => {
    //   console.log('Connection to MQTT is closed');
    // })

    const mapNameFromSession = sessionStorage.getItem('mapName');
    setMapName(mapNameFromSession ?? ''); // If mapNameFromSession is null, use an empty string

    if (sessionStorage.getItem('isChecked')) {
      const isCheckedBoolean = booleanConverter(sessionStorage.getItem('isChecked'))
      setIsChecked(isCheckedBoolean)
    } else {
      setIsChecked(false)
    }

    return () => {
      //clean up when exiting page
      ros.close();
      setOwnMap(false, '');
      setLidar(false, false);
    }
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

  const restart = () => {
    var zoom = new (window as any).ROS2D.ZoomView({
      ros: ros,
      rootObject: viewer.scene,
    });
    var rotate = new (window as any).ROS2D.Rotate({
      rootObject: viewer.scene
    });
    rotate.resetRotate();
    gridClient.navigator.resetRotateMap();
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
      // middle click
      paN.startPan(event.clientX, event.clientY);
      isDrag = true;
      startcoor[0] = event.clientX;
      startcoor[1] = event.clientY;
    }
  }

  const rotateCW = () => {
    var rotate = new (window as any).ROS2D.Rotate({
      rootObject: viewer.scene
    });
    rotate.startRotate(90);
    gridClient.navigator.rotateMap(90);
    gridClient.navigator.reScale();
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

  //multi pin point feature
  //change to between single and multi pin point mode
  const multiPoint = () => {
    if (multiPointMode == false) {
      multiPointMode = true;
      gridClient.navigator.multiPointMode(true);
      var button = document.getElementById("multiModeButton")
      if (button != null) {
        button.innerText = "Finish Pin Point Mode"
        console.log("button changes")
      }
    }

    else if (multiPointMode == true) {
      multiPointMode = false
      gridClient.navigator.multiPointMode(false);
    }
  }

  const singlePoint = () => {
    if (singlePointMode == false) {
      singlePointMode = true;
      gridClient.navigator.singlePointMode(true);
    }

    else if (singlePointMode == true) {
      singlePointMode = false
      gridClient.navigator.singlePointMode(false);
    }
  }
  //start navigation after multi pin point arranged
  const startNavigation = () => {
    gridClient.navigator.startNaav();
  }

  //pause navigation
  const pauseNavigation = () => {
    gridClient.navigator.pauseNav();
  }

  //remove all marker
  const removeallMarker = () => {
    gridClient.navigator.removeAllMark();
  }

  //2D pose estimation
  const initPose = () => {
    if (getInit == false) {
      getInit = true;
      gridClient.navigator.initPose(true);
    }

    else if (getInit == true) {
      getInit = false
      gridClient.navigator.initPose(false);
    }
  }

  //home base feature
  //change user input mode to modify home base point by input
  const setHomeBase = () => {
    if (setHomeBaseMode == false) {
      setHomeBaseMode = true;
      gridClient.navigator.setHomeBasePoint(true);
    }
    else if (setHomeBaseMode == true) {
      setHomeBaseMode = false;
      gridClient.navigator.setHomeBasePoint(false);
      getHomeBasePoint();
      updateHomeBase();
    }

  }
  //get home base point from SLAM initial point
  const getHomeBasePoint = () => {
    if (gridClient.navigator != null) {
      homePoint = gridClient.navigator.getHomeBasePoint();
      console.log(homePoint);
    }

  }
  //update home base and initial pose estimate when control page launched
  const updateHomeBase = () => {
    if (homePoint != null) {
      if (prevGridClient.prevNavigator != null) {
        // gridClient.navigator.changeRoot(prevViewer.scene);
        prevGridClient.prevNavigator.updateHome(homePoint);
        // gridClient.navigator.changeRoot(viewer.scene);

      }
            if (mobprevGridClient.prevNavigator != null) {
        // gridClient.navigator.changeRoot(prevViewer.scene);
        mobprevGridClient.prevNavigator.updateHome(homePoint);
        // gridClient.navigator.changeRoot(viewer.scene);

      }
    }
  }
  //command robot to return to home point
  const returnToHome = () => {
    if (homePoint != null) {
      gridClient.navigator.returnToHome(homePoint);
    }
  }

  //set focus view on robot
  const focusView = () => {
    if (focusViewMode == false) {
      focusViewMode = true;
      gridClient.navigator.setFocusView(true);
      var button = document.getElementById("setFocusBtn")
      if (button != null) {
<<<<<<< HEAD
        button.style.backgroundColor = "#60E3D5";
=======
        // button.innerText = "Focus View On"
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
        console.log("button changes")
      }
    }
    else if (focusViewMode == true) {
      focusViewMode = false;
      gridClient.navigator.setFocusView(false);
      var button = document.getElementById("setFocusBtn")
      if (button != null) {
<<<<<<< HEAD
        button.style.backgroundColor = "#0C98B4";
=======
        // button.innerText = "Focus View Off"
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
        console.log("button changes")
      }
    }
  }

<<<<<<< HEAD
  //post multi pinpoint path plan
  const savePathplan = () => {
    pathPlan = gridClient.navigator.getPathplan();
    axios.post("http://0.0.0.0:5000/pathplan",JSON.stringify(pathPlan))
    .then(function (response: any) {
      if (response.status === 201) {
        console.log("Path plan saved")
      }
  })
  .catch(function (error: any) {
      alert("Error saving path plan");
  });
  }

=======
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
  const toggleOptions = () => {
    setShowOptions(!showOptions);
    setIsRotated(!isRotated);
  };

  const selectedModeListButton = (id: string) => {
    id == selectedOption ? setSelectedOption("") : ""
    selectedOption == "" ? setSelectedOption(id) : ""
  };

  const ModeListFunction = (id: string) => () => {
    // Define a map of id to corresponding functions
    const idToFunctionMap: { [key: string]: () => void } = {
      "mode-list-1": singlePoint,
      "mode-list-2": multiPoint,
      "mode-list-3": setHomeBase,
      "mode-list-4": initPose
    };

    // Retrieve the corresponding function from the map using the id
    const selectedFunction = idToFunctionMap[id];

    // Call the selected function if it exists
    if (selectedFunction) {
      selectedModeListButton(id); // Call selectedModeListButton regardless of the function
      selectedFunction(); // Call the corresponding function
    }
  };

  const deletePinPoint = () => {
    if (selectedOption == "mode-list-1" || selectedOption == "mode-list-2") {
      setDeleteConfirmation(!deleteConfirmation)
      deleteConfirmation ? removeallMarker() : ""
    }
  }

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

  const handlePseudo = () => { }

  const handleCloseButtonClick = () => {
    setShowConfirmDialog(true); // or false, depending on your logic
  };

  const handleControlInstructionClick = () => {
    setShowControlInstruction(false);
    sessionStorage.setItem('firstLoadMappingPage', 'false')
    setFirstLoaded('false')
  };

  const handleInfoIconClick = () => {
    setShowControlInstruction(!showControlInstruction); // Toggle the state
  };

  const handleEmergencyStatus = () => {
    setEmergencyStatus((prevStatus) => {
      const newStatus = !prevStatus;
      localStorage.setItem('emergencyStatus', JSON.stringify(newStatus));
      return newStatus;
    });
  };

  return (
    <>
      {" "}

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
<<<<<<< HEAD
              <div
                id="setFocusBtn"
                className={styles.stopButton}
                onClick={() => {
                  focusView();
                }}
              >
                <p>Focus View</p>
                <img src="/icons/focus_button.svg" alt="" />
              </div>

              <div
                className={styles.stopButton}
                onClick={() => {
                  savePathplan();
                }}
              >
                <p>Save Path Plan</p>
              </div>
              
=======

              <div className={styles.lidarButton}>
                {/* <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                  <span className={styles.slider}></span>
                </label> */}
                <LidarSwitch backendUrl={backendUrl} onData={handleLidarStatus} />
              </div>

>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
            </div>
          </div>

          <MobileTopSection onConfirmButtonClick={handleCloseButtonClick} />

<<<<<<< HEAD
              {/* <div className={`${styles.mobileNavigationSection}`}> */}
              <div className={`${styles.displayNone} ${styles.controlLidarButton}`}>
                <div className={`${styles.lidarButton} ${lidarExtend ? styles.mainLidarButtonActive : ""}`} onClick={handleLidarExtend}>
                  {lidarExtend ? <img src="/icons/plus.svg" alt="" /> : <img src="/icons/minus.svg" alt="" />}
                </div>
                {lidarExtend ? (
                  <>
                    <div className={`${styles.lidarButton}`} onClick={startNavigation}>
                      <img src="/icons/3.svg" alt="" />
                    </div>
                    <div className={`${styles.lidarButton}`} onClick={pauseNavigation}>
                      <img src="/icons/1.svg" alt="" />
                    </div>
                    <div className={`${styles.lidarButton}`} onClick={returnToHome}>
                      <img src="/icons/Home.svg" alt="" />
                    </div>
                  </>
                ) : ""}
              </div>
=======
          <div className={styles.mobileDisplayNone}>
            <CloseButton onClick={onConfirmButtonClick} />
          </div>
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64


          <div className={styles.unitParents}>
            <MobileLidarSection // Use the new component here
              isChecked={isChecked}
              handleCheckboxChange={handleCheckboxChange}
            />

<<<<<<< HEAD
              <div id="setFocusBtn" className={`${styles.displayNone} ${styles.focusButton}`}
              onClick={() => {
                focusView();
              }}>
                <p>Focus View</p>
                <img src="/icons/focus_button.svg" alt="" />
              </div>
=======
            <div className={`${styles.navigation} ${styles.mobileDisplayNone}`}>
              <Navigation imageSrc={imageBlob ? URL.createObjectURL(imageBlob) : undefined} />
            </div>
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64

            <div className={`${styles.mapSection} ${mapPreview ? "" : styles.mapSectionWithoutPreview}`}>
              <div className={`${styles.topDiv} ${styles.mobileDisplayNone}`}>
                <p className={styles.runThePrototype}>Run the Prototype</p>
                <div
                  className={`${styles.playButton} ${status === "On Progress" ? styles.buttonActive : ""
                    }`}
                  onClick={() => {
                    if (lidarStatus) {
                      if (status != "On Progress") {
                        setRobot(true, false, false);
                        console.log("Play request sent");
                      }
                    }
                    else {
                      alert("Please turn on LIDAR first.")
                    }
                    startNavigation();
                  }}
                >
                  <p>Play</p>
                  <img src="/icons/3.svg" alt="" />
                </div>
                <div
                  className={`${styles.pauseButton} ${status === "Paused" ? styles.buttonActive : ""
                    }`}
                  onClick={(() => {
                    if (lidarStatus) {
                      setRobot(false, true, false);
                      console.log("Pause request sent");
                    } else {
                      alert("Please turn on LIDAR first.")
                    }
                    pauseNavigation();
                  })}
                >
                  <p>Pause</p>
                  <img src="/icons/1.svg" alt="" />
                </div>
                <div
                  className={styles.stopButton}
                  onClick={() => {
                    if (lidarStatus) {
                      setRobot(false, true, false);
                      console.log("Stop request sent");
                    } else {
                      alert("Please turn on LIDAR first.")
                    }
                    returnToHome();
                  }}
                >
                  <p>Return Home</p>
                  <img src="/icons/Home.svg" alt="" />
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
<<<<<<< HEAD
                  {selectedOption == "mode-list-4" ? <p>Finish Initial Pose</p> : <p>Initial Pose </p>}
=======
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
                </div>

                <div className={styles.topDivInformation}>
                  <img src="/icons/information-circle-svgrepo-com (1).svg" alt="" />
                  <p>Please add pinpoint(s) inside the pinpoint mode then exit to run the robot.</p>
                </div>

              </div>

              <div className={styles.centerDiv} id="map" onMouseMove={whenMouseMove} onMouseDown={whenMouseDown} onMouseUp={whenMouseUp} onTouchStart={whenTouchDown} onTouchMove={whenTouchMove} onTouchEnd={whenTouchUp}>
                {/* <div className={`${styles.mobileNavigationSection}`}> */}
                <div className={`${styles.displayNone} ${styles.controlLidarButton}`}>
                  <div className={`${styles.lidarButton} ${lidarExtend ? styles.mainLidarButtonActive : ""}`} onClick={handleLidarExtend}>
                    {lidarExtend ? <img src="/icons/plus.svg" alt="" /> : <img src="/icons/minus.svg" alt="" />}
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

                <div className={`${styles.displayNone} ${styles.controlButtonSection}`}>
                  <div className={`${styles.controlButton} ${controlExtend ? styles.mainControlButtonActive : ""}`} onClick={handleControlExtend}>
                    <img src="/icons/Dots.svg" alt="" />
                  </div>
                  {controlExtend ? <>
                    <div className={`${styles.controlButton} ${styles.controlButtonOption}`} onClick={zoomIn}>
                      <img src="/icons/zoomin.svg" alt="" />
                    </div>
                    <div className={`${styles.controlButton} ${styles.controlButtonOption}`} onClick={zoomOut}>
                      <img src="/icons/zoomout.svg" alt="" />
                    </div>
                    <div className={`${styles.controlButton} ${styles.controlButtonOption}`} onClick={restart}>
                      <img src="/icons/Maximize.svg" alt="" />
                    </div>
                    <div className={`${styles.controlButton} ${styles.controlButtonOption}`} onClick={rotateCW}>
                      <img src="/icons/new reload.svg" alt="" />
                    </div>
                  </> : ""}
                </div>


                <div className={`${styles.displayNone} ${styles.focusButton}`}>
                  <p>Focus View</p>
                  <img src="/icons/focus_button.svg" alt="" />
                </div>

                <div className={`${styles.displayNone} ${styles.modeListButtonSection}`}>
                  <div
                    className={`${styles.modeListButton}`}
                    onClick={toggleOptions}
                  >
                    <p>Mode List</p>
                    <img
                      src="/icons/down-arrow.svg"
                      alt=""
                      className={` ${isRotated ? styles.rotated : ''}`}
                    />
                  </div>

                  <div
                    id="mode-list-1"
                    className={`
                  ${showOptions || selectedOption === "mode-list-1" ? styles.modeListButton : styles.displayNone} 
                  ${selectedOption !== "" ? styles.disableModeListButton : ""} 
                  ${selectedOption !== "" && selectedOption === "mode-list-1" ? styles.activeDisableModeListButton : ""} 
                  ${styles.modeListButtonIcon} ${styles.textMarginMobileSection}`}
                    onClick={ModeListFunction("mode-list-1")}
                  >
                    <img src="/icons/Marker.svg" alt="" />
                    {selectedOption === "mode-list-1" ? <p>Finish Pinpoint</p> : <p>Single Pinpoint</p>}
                  </div>

                  <div id="mode-list-2"
                    className={`${showOptions || selectedOption == "mode-list-2" ? styles.modeListButton : styles.displayNone}  ${selectedOption != "" ? styles.disableModeListButton : ""} ${selectedOption != "" && selectedOption == "mode-list-2" ? styles.activeDisableModeListButton : ""} ${styles.modeListButtonIcon} ${styles.textMarginMobileSection} `}
                    onClick={ModeListFunction("mode-list-2")}
                  >
                    <img src="/icons/Marker.svg" alt="" />
                    {selectedOption == "mode-list-2" ? <p>Finish Pinpoint</p> : <p>Multiple Pinpoint</p>}
                  </div>

                  <div id="mode-list-3"
                    className={`${showOptions || selectedOption == "mode-list-3" ? styles.modeListButton : styles.displayNone}  ${selectedOption != "" ? styles.disableModeListButton : ""} ${selectedOption != "" && selectedOption == "mode-list-3" ? styles.activeDisableModeListButton : ""} ${styles.modeListButtonIcon} ${styles.textMarginMobileSection} `}
                    onClick={ModeListFunction("mode-list-3")}
                  >
                    <img src="/icons/Home.svg" alt="" />
                    {selectedOption == "mode-list-3" ? <p>Finish Home Base</p> : <p>Set Home Base</p>}
                  </div>

                  <div id="mode-list-4"
                    className={`${showOptions || selectedOption == "mode-list-4" ? styles.modeListButton : styles.displayNone}  ${selectedOption != "" ? styles.disableModeListButton : ""} ${selectedOption != "" && selectedOption == "mode-list-4" ? styles.activeDisableModeListButton : ""} ${styles.modeListButtonIcon} ${styles.textMarginMobileSection} `}
                    onClick={ModeListFunction("mode-list-4")}
                  >
                    <img src="/icons/Position.svg" alt="" />
                    {selectedOption == "mode-list-4" ? <p>Finish Home Base</p> : <p>Set Home Base</p>}
                  </div>

                  <div id="mode-list-5" className={`
                ${showOptions || selectedOption == "mode-list-1" || selectedOption == "mode-list-2" ? styles.modeListButton : styles.displayNone} 
                ${selectedOption !== "mode-list-1" && selectedOption !== "mode-list-2" ? styles.disableModeListButton : ""} 
                ${deleteConfirmation ? styles.deleteConfirmationTrue : ""} 
                ${styles.modeListButtonIcon} ${styles.deleteOption} ${styles.textMarginMobileSection}`} onClick={deletePinPoint}>
                    <img src="/icons/delete_mode_list.svg" alt="" />
                    <p>{deleteConfirmation ? "Click To Delete" : "Delete All Pinpoints"}</p>
                  </div>

                </div>


                <div className={`${styles.displayNone} ${styles.bottomSection}`}>

                  <div
                    className={`${styles.mobileStatus} ${status === "Idle" ? styles.idle : ""
                      }`}
                  >
                    <p>
                      Status : <span>{status}</span>
                    </p>
                  </div>

                  <div className={styles.mobileMapName}>ROOM_A</div>
                </div>

                {/* </div> */}

                <div className={`${styles.navigationSection}  ${styles.mobileDisplayNone}`}>

                  <div className={styles.mapPreview}>
                    <div id="preview-map" className={styles.map}>
                    </div>
                  </div>

                  <div className={`${styles.modeListSection}`}>
                    <div
                      className={`${styles.modeListParents} ${styles.modeListOption}`}
                      onClick={toggleOptions}
                    >
                      <p>Mode List</p>
                      <img
                        src="/icons/down-arrow.svg"
                        alt=""
                        className={`${styles.modeList} ${isRotated ? styles.rotated : ''}`}
                      />
                    </div>

                    <div
                      id="mode-list-1"
                      className={`${showOptions || selectedOption === "mode-list-1" ? "" : styles.displayNone} ${styles.modeListParents} ${styles.option} ${selectedOption !== "" ? styles.disableModeListButton : ""} ${selectedOption !== "" && selectedOption === "mode-list-1" ? styles.activeDisableModeListButton : ""}`}
                      onClick={ModeListFunction("mode-list-1")}
                    >
                      <img src="/icons/Marker.svg" alt="" />
                      {selectedOption === "mode-list-1" ? <p>Finish Pinpoint</p> : <p>Single Pinpoint</p>}
                    </div>

                    <div id="mode-list-2"
                      className={`${showOptions || selectedOption == "mode-list-2" ? "" : styles.displayNone} ${styles.modeListParents} ${styles.option} ${selectedOption != "" ? styles.disableModeListButton : ""} ${selectedOption != "" && selectedOption == "mode-list-2" ? styles.activeDisableModeListButton : ""}`}
                      onClick={ModeListFunction("mode-list-2")}
                    >
                      <img src="/icons/Marker.svg" alt="" />
                      {selectedOption == "mode-list-2" ? <p>Finish Pinpoint</p> : <p>Multiple Pinpoint</p>}
                    </div>

                    <div id="mode-list-3"
                      className={`${showOptions || selectedOption == "mode-list-3" ? "" : styles.displayNone} ${styles.modeListParents} ${styles.option} ${selectedOption != "" ? styles.disableModeListButton : ""} ${selectedOption != "" && selectedOption == "mode-list-3" ? styles.activeDisableModeListButton : ""}`}
                      onClick={ModeListFunction("mode-list-3")}
                    >
                      <img src="/icons/Home.svg" alt="" />
                      {selectedOption == "mode-list-3" ? <p>Finish Home Base</p> : <p>Set Home Base</p>}
                    </div>

                    <div id="mode-list-4"
                      className={`${showOptions || selectedOption == "mode-list-4" ? "" : styles.displayNone} ${styles.modeListParents} ${styles.option} ${selectedOption != "" ? styles.disableModeListButton : ""} ${selectedOption != "" && selectedOption == "mode-list-4" ? styles.activeDisableModeListButton : ""}`}
                      onClick={ModeListFunction("mode-list-4")}
                    >
                      <img src="/icons/Position.svg" alt="" />
                      {selectedOption == "mode-list-4" ? <p>Finish Initial Pose</p> : <p>Initial Pose</p>}
                    </div>
                    <div id="mode-list-5" className={`${showOptions || selectedOption == "mode-list-1" || selectedOption == "mode-list-2" ? "" : styles.displayNone} ${styles.modeListParents} ${styles.deleteOption} ${selectedOption !== "mode-list-1" && selectedOption !== "mode-list-2" ? styles.disableModeListButton : ""} ${deleteConfirmation ? styles.deleteConfirmationTrue : ""}`} onClick={deletePinPoint}>
                      <img src="/icons/delete_mode_list.svg" alt="" />
                      <p>{deleteConfirmation ? "Click To Delete" : "Delete All Pinpoints"}</p>
                    </div>

                  </div>


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
              handleMobileSorterDisplay={handlePseudo}
              mapIndex={true}
            />

            <ButtonInformation onClick={handleInfoIconClick} />
          </div>

<<<<<<< HEAD
          <div className={`${styles.displayNone} ${mapPreview ? styles.liveMapSection : ""}`}>
            <div className={styles.buttonLiveMapSection}>
              <div onClick={() => handleMapPreviewStatus(0)} className={`${styles.cameraButton} ${styles.buttonLiveMap} ${mapPreviewStatus === 0 ? styles.buttonActive : ""}`}>
                <img src="/icons/Camera.svg" alt="" />
                <p>Camera</p>
              </div>
              <div onClick={() => handleMapPreviewStatus(1)} className={`${styles.previewButton} ${styles.buttonLiveMap} ${mapPreviewStatus === 1 ? styles.buttonActive : ""}`}>
                <img src="/icons/mapping.svg" alt="" />
                <p>Preview</p>
              </div>
            </div>
            <div className={styles.previewMapLiveSection}>
            <div>
              <div style={{ display: mapPreviewStatus !== 0 ? 'none' : 'block' }}>
                 <img src="/images/camera.png" alt="" />
              </div>
              <div style={{ display: mapPreviewStatus !== 1 ? 'none' : 'block' }}>
                 <div id="mobilepreview-map" className={styles.map}></div>
              </div>
              {/* {mapPreviewStatus === 0 && (
                <div>
                  <img src="/images/camera.png" alt="" />
                </div>
              )}
              {mapPreviewStatus === 1 && (
                <div>
                  <div id="mobilepreview-map" className={styles.map}></div>
                </div>
              )} */}
            </div>
              {/* {mapPreviewStatus === 0 ? (<img src="/images/camera.png" alt="" />) : (<div id="mobilepreview-map" className={styles.map}></div>)} */}
            </div>
          </div>

          <div className={`${styles.displayNone} ${styles.mobileBottomSection}`}>
            <div className={`${styles.navigationMobileButton} ${styles.bottomSectionButton}`} onClick={() => handleMobileNavigation()}>
                <img src="/icons/list.svg" alt="" />
            </div>

            <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={handleMapPreview}>
                <img src="/icons/Webcam.svg" alt="" />
            </div>

            <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={() => handleMobileInstruction()}>
                <img src="/icons/information-circle-svgrepo-com.svg" alt="" />
            </div>

            <Footer status={false /* or false */} />
        </div>

          {/* <MapPreviewSection
            mapPreview={mapPreview}
            mapPreviewStatus={mapPreviewStatus}
            handleMapPreviewStatus={handleMapPreviewStatus}
          />

          <MobileBottomSection
            handleMobileNavigation={handleMobileNavigation}
            handleMapPreview={handleMapPreview}
            handleMobileInstruction={handleMobileInstruction}
          /> */}
          <div className={styles.mobileDisplayNone}>
            {/* <Footer status={false} /> */}
=======
          <div className={`${styles.footerSection} ${styles.mobileDisplayNone}`}>
            <Footer status={false} />
>>>>>>> 9e3ff783c203b69c4228638b5010c9b05710bf64
          </div>

        </div>
      </div>
    </>
  );
}

export default ControlIndex;
