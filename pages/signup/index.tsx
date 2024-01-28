"use client";


import Image from "next/image";
import { useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import styles from "./signup.module.css";

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import AutoplayCarousel from "../../components/carousel/AutoplayCarousel";
import axios from "axios";

import { cardDetails } from "../../components/carousel/CarouselImages";
import Head from "next/head";

export default function Signup(): JSX.Element {
    const router = useRouter();

    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const [usernameColumn, setUsernameColumn] = useState<boolean>(false);
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [isUsernameRegistered, setIsUsernameRegistered] = useState<boolean>(false);

    const [fullNameColumn, setFullNameColumn] = useState<boolean>(false);
    const [isFullNameValid, setIsFullNameValid] = useState(true);

    const [emailColumn, setEmailColumn] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isEmailRegistered, setIsEmailRegistered] = useState<boolean>(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex for demonstration


    const [passwordColumn, setPasswordColumn] = useState<boolean>(false);
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const [confirmPasswordColumn, setConfirmPasswordColumn] = useState<boolean>(false);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

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
            setIsUsernameRegistered(false)
            setAttemptedSubmit(false);
            axios.post(`${backendUrl}/user/check-username`, {
                username: value
            })
                .then(function (response: any) {
                    if (response.status === 200) {
                        setIsUsernameRegistered(false);   
                        setIsUsernameValid(true);
                    }
                    else {
                        setIsUsernameRegistered(true)
                        setIsUsernameValid(false);
                    }
                })
                .catch(function (error: any) {
                    setIsUsernameRegistered(true)
                    setIsUsernameValid(false);
                });
        }

        if (name === 'fullname') {
            setAttemptedSubmit(false);
            setIsFullNameValid(true); // Assume the input is valid as the user types
        }

        if (name === 'email') {
            setAttemptedSubmit(false);
            axios.post(`${backendUrl}/user/check-email`, {
                email: value
            })
                .then(function (response) {
                    if (response.status === 200) {
                        setIsEmailValid(true);
                        setIsEmailRegistered(false)
                    }
                })
                .catch(function (error) {
                    if (error.response.status === 409) {
                        setIsEmailValid(true);
                        setIsEmailRegistered(true)
                    }
                    else {
                        setIsEmailValid(false);
                        setIsEmailRegistered(false)
                    }
                });
        }

        if (name === 'password') {
            setAttemptedSubmit(false);
            if (value === formValues.confirmPassword && value !== '' && formValues.confirmPassword !== '') {
                setIsPasswordValid(true);
                setIsConfirmPasswordValid(true);
            }
            else {
                setIsConfirmPasswordValid(false);
                setIsPasswordValid(false);
            }
        }

        if (name === 'confirmPassword') {
            setAttemptedSubmit(false);
            if (value === formValues.password && value !== '' && formValues.password !== '') {
                setIsPasswordValid(true);
                setIsConfirmPasswordValid(true);
            }
            else {
                setIsConfirmPasswordValid(false);
                setIsPasswordValid(false);
            }
        }


    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Mark that a submit attempt has been made
        setAttemptedSubmit(true);

        const isUsernameFilled = formValues.username.trim() !== '';
        if (!isUsernameFilled) {
            setIsUsernameValid(false);
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
            !isEmailFilled    || !isEmailValid    || isEmailRegistered     || !isPasswordValid  || !isConfirmPasswordValid) {
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
                    alert("User created successfully");
                    router.push("/");
                }
            })
            .catch(function (error: any) {
                alert("Error creating user");
            })
    };

    const goToSigninPage = (): void => {
        router.push("/");
    }



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

            <div className={styles.container}>
                <div className={styles.parents}>
                    <CloseButton onClick={onConfirmButtonClick} />
                    <div className={styles.leftSide}>
                        <div className={styles.imageAnimation}>
                            <AutoplayCarousel></AutoplayCarousel>
                        </div>
                        <div className={styles.information}>
                            <h1>MSD700</h1>
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
                    <div className={styles.rightSide}>
                        <div className={styles.tagline}>
                            <p>Register Form</p>
                        </div>
                        <div className={styles.formSection}>
                            <form action="#" method="post">
                                <div >
                                    <div className={styles.label}>
                                        <label htmlFor="username">Username</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isUsernameValid || isUsernameRegistered ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder={isUsernameValid ? "Username" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isUsernameValid || isUsernameRegistered ? (
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
                                    {isUsernameRegistered ?
                                        <div className={styles.tooltip}>
                                            <p>This is name is already in use</p>
                                        </div> : null
                                    }
                                </div>
                                <div >
                                    <div className={styles.label}>
                                        <label htmlFor="fullname">Full Name</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isFullNameValid ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="fullname"
                                            name="fullname"
                                            placeholder={isFullNameValid ? "Fullname" : "Fill in this data"}
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

                                <div >
                                    <div className={styles.label}>
                                        <label htmlFor="email">Email</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isEmailValid || isEmailRegistered ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            placeholder={isEmailValid ? "Email" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isEmailValid || isEmailRegistered ? (
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
                                    {/* {formValues.email && (
                                        <div className={styles.tooltip}>
                                            <p>Wrong Email | Please fill in with the correct email e.g. email-name@gmail.com</p>
                                        </div>
                                    )} */}
                                    {
                                        !isEmailValid && formValues.email.trim() !== '' ?
                                        <div className={styles.tooltip}>
                                            <p>This email is not valid</p>
                                        </div> :
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
                                                placeholder={isPasswordValid ? "Password" : "Fill in this data"}
                                                required
                                                onChange={handleChange}
                                            />
                                            <div className={styles.iconStatusColumnButton}>
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
                                        <div className={`${styles.iconStatusColumn} ${!isConfirmPasswordValid ? styles.invalid : ''}`}>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder={isConfirmPasswordValid ? "Confirm Password" : "Fill in this data"}
                                                required
                                                onChange={handleChange}
                                            />
                                            <div className={styles.iconStatusColumnButton}>
                                                {!isConfirmPasswordValid ? (
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
                                        {!isConfirmPasswordValid ? (
                                            <div className={styles.tooltip}>
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
                            <p>I have an account</p>
                            <div className={styles.buttonLogin} onClick={goToSigninPage}>
                                <Image
                                    src="/icons/Login.svg"
                                    alt="Picture of the author"
                                    width={30}
                                    height={30}
                                />
                                <p>LOG IN</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
