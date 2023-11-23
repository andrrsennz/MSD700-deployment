import { useState, ChangeEvent } from "react";
import ConfirmElement from "../../../components/confirm-element/confirmElement";
import Navigation from "../../../components/unit-navigation/navigation";
import styles from "./mapping.module.css";
import CloseButton from "../../../components/close-button/closeButton";
import Footer from "../../../components/footer/footer";
import MapSaving from "../../../components/map-saving/mapSaving";
import ConfirmSaving from "../../../components/confirm-saving-mapping/confirmSaving";

interface MappingProps { }

export default function Mapping(props: MappingProps): JSX.Element {
    const [showConfirmClosePageDialog, setShowConfirmClosePageDialog] =
        useState<boolean>(false);
    const [showConfirmMappingDialog, setShowConfirmMappingDialog] =
        useState<boolean>(false);
    const [savingConfirmDialog, setSavingConfirmDialog] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("On Progress");

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
        isChecked === false ? setStatus(newStatus) : setStatus("Idle");
    };

    const onConfirmSaveMappingButtonClick = (): void => {
        setSavingConfirmDialog(true);
    };

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setIsChecked(event.target.checked);
        isChecked === false ? changeStatus("Idle") : "";
    };

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
                                onClick={() => changeStatus("On Progress")}
                            >
                                <p>Play</p>
                                <img src="/icons/3.svg" alt="" />
                            </div>
                            <div
                                className={`${styles.pauseButton} ${status == "Idle" ? styles.buttonActive : ""
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
                                <p>Stop</p>
                                <img src="/icons/2.svg" alt="" />
                            </div>
                            <div className={styles.settingsButton}>
                                <img src="/icons/Setting.svg" alt="" />
                                <p>Please turn on the LiDAR before mapping.</p>
                            </div>
                        </div>

                        <div className={styles.centerDiv}>
                            <img src="/icons/Frame.svg" alt="" />
                        </div>
                    </div>
                    <Footer status={false} />
                </div>
            </div>
        </>
    );
}
