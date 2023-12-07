import { useState, ChangeEvent, useEffect, useRef } from "react";
import ConfirmElement from "../../../components/confirm-element/confirmElement";
import Navigation from "../../../components/unit-navigation/navigation";
import styles from "./mapping.module.css";
import CloseButton from "../../../components/close-button/closeButton";
import Footer from "../../../components/footer/footer";
import MapSaving from "../../../components/map-saving/mapSaving";
import ConfirmSaving from "../../../components/confirm-saving-mapping/confirmSaving";
import Script from "next/script";
import axios from "axios";

interface MappingProps { }

export default function Mapping(props: MappingProps): JSX.Element {
    const [showConfirmClosePageDialog, setShowConfirmClosePageDialog] =
        useState<boolean>(false);
    const [showConfirmMappingDialog, setShowConfirmMappingDialog] =
        useState<boolean>(false);
    const [savingConfirmDialog, setSavingConfirmDialog] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Idle");
    const [backendUrl, setBackendUrl] = useState<string>("http://localhost:5000/api/mapping");

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

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setIsChecked(event.target.checked);
    };

    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {


        function init() {
            // Connect to ROS.
            const ROSLIB = (window as any).ROSLIB;
            const ros = new ROSLIB.Ros({
                url: 'ws://10.147.17.198:9090',
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
                width: mapRef.current?.clientWidth || 1050,
                height: mapRef.current?.clientHeight || 650,
            });

            // Setup the map client if ROS is connected
            ros.on('connection', () => {
                const gridClient = new (window as any).ROS2D.OccupancyGridClient({
                    ros: ros,
                    rootObject: viewer.scene,
                });

                // Scale the canvas to fit the map
                gridClient.on('change', () => {
                    viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
                    viewer.shift(-25, -25);
                });
            });
        }



        // Call init on component mount
        init();
    }, []);

    return (
        <>
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
                            <p>Create a New Map</p>
                            <div
                                className={`${styles.playButton} ${status == "On Progress" ? styles.buttonActive : ""
                                    }`}
                                onClick={() => {
                                    if (isChecked) {
                                        console.log("Play request sent");
                                        axios.post(backendUrl, {
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
                                    } else {
                                        alert("Please turn on the LIDAR before mapping.");
                                    }
                                }}
                            >
                                <p>Play</p>
                                <img src="/icons/3.svg" alt="" />
                            </div>
                            <div
                                className={`${styles.pauseButton} ${status == "Idle" ? styles.buttonActive : ""
                                    }`}
                                onClick={() => {
                                    if (isChecked) {          
                                        console.log("Pause request sent");       
                                        axios.post(backendUrl, {
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
                                        alert("Please turn on the LIDAR before mapping.");
                                    }
                                }}
                            >
                                <p>Pause</p>
                                <img src="/icons/1.svg" alt="" />
                            </div>
                            <div
                                className={styles.stopButton}
                                onClick={() => {
                                    if (isChecked) {
                                        console.log("Stop request sent");
                                        axios.post(backendUrl, {
                                            start: false,
                                            pause: false,
                                            stop: true
                                        })
                                        .then(function (response) {
                                            console.log(response);
                                            changeStatus("Idle");
                                            alert("Map saved successfully.")
                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                            alert("Stop error. Please try again.")
                                        });
                                    }
                                    else {
                                        alert("Please turn on the LIDAR before mapping.");
                                    }
                                }}
                            >
                                <p>Stop</p>
                                <img src="/icons/2.svg" alt="" />
                            </div>
                            <div className={styles.settingsButton}>
                                <img src="/icons/Setting.svg" alt="" />
                                <p>Please turn on the LIDAR before mapping.</p>
                            </div>
                        </div>
                        <div className={styles.centerDiv} id="map">
                            {/* <img src="/icons/Frame.svg" alt="" /> */}
                        </div>
                    </div>
                    <Footer status={false} />
                </div>
            </div>


            <Script src="/script/Nav2D.js" strategy="beforeInteractive" />
            <Script src="/script/roslib.js" strategy="beforeInteractive" />
            <Script src="/script/eventemitter2.min.js" strategy="beforeInteractive" />
            <Script src="/script/easeljs.js" strategy="beforeInteractive" />
            <Script src="/script/ros2d.js" strategy="beforeInteractive" />
        </>
    );
}
