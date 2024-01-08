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

    const [fullNameColumn, setFullNameColumn] = useState<boolean>(false);
    const [isFullNameValid, setIsFullNameValid] = useState(true);



    const [emailColumn, setEmailColumn] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isEmailFormatValid, setIsEmailFormatValid] = useState(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex for demonstration


    const [passwordColumn, setPasswordColumn] = useState<boolean>(false);
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const [confirmPasswordColumn, setConfirmPasswordColumn] = useState<boolean>(false);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

    const [passwordsMatch, setPasswordsMatch] = useState(true);

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
            setAttemptedSubmit(false);
            axios.post(`${backendUrl}/user/check-username`, {
                username: value
            })
            .then(function(response: any) {
                if (response.status === 200) {
                    setIsUsernameValid(true);
                }
            })
            .catch(function(error: any) {
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
            .then(function(response: any) {
                if (response.status === 200) {
                    setIsEmailValid(true);
                }
            })
            .catch(function(error: any) {
                setIsEmailValid(false);
            });
        }

        if (name === 'password') {
            setAttemptedSubmit(false);
            if (value === formValues.confirmPassword && value !== '' && formValues.confirmPassword !== '') {
                setPasswordsMatch(true);
                setIsPasswordValid(true);
                setIsConfirmPasswordValid(true);
            }
            else {
                setPasswordsMatch(false);
                setIsConfirmPasswordValid(false);
                setIsPasswordValid(false);
            }
        }

        if (name === 'confirmPassword') {
            setAttemptedSubmit(false);
            if (value === formValues.password && value !== '' && formValues.password !== '') {
                setPasswordsMatch(true);
                setIsPasswordValid(true);
                setIsConfirmPasswordValid(true);
            }
            else{
                setPasswordsMatch(false);
                setIsConfirmPasswordValid(false);
                setIsPasswordValid(false);
            }
        }


    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Mark that a submit attempt has been made
        setAttemptedSubmit(true);

        const isFullNameFilled = formValues.fullname.trim() !== '';
        setIsFullNameValid(isFullNameFilled);

        // If any input is invalid, return early and don't proceed with form submission
        if (!isUsernameValid || !isFullNameFilled || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        // If all validations pass, proceed with form submission
        axios.post(`${backendUrl}/user/register`, {
            username: formValues.username,
            full_name: formValues.fullname,
            email: formValues.email,
            password: formValues.password,
        })
        .then(function(response: any) {
            if (response.status === 201) {
                alert("User created successfully");
                router.push("/");
            }
        })
        .catch(function(error: any) {
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
                                    <div className={`${styles.iconStatusColumn} ${!isUsernameValid ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder={isUsernameValid ? "Username" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isUsernameValid ? (
                                                <Image
                                                    src="/icons/info-alert.svg"
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
                                                    src="/icons/info-alert.svg"
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
                                    <div className={`${styles.iconStatusColumn} ${!isEmailValid ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            placeholder={isEmailValid ? "Email" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {!isEmailValid ? (
                                                <Image
                                                    src="/icons/info-alert.svg"
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
                                    {formValues.email && !isEmailFormatValid && (
                                        <div className={styles.tooltip}>
                                            <p>Wrong Email | Please fill in with the correct email e.g. email-name@gmail.com</p>
                                        </div>
                                    )}
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
                                                        src="/icons/info-alert.svg"
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
                                        <div className={`${styles.iconStatusColumn} ${!passwordsMatch || formValues.confirmPassword.length == 0 ? styles.invalid : ''}`}>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                required
                                                onChange={handleChange}
                                                // If you want to show a red border when passwords do not match
                                                className={!passwordsMatch ? styles.invalidInput : ''}
                                            />
                                            <div className={styles.iconStatusColumnButton}>
                                                {!passwordsMatch || formValues.confirmPassword.length == 0 ? (
                                                    <Image
                                                        src="/icons/info-alert.svg"
                                                        alt="Alert icon"
                                                        width={30}
                                                        height={30}
                                                    />
                                                ) : <Image
                                                    src="/icons/Check-circle.svg"
                                                    alt="Check icon"
                                                    width={30}
                                                    height={30}
                                                />}
                                            </div>
                                        </div>
                                        {!passwordsMatch ? (
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
                                    src="/icons/user-register.svg"
                                    alt="Picture of the author"
                                    width={20}
                                    height={20}
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
