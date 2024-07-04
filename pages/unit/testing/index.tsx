import { useState } from "react";
import EmergencyButton from "@/components/emergency-button/emergencyButton";
import LidarSwitch from "@/components/lidar-switch/lidarSwitch";
import { ReduxProvider } from "@/app/reduxProvider";
import styles from "./testing.module.css";

const Testing = () => {
    const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || "http://localhost:5000");
    const [lidarStatus, setLidarStatus] = useState(false);
    const [mapPreview, setMapPreview] = useState(false);
    const [status, setStatus] = useState<string>("Idle");
    const [buttonMapStatus, setButtonMapStatus] = useState<string>()
    const [playButtonClicked, setPlayButtonClicked] = useState<boolean>(false);
    const [stopButton, setStopButton] = useState<boolean>(false);
    const [count, setcount] = useState<Number>(0);

    const handleLidarStatus = (childData: any) => {
        setLidarStatus(childData);
    };

    const changeStatus = (newStatus: string): void => {
        lidarStatus === true ? setStatus(newStatus) : setStatus("Idle");
    };


    const setMapping = (start: boolean, pause: boolean, stop: boolean): void => {

        sessionStorage.setItem('mappingStart', start.toString());
        sessionStorage.setItem('mappingPause', pause.toString());
        sessionStorage.setItem('mappingStop', stop.toString());

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
            setStopButton(false)
            setButtonMapStatus('')
            setPlayButtonClicked(false)
        }

    }
    return (
        <ReduxProvider>

            <h1>asodkoasdk</h1>
            <LidarSwitch backendUrl={backendUrl} onData={handleLidarStatus} />

            <div className={`${styles.mapSection} ${mapPreview ? "" : styles.mapSectionWithoutPreview}`}>
                <div className={`${styles.topDiv} ${styles.mobileDisplayNone}`}>
                    <p className={styles.runThePrototype}>Create a New Map</p>
                    <div
                        className={`${styles.playButton} ${status == "On Progress" ? styles.buttonActive : ""}`}
                        onClick={() => {
                            if (lidarStatus) {
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
                            if (lidarStatus) {
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
                            if (lidarStatus) {
                                if (buttonMapStatus == 'play' || buttonMapStatus == 'pause') {
                                    // setShowConfirmMappingDialog(true);
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
                            // focusView();
                        }}
                    >
                        <p>Focus View</p>
                        <img src="/icons/Position.svg" alt="" />
                    </div>

                </div>
            </div>

        </ReduxProvider>


    )
}

export default Testing;