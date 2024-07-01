"use client";


import Image from "next/image";
import { useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import styles from "./signup.module.css";

import AutoplayCarousel from "@/components/carousel/AutoplayCarousel";
import axios from "axios";

import Head from "next/head";
import ConfirmRegister from "@/components/confirm-register-user/confirmRegister";
import MobileTopSection from "@/components/mobile-top-section/mobileTopSection";

export default function Signup(): JSX.Element {
    const router = useRouter();

    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);

    const [usernameColumn, setUsernameColumn] = useState<string>("");
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [isUsernameRegistered, setIsUsernameRegistered] = useState<boolean>(false);

    const [fullNameColumn, setFullNameColumn] = useState<string>("");
    const [isFullNameValid, setIsFullNameValid] = useState(true);

    const [emailColumn, setEmailColumn] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isEmailRegistered, setIsEmailRegistered] = useState<boolean>(false);

    const [passwordColumn, setPasswordColumn] = useState<string>("");
    const [confirmPasswordColumn, setConfirmPasswordColumn] = useState<string>("");
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const [instructionShowed, setInstructionShowed] = useState<boolean>(false);
    const [mobileShowAnimation, setMobileShowAnimation] = useState<boolean>(false);


    const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || "http://localhost:5000");

    const onConfirmButtonClick = (): void => {
        setShowConfirmDialog(true);
    };

    const handleCancel = (): void => {
        setShowConfirmDialog(false);
    };

    const [formValues, setFormValues] = useState({
        username: '',
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });

        // If we are changing the username, reset the attemptedSubmit and set isUsernameValid to true
        if (name === 'username') {
            setUsernameColumn(value)
            setIsUsernameValid(true)
        }

        if (name === 'fullname') {
            setFullNameColumn(value)
            setIsFullNameValid(true)
        }

        if (name === 'email') {
            setEmailColumn(value)
            setIsEmailValid(true)
        }

        if (name === 'password') {
            setPasswordColumn(value)
            setIsPasswordValid(true)

            if (passwordColumn == confirmPasswordColumn) {
                setIsConfirmPasswordValid(true)
            } else {
                setIsConfirmPasswordValid(false)
            }
        }

        if (name === 'confirmPassword') {
            setConfirmPasswordColumn(value)
            if (passwordColumn == value) {
                setIsConfirmPasswordValid(true)
            } else {
                setIsConfirmPasswordValid(false)
            }
            // setIsConfirmPasswordValid(true)
        }
    };


    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Mark that a submit attempt has been made
        setAttemptedSubmit(true);

        const isUsernameFilled = formValues.username.trim() !== '';
        if (!isUsernameFilled) {
            setIsUsernameValid(false);
        } else {
            setIsUsernameRegistered(false)
            setAttemptedSubmit(false);
            axios.post(`${backendUrl}/user/check-username`, {
                username: usernameColumn
            })
                .then(function (response: any) {
                    // if (response.status === 200) {
                    //     setIsUsernameRegistered(false);
                    //     setIsUsernameValid(true);
                    // }
                    // else {
                    //     setIsUsernameRegistered(true)
                    //     setIsUsernameValid(false);
                    // }
                })
                .catch(function (error: any) {
                    // setIsUsernameRegistered(true)
                    // setIsUsernameValid(false);
                });
        }

        const isFullNameFilled = formValues.fullname.trim() !== '';
        if (!isFullNameFilled) {
            setIsFullNameValid(false);
        }

        const isEmailFilled = formValues.email.trim() !== '';
        if (!isEmailFilled) {
            setIsEmailValid(false);
        }

        const isPasswordFilled = formValues.password.trim() !== '';
        if (!isPasswordFilled) {
            setIsPasswordValid(false);
        }

        const isConfirmPasswordFilled = formValues.confirmPassword.trim() !== '';
        if (!isConfirmPasswordFilled) {
            setIsConfirmPasswordValid(false);
        }

        // If any input is invalid, return early and don't proceed with form submission
        if (!isUsernameFilled || !isUsernameValid || isUsernameRegistered || !isFullNameFilled ||
            !isEmailFilled || !isEmailValid || isEmailRegistered || !isPasswordValid || !isConfirmPasswordValid) {
            alert("Error creating user");
            return;
        }

        // If all validations pass, proceed with form submission
        axios.post(`${backendUrl}/user/register`, {
            username: formValues.username,
            full_name: formValues.fullname,
            email: formValues.email,
            password: formValues.password,
        })
            .then(function (response: any) {
                if (response.status === 201) {
                    setShowRegisterDialog(true); // Set the register dialog to show

                    // Use setTimeout to navigate to the home page after 1.5 seconds
                    setTimeout(() => {
                        router.push("/");
                    }, 1500); // 1500 milliseconds = 1.5 seconds
                }
            })
            .catch(function (error: any) {
                alert("Error creating user");
            });
    };

    const goToSigninPage = (): void => {
        router.push("/");
    }

    const setMobileAnimation = () => {
        setMobileShowAnimation(!mobileShowAnimation)
    }

    const handleCloseButtonClick = () => {
        setShowConfirmDialog(true); // or false, depending on your logic
    };

    return (
        <>
            <Head>
                <title>Sign Up</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <ConfirmElement
                message="Are you sure you want to close this app?"
                status={showConfirmDialog}
                onCancel={handleCancel}
            />
            <ConfirmRegister status={showRegisterDialog} />

            {mobileShowAnimation ? (
                <div className={`${styles.mobileRegisterUnit} ${styles.displayNone} ${styles.mobileDisplayFlex}`} onClick={setMobileAnimation}>
                    <div className={styles.registerContainer}>
                        <div className={styles.imageAnimation}>
                            <AutoplayCarousel />
                        </div>
                        <div className={styles.information}>
                            <h1 className={styles.mainTitleInformation}>MSD700</h1>
                            <div className={styles.feature}>
                                <h3>Features</h3>
                                <ul>
                                    <li>Blade / bucket type</li>
                                    <li>Backhoe / dump type</li>
                                    <li>Customized to suit on-site conditions</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div >) : ""
            }



            <div className={styles.container}>
                {/* --------------------------- Mobile Section  ------------------------------*/}
                <MobileTopSection onConfirmButtonClick={handleCloseButtonClick} />
                {/* -----------------------------------------------------------------------*/}

                <div className={styles.parents}>

                    <div className={styles.mobileHide}>
                        <CloseButton onClick={onConfirmButtonClick} />
                    </div>

                    <div className={`${styles.leftSide} ${styles.mobileHide}`}>
                        <div className={styles.imageAnimation}>
                            <AutoplayCarousel></AutoplayCarousel>
                        </div>
                        <div className={styles.information}>
                            <h1>MSD700</h1>
                            <div className={styles.feature}>
                                <p>Features</p>
                                <ul>
                                    <li>Blade / bucket type</li>
                                    <li>Backhoe / dump type</li>
                                    <li>Customized to suit on-site conditions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rightSide}>
                        <div className={styles.tagline}>
                            <p>Register Form</p>
                        </div>
                        <div className={styles.formSection}>
                            <form action="#" method="post">
                                <div className={styles.column}>
                                    <div className={styles.label}>
                                        <label htmlFor="username">Username</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isUsernameValid || isUsernameRegistered && formValues.username.trim() !== '' ? styles.invalid : ''} ${isUsernameValid ? "" : styles.redPlaceholder}`}>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder={isUsernameValid ? "" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                            autoComplete="off"
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isUsernameValid || isUsernameRegistered && formValues.username.trim() !== '' ? (
                                                <Image
                                                    src="/icons/Info-alert.svg"
                                                    alt="Alert icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : formValues.username.trim() !== '' ? (
                                                <Image
                                                    src="/icons/Check-circle.svg"
                                                    alt="Check icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : null}
                                        </div>

                                    </div>
                                    {isUsernameRegistered && formValues.username.trim() !== '' ?
                                        <div className={styles.tooltip}>
                                            <p>This name is already in use</p>
                                        </div> : null
                                    }
                                </div>
                                <div className={styles.column}>
                                    <div className={styles.label}>
                                        <label htmlFor="fullname">Full Name</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isFullNameValid ? styles.invalid : ''} ${isUsernameValid ? "" : styles.redPlaceholder}`}>
                                        <input
                                            type="text"
                                            id="fullname"
                                            name="fullname"
                                            placeholder={isFullNameValid ? "" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isFullNameValid ? (
                                                <Image
                                                    src="/icons/Info-alert.svg"
                                                    alt="Alert icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : formValues.fullname.trim() !== '' ? (
                                                <Image
                                                    src="/icons/Check-circle.svg"
                                                    alt="Check icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.column}>
                                    <div className={styles.label}>
                                        <label htmlFor="email">Email</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isEmailValid ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            placeholder={isEmailValid ? "" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isEmailValid ? (
                                                <Image
                                                    src="/icons/Info-alert.svg"
                                                    alt="Alert icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : formValues.email.trim() !== '' ? (
                                                <Image
                                                    src="/icons/Check-circle.svg"
                                                    alt="Check icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                    {!isEmailValid && formValues.email.trim() !== '' && (
                                        <div className={styles.tooltip}>
                                            <p>Wrong Email | Please fill in with the correct email e.g. email-name@gmail.com</p>
                                        </div>
                                    )}
                                    {
                                        // !isEmailValid && formValues.email.trim() !== '' ?
                                        //     <div className={styles.tooltip}>
                                        //         <p>This email is not valid</p>
                                        //     </div> :
                                        isEmailRegistered ?
                                            <div className={styles.tooltip}>
                                                <p>This email is already in use</p>
                                            </div> : null
                                    }
                                </div>
                                <div className={styles.passwordSection}>
                                    <div className={styles.divPasswordSection}>
                                        <div className={styles.label}>
                                            <label htmlFor="password">Password</label>
                                        </div>
                                        <div className={`${styles.iconStatusColumn} ${!isPasswordValid ? styles.invalid : ''}`}>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                placeholder={isPasswordValid ? "" : "Fill in this data"}
                                                required
                                                onChange={handleChange}
                                            />
                                            <div className={`${styles.iconStatusColumnButton} ${styles.iconStatusColumnPasswordButton}`}>
                                                {!isPasswordValid ? (
                                                    <Image
                                                        src="/icons/Info-alert.svg"
                                                        alt="Alert icon"
                                                        width={30}
                                                        height={30}
                                                    />
                                                ) : formValues.password.trim() !== '' ? (
                                                    <Image
                                                        src="/icons/Check-circle.svg"
                                                        alt="Check icon"
                                                        width={30}
                                                        height={30}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.divPasswordSection}>
                                        <div className={styles.label}>
                                            <label htmlFor="confirmPassword">Confirm Password</label>
                                        </div>

                                        <div className={`${styles.iconStatusColumn} ${!isConfirmPasswordValid && confirmPasswordColumn.length !== 0 ? styles.invalid : ''}`}>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder={isConfirmPasswordValid ? "" : "Fill in this data"}
                                                required
                                                onChange={handleChange}
                                            />
                                            <div className={`${styles.iconStatusColumnButton} ${styles.iconStatusColumnPasswordButton}`}>
                                                {
                                                    !isConfirmPasswordValid && confirmPasswordColumn.length !== 0 ?
                                                        (<Image
                                                            src="/icons/Info-alert.svg"
                                                            alt="Alert icon"
                                                            width={30}
                                                            height={30}
                                                        />
                                                        ) : confirmPasswordColumn.length > 0 && isConfirmPasswordValid ? (
                                                            <Image
                                                                src="/icons/Check-circle.svg"
                                                                alt="Check icon"
                                                                width={30}
                                                                height={30}
                                                            />
                                                        ) : null}
                                            </div>
                                        </div>
                                        {!isConfirmPasswordValid && confirmPasswordColumn.length !== 0  ? (
                                            <div className={`${styles.tooltip} ${styles.tooltipPassword}`}>
                                                <p>Wrong Password</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <button type="submit" onClick={handleSubmit}>
                                    Register
                                </button>
                            </form>
                        </div>
                        <div className={styles.loginSection}>
                            <div className={styles.loginButton}>
                                <p className={`${styles.textAccount}`}>I have an account</p>
                                <div className={`${styles.buttonLogin}`} onClick={goToSigninPage}>
                                    <Image
                                        src="/icons/Login.svg"
                                        alt="Picture of the author"
                                        width={30}
                                        height={30}
                                    />
                                    <p>LOG IN</p>
                                </div>
                            </div>
                            <div className={`${styles.mobileHide} ${styles.theFooter}`}>
                                <Footer status={false} />
                            </div>

                        </div>

                        <div onClick={setMobileAnimation} className={`${styles.buttonInstruction}`}>
                            <img src="/icons/Play.svg" alt="" />
                        </div>

                        <div className={`${styles.bottomSection} ${styles.displayNone} `}>
                            <div className={styles.mobileFooter}>
                                <Footer status={false} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
