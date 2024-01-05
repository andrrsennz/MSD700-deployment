"use client";


import Image from "next/image";
import { useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import styles from "./dashboard.module.css";

export default function Dashboard(): JSX.Element {
    const router = useRouter();

    if (typeof window !== "undefined") {
        // Code using sessionStorage
        sessionStorage.getItem("mapIndex") === null
            ? sessionStorage.setItem("mapIndex", "-1") // Ensure setting string "0"
            : "";
    }

    const [showUtilSection, setShowUtilSection] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const onProceedButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        // const ip_address = (document.getElementById("ipAddress") as HTMLInputElement).value
        // sessionStorage.setItem("ip_address", ip_address);
        setShowUtilSection(true);
    };

    const onConfirmButtonClick = (): void => {
        setShowConfirmDialog(true);
    };

    const handleCancel = (): void => {
        setShowConfirmDialog(false);
    };

    const goToUnitPage = (): void => {
        router.push("/unit/control");
    };

    return (
        <div className={styles.parents}>
            <ConfirmElement
                message="Are you sure you want to close this app?"
                status={showConfirmDialog}
                onCancel={handleCancel}
            />
            <div className={styles.centeredContent}>
                <CloseButton onClick={onConfirmButtonClick} />
                <div className={styles.greetings}>
                    <p>Hello Username, welcome to the MSD700 application!</p>
                </div>

                <div className={styles.dataSection}>
                    <div>
                        <div className={styles.labelSection}>
                            <p>
                                <span>
                                    <Image
                                        src="/icons/information-circle-svgrepo-com.svg"
                                        alt="Picture of the author"
                                        width={500}
                                        height={500}
                                    />
                                </span>
                                Please input your MSD700 unit data.
                            </p>
                        </div>
                        <div className={styles.inputSection}>
                            <form action="#" method="post">
                                <div className={styles.inputUnit}>
                                    <label htmlFor="unitID">Unit ID</label>
                                    <p className={styles.separateElement}>:</p>
                                    <input
                                        type="text"
                                        id="unitID"
                                        name="unitID"
                                        defaultValue="Unit A"
                                        required
                                    />
                                </div>

                                {/* <div className="inputUnit">
                  <label htmlFor="ipAddress">IP Address</label>
                  <p className="separateElement">:</p>
                  <input
                    type="text"
                    id="ipAddress"
                    name="ipAddress"
                    defaultValue="10.147.17.198"
                    required
                  />
                </div> */}
                                <button
                                    type="submit" // Specify the type as submit
                                    onClick={onProceedButtonClick}
                                >
                                    Proceed
                                </button>
                            </form>
                        </div>
                    </div>

                    <div
                        className={`${styles.util_section} ${showUtilSection === true ? styles.showClass : styles.hideClass}`}
                    >
                        <Image
                            src="/images/MSD700.png"
                            alt="Picture of the author"
                            width={350}
                            height={264}
                        />
                        <div className={styles.dataUtil}>
                            <form action="#" method="post">
                                <div className={styles.inputUnit}>
                                    <label htmlFor="battery">Battery</label>
                                    <p className={styles.separateElement}>:</p>
                                    <input
                                        type="text"
                                        id="battery"
                                        name="battery"
                                        defaultValue="50%"
                                        required
                                    />
                                </div>

                                <div className={styles.inputUnit}>
                                    <label htmlFor="uptime">Uptime</label>
                                    <p className={styles.separateElement}>:</p>
                                    <input
                                        type="text"
                                        id="uptime"
                                        name="uptime"
                                        defaultValue="05:33:00"
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        <button
                            onClick={goToUnitPage}
                            aria-label="Submit form Button"
                            className={styles.submitButton}
                        >
                            <p>Login</p>
                            <Image
                                src="/icons/arrow-right-3-svgrepo-com (1).svg"
                                alt=""
                                width={500}
                                height={500}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.theFooter}>
                <Footer status={true} />
            </div>
        </div>
    );
}
