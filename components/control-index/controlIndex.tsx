import { useEffect, useRef, useState } from "react";
import ConfirmElement from "../../components/confirm-element/confirmElement";
import Navigation from "../../components/unit-navigation/navigation";
import styles from "./controlIndex.module.css";
import CloseButton from "../../components/close-button/closeButton";
import Footer from "../../components/footer/footer";
import MapSaving from "../../components/map-saving/mapSaving";
import ConfirmSaving from "../../components/confirm-saving-mapping/confirmSaving";
import axios from "axios";

export default function Mapping() {
  const [showConfirmClosePageDialog, setShowConfirmClosePageDialog] =
    useState<boolean>(false);
  const [showConfirmMappingDialog, setShowConfirmMappingDialog] =
    useState<boolean>(false);
  const [savingConfirmDialog, setSavingConfirmDialog] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Idle");
  const [backendUrl, setBackendUrl] = useState<string>("http://localhost:5000");

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
    .then(function (response:any) {
        console.log(response);
    })
    .catch(function (error:any) {
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
    .then(function (response:any) {
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
    .catch(function (error:any) {
        console.log(error);
    });
  }

  const setOwnMap = (enable: boolean, map_name: string): void => {
    axios.post(`${backendUrl}/api/set_own_map`, {
        enable: enable,
        map_name: map_name
    })
    .then(function (response:any) {
        console.log(response);
    })
    .catch(function (error:any) {
        console.log(error);
    });
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the new checkbox value
    setIsChecked(event.target.checked);
    // isChecked === false ? changeStatus("Idle") : "";
    if (event.target.checked) {
        setOwnMap(true, localStorage.getItem("mapName") || '');
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
    const ros = new ROSLIB.Ros({
      url: `ws://${localStorage.getItem("ip_address")}:9090`,
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
    const viewer = new (window as any).ROS2D.Viewer({
      divID: 'map',
      width: mapRef.current?.clientWidth || 1070,
      height: mapRef.current?.clientHeight || 670,
    });


    var zoomView = new (window as any).ROS2D.ZoomView({
      rootObject: viewer.scene
    });

    // Setup the map client.
    var gridClient = new (window as any).NAV2D.OccupancyGridClientNav({
      ros: ros,
      rootObject: viewer.scene,
      viewer: viewer,
      withOrientation: true
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

  const zoomMap = () => { }

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

            <div className={styles.centerDiv} id="map">
              <div className={styles.buttonNavigation}>
                <div className={styles.zoomIn} onClick={zoomMap}>
                  <img src="/icons/zoomin.svg" alt="" />
                </div>
                <div className={styles.zoomOut}>
                  <img src="/icons/zoomout.svg" alt="" />
                </div>
                <div className={styles.restart}>
                  <img src="/icons/reset.svg" alt="" />
                </div>
              </div>
              {/* <img src="/icons/Frame.svg" alt="" /> */}
            </div>
          </div>
          <Footer status={false} />
        </div>
      </div>
    </>
  );
}
