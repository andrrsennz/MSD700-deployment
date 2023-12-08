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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the new checkbox value
    setIsChecked(event.target.checked);
    // isChecked === false ? changeStatus("Idle") : "";
    if (event.target.checked) {
        axios.post(`${backendUrl}/api/set_own_map`, {
          enable: true,
          map_name: localStorage.getItem("mapName")
        }).then(function(response) {
          console.log(response);
        })
        .catch(function(error) {
          console.log(error);
        });

        axios.post(`${backendUrl}/api/lidar`, {
            enable: true,
            use_own_map: true
        })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    } else {
        axios.post(`${backendUrl}/api/set_own_map`, {
          enable: false,
          map_name: ''
        }).then(function(response) {
          console.log(response);
        })
        .catch(function(error) {
          console.log(error);
        });

        axios.post(`${backendUrl}/api/lidar`, {
            enable: false,
            use_own_map: false
        })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }
  };

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to ROS.
    const ROSLIB = (window as any).ROSLIB;
    const ros = new ROSLIB.Ros({
      url: 'ws://localhost:9090',
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
      console.log('Connected to websocket server.');
    });

    return () => {
      //clean up when exiting page
      ros.close();
      axios.post(`${backendUrl}/api/set_own_map`, {
        enable: false,
        map_name: ''
      }).then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });

      axios.post(`${backendUrl}/api/lidar`, {
          enable: false,
          use_own_map: false
      })
      .then(function (response) {
          console.log(response);
      })
      .catch(function (error) {
          console.log(error);
      });
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
                    console.log("Play request sent");
                    axios.post(`${backendUrl}/api/mapping`, {
                      start: true,
                      pause: false,
                      stop: false
                    })
                    .then(function (response) {
                      console.log(response);
                      changeStatus("On Progress");
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("Start error. Please try again.")
                    });
                  }
                  else {
                    alert("Please enable LIDAR first.")
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
                    console.log("Pause request sent");
                    axios.post(`${backendUrl}/api/mapping`, {
                      start: false,
                      pause: true,
                      stop: false
                    })
                    .then(function (response) {
                      console.log(response);
                      changeStatus("Paused");
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("Pause error. Please try again.")
                    });
                    } else {
                      alert("Please enable LIDAR first.")
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
                    /*for now the logic is the same as pause because sending stop
                      because sending stop will save the map to the robot
                      also, the API should be a path planning API not exploration
                      mapping API.*/
                    axios.post(`${backendUrl}/api/mapping`, {
                      start: false,
                      pause: true,
                      stop: false
                    })
                    .then(function (response) {
                      console.log(response);
                      changeStatus("Idle");
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("Stop error. Please try again.")
                    });
                    console.log("Stop request sent");
                  } else {
                    alert("Please enable LIDAR first.")
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
