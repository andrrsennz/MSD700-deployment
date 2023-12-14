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
  const [status, setStatus] = useState<string>("On Progress");
  const [isDrag, setIsDrag] = useState(false);
  const [startcoor, setStartCoor] = useState<any>([]);
  const [movecoor, setMoveCoor] = useState<any>([]);

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
    isChecked === false ? setStatus(newStatus) : setStatus("Idle");
  };

  const onConfirmSaveMappingButtonClick = () => {
    setSavingConfirmDialog(true);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state with the new checkbox value
    setIsChecked(event.target.checked);
    isChecked === false ? changeStatus("Idle") : "";
  };

  const mapRef = useRef<HTMLDivElement>(null);

  var ros: any
  var viewer: any
  var paN: any

  useEffect(() => {
    // Connect to ROS.
    const ROSLIB = (window as any).ROSLIB;
    ros = new ROSLIB.Ros({
      url: 'ws://10.147.17.198:9090',
    });

    // Handle ROS connection errors
    ros.on('error', (error: Error) => {
      console.error('Error connecting to ROS:', error);
    });

    // Handle ROS connection closure
    ros.on('close', () => {
      console.log('Connection to ROS is closed.');
      // You can handle connection closure here if needed.
    });

    const subs = new ROSLIB.Topic({
      ros: ros,
      name: "/odom",
      messageType: "nav_msgs/Odometry",
    });

    subs.subscribe((message: any) => {
      console.log(message.twist.twist.linear.x);
    });

    // Create the main viewer.
    viewer = new (window as any).ROS2D.Viewer({
      divID: 'map',
      width: mapRef.current?.clientWidth || 1070,
      height: mapRef.current?.clientHeight || 670,
      background: "#7F7F7F",
    });

    paN = new (window as any).ROS2D.PanView({
      rootObject: viewer.scene
    })

    // Setup the map client.
    var gridClient = new (window as any).NAV2D.OccupancyGridClientNav({
      ros: ros,
      rootObject: viewer.scene,
      viewer: viewer,
      withOrientation: true,
      continuous: true
    });

    // Setup the map client if ROS is connected
    ros.on('connection', () => {
      console.log('Connected to websocket server.');
    });

  }, []);

  const slamRef = useRef<any>(null);

  const Pubs = () => {
    var pub = new (window as any).ROSLIB.Topic({
      ros: ros,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });
    var mess = new (window as any).ROSLIB.Message({
      linear: {
        x: 3,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    pub.publish(mess);
  }

  const Stop = () => {
    var pub = new (window as any).ROSLIB.Topic({
      ros: ros,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });
    var mess = new (window as any).ROSLIB.Message({
      linear: {
        x: 0,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    pub.publish(mess);
  }

  const zoomIn = () => {
    var zoom = new (window as any).ROS2D.ZoomView({
      ros: ros,
      rootObject: viewer.scene,
    });
    zoom.startZoom(250, 250);
    zoom.zoom(1.2);
  }


  const zoomOut = () => {
    var zoom = new (window as any).ROS2D.ZoomView({
      ros: ros,
      rootObject: viewer.scene,
    });
    zoom.startZoom(250, 250);
    zoom.zoom(0.8);
  }

  // const initializeListeners = () => {
  //   if (slamRef.current) {
  //     slamRef.current.addEventListener("mousedown", onMouseDown);
  //     document.addEventListener("mouseup", onMouseUp);
  //     document.addEventListener("mousemove", onMouseMove);
  //   }
  // }

  const onMouseDown = (event: MouseEvent) => {
    if (paN) {
      paN.startPan(event.clientX, event.clientY);
      setIsDrag(true);
      setStartCoor([event.clientX, event.clientY]);
    }
  }

  const onMouseUp = (event: MouseEvent) => {
    setIsDrag(false);
  }

  const mouseMove = () => {
    console.log("bbbb");
    // if (isDrag && paN) {
    //   paN.pan(event.clientX, event.clientY);
    //   setMoveCoor([event.clientX, event.clientY]);
    // }
  }


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
                onClick={() => changeStatus("On Progress")}
              >
                <p>Play</p>
                <img src="/icons/3.svg" alt="" />
              </div>
              <div
                className={`${styles.pauseButton} ${status === "Idle" ? styles.buttonActive : ""
                  }`}
                onClick={() => changeStatus("Idle")}
              >
                <p>Pause</p>
                <img src="/icons/1.svg" alt="" />
              </div>
              <div
                className={styles.stopButton}
                onClick={onConfirmMappingButtonClick}
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

            <div className={styles.centerDiv} id="map" onMouseMove={mouseMove}>
              <div className={styles.buttonNavigation}>
                <div className={styles.zoomIn} onClick={zoomIn}>
                  <img src="/icons/zoomin.svg" alt="" />
                </div>
                <div className={styles.zoomOut} onClick={zoomOut}>
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
