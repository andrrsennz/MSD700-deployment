import { MouseEvent, useEffect, useRef, useState } from "react";
import ConfirmElement from "../../components/confirm-element/confirmElement";
import Navigation from "../../components/unit-navigation/navigation";
import styles from "./controlIndex.module.css";
import CloseButton from "../../components/close-button/closeButton";
import Footer from "../../components/footer/footer";
import MapSaving from "../../components/map-saving/mapSaving";
import ConfirmSaving from "../../components/confirm-saving-mapping/confirmSaving";
import axios from "axios";

var ros: any
var viewer: any
var paN: any
var movecoor: any = [];
var isDrag = false;
var startcoor: any = [];

export default function Mapping() {
  const [showConfirmClosePageDialog, setShowConfirmClosePageDialog] =
    useState<boolean>(false);
  const [showConfirmMappingDialog, setShowConfirmMappingDialog] =
    useState<boolean>(false);
  const [savingConfirmDialog, setSavingConfirmDialog] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Idle");
  const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || "http://localhost:5000");

  const onConfirmButtonClick = () => {
    setShowConfirmClosePageDialog(true);
  };

  const onConfirmMappingButtonClick = () => {
    setShowConfirmMappingDialog(true);
  };

  const handleCancel = () => {
    setShowConfirmClosePageDialog(false);
  };

  const handleDatabaseCancel = () => {
    setShowConfirmMappingDialog(false);
  };

  const changeStatus = (newStatus: string) => {
    isChecked === true ? setStatus(newStatus) : setStatus("Idle");
  };

  const onConfirmSaveMappingButtonClick = () => {
    setSavingConfirmDialog(true);
  };

  const setLidar = (enable: boolean, use_own_map: boolean): void => {
    axios.post(`${backendUrl}/api/lidar`, {
      enable: enable,
      use_own_map: use_own_map
    })
      .then(function (response: any) {
        console.log(response);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }

  const setRobot = (start: boolean, pause: boolean, stop: boolean): void => {
    /*for now the logic is the same as pause because sending stop
      because sending stop will save the map to the robot
      also, the API should be a path planning API not exploration
      mapping API.*/
    axios.post(`${backendUrl}/api/mapping`, {
      start: start,
      pause: pause,
      stop: stop
    })
      .then(function (response: any) {
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
        }
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }

  const setOwnMap = (enable: boolean, map_name: string): void => {
    axios.post(`${backendUrl}/api/set_own_map`, {
      enable: enable,
      map_name: map_name
    })
      .then(function (response: any) {
        console.log(response);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the new checkbox value
    setIsChecked(event.target.checked);
    // isChecked === false ? changeStatus("Idle") : "";
    if (event.target.checked) {
      setOwnMap(true, sessionStorage.getItem("mapName") || '');
      setLidar(true, true);
    } else {
      setOwnMap(false, '');
      setLidar(false, false);
    }
  };

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to ROS.
    const ROSLIB = (window as any).ROSLIB;
    ros = new ROSLIB.Ros({
      url: process.env.WS_ROSBRIDGE_URL,
    });

    // Handle ROS connection errors
    ros.on('error', (error: Error) => {
      console.error('Error connecting to ROS:', error);
      // You can handle the error here, such as displaying a message to the user.
      // For example:
      // showErrorMessage('Failed to connect to ROS. Please check the connection.');
    });

    // Handle ROS connection closure
    ros.on('close', () => {
      console.log('Connection to ROS is closed.');
      // You can handle connection closure here if needed.
    });

    // Create the main viewer.
    viewer = new (window as any).ROS2D.Viewer({
      divID: 'map',
      // width: mapRef.current?.clientWidth || 1070,
      // height: mapRef.current?.clientHeight || 670,
      width: 2500,
      height: 2000,
      background: "#7F7F7F",
    });

    paN = new (window as any).ROS2D.PanView({
      rootObject: viewer.scene,
    });

    // Setup the map client.
    var gridClient = new (window as any).ROS2D.OccupancyGridClient({
      ros: ros,
      rootObject: viewer.scene,
      viewer: viewer,
      continuous: true,
    });

    gridClient.on('change', function () {
      console.log("gridClient.currentGrid.pose.position.x : ", gridClient.currentGrid.pose.position.x);
      console.log("gridClient.currentGrid.pose.position.y : ", gridClient.currentGrid.pose.position.y);
      viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
      viewer.shift(-9, -43);
    })

    var zoomView = new (window as any).ROS2D.ZoomView({
      rootObject: viewer.scene
    });


    // Setup the map client if ROS is connected
    ros.on('connection', () => {
      console.log('Connected to ROS websocket server.');
    });

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

  const restart = () => {
    var zoom = new (window as any).ROS2D.ZoomView({
      ros: ros,
      rootObject: viewer.scene,
    });
    zoom.startZoom(250, 250);
    var result = zoomCrossConst.reduce((accumulator, currentValue) => accumulator * currentValue, 1);
    var newConst = 1 / result;
    zoom.zoom(newConst)
    zoomCrossConst = []
  }

  const whenMouseDown = (event: MouseEvent) => {
    paN.startPan(event.clientX, event.clientY);
    isDrag = true;
    startcoor[0] = event.clientX;
    startcoor[1] = event.clientY;
    // paN.pan(event.clientX,event.clientY)
    // onMouseMove(event)
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
      <div className={styles.container}>
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
            <Navigation />
          </div>
          <div className={styles.mapSection}>
            <div className={styles.topDiv}>
              <p>Run the Prototype</p>
              <div
                className={`${styles.playButton} ${status === "On Progress" ? styles.buttonActive : ""
                  }`}
                onClick={() => {
                  if (isChecked) {
                    setRobot(true, false, false);
                    console.log("Play request sent");
                  }
                  else {
                    alert("Please turn on LIDAR first.")
                  }
                }}
              >
                <p>Play</p>
                <img src="/icons/3.svg" alt="" />
              </div>
              <div
                className={`${styles.pauseButton} ${status === "Idle" ? styles.buttonActive : ""
                  }`}
                onClick={(() => {
                  if (isChecked) {
                    setRobot(false, true, false);
                    console.log("Pause request sent");
                  } else {
                    alert("Please turn on LIDAR first.")
                  }
                })}
              >
                <p>Pause</p>
                <img src="/icons/1.svg" alt="" />
              </div>
              <div
                className={styles.stopButton}
                onClick={() => {
                  if (isChecked) {
                    setRobot(false, true, false);
                    console.log("Stop request sent");
                  } else {
                    alert("Please turn on LIDAR first.")
                  }
                }}
              >
                <p>Return Home</p>
                <img src="/icons/Home.svg" alt="" />
              </div>
              <div className={styles.settingsButton}>
                <img src="/icons/information-circle-svgrepo-com (1).svg" alt="" />
                <p>
                  Double-click to add the pinpoint <br /> Double-click again to remove
                  the pinpoint
                </p>
              </div>
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
                  <img src="/icons/reset.svg" alt="" />
                </div>
              </div>
              {/* <img src="/icons/Frame.svg" alt="" /> */}
            </div>
          </div>
          {/* <Footer status={false} /> */}
        </div>
      </div>
    </>
  );
}
