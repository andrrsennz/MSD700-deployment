"use client";


import Image from "next/image";
import { useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import styles from "./signup.module.css";

export default function Home(): JSX.Element {
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const [usernameColumn, setUsernameColumn] = useState<boolean>(false);
    const [isUsernameValid, setIsUsernameValid] = useState(true);

    const [unitIdColumn, setUnitIdColumn] = useState<boolean>(false);
    const [isUnitIdValid, setIsUnitIdValid] = useState(true);

    const [ownerColumn, setOwnerColumn] = useState<boolean>(false);
    const [isOwnerValid, setIsOwnerValid] = useState(true);

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

    const onConfirmButtonClick = (): void => {
        setShowConfirmDialog(true);
    };
    const handleCancel = (): void => {
        setShowConfirmDialog(false);
    };

    const [formValues, setFormValues] = useState({
        username: '',
        unitid: '',
        owner: '',
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
            setIsUsernameValid(true); // Assume the input is valid as the user types
        }

        if (name === 'unitid') {
            setAttemptedSubmit(false);
            setIsUnitIdValid(true); // Assume the input is valid as the user types
        }

        if (name === 'owner') {
            setAttemptedSubmit(false);
            setIsOwnerValid(true); // Assume the input is valid as the user types
        }

        if (name === 'email') {
            setAttemptedSubmit(false);
            setIsEmailValid(true); // Assume the input is valid as the user types
            setIsEmailFormatValid(emailRegex.test(value));

        }

        if (name === 'password' ) {
            setAttemptedSubmit(false);
            setIsPasswordValid(true); // Assume the input is valid as the user types
        }

        if (name === 'confirmPassword') {
            setPasswordsMatch(formValues.password === (name === 'password' ? value : formValues.confirmPassword));
            setAttemptedSubmit(false);
            setIsConfirmPasswordValid(true); // Assume the input is valid as the user types
        }


    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Mark that a submit attempt has been made
        setAttemptedSubmit(true);

        // Check if the username is filled
        const isUsernameFilled = formValues.username.trim() !== '';
        setIsUsernameValid(isUsernameFilled); // Update the state based on the username input

        if (!isUsernameFilled) {
            // If the username is not filled, don't proceed with form submission
            return;
        }

        const isUnitIdValid = formValues.unitid.trim() !== '';
        setIsUnitIdValid(isUnitIdValid); // Update the state based on the username input

        if (!isUnitIdValid) {
            // If the username is not filled, don't proceed with form submission
            return;
        }

        const isOwnerValid = formValues.owner.trim() !== '';
        setIsOwnerValid(isOwnerValid); // Update the state based on the username input

        if (!isOwnerValid) {
            // If the username is not filled, don't proceed with form submission
            return;
        }

        const isEmailValid = formValues.email.trim() !== '';
        setIsEmailValid(isEmailValid); // Update the state based on the username input

        if (!isEmailValid) {
            // If the username is not filled, don't proceed with form submission
            return;
        }

        const isPasswordValid = formValues.password.trim() !== '';
        setIsPasswordValid(isPasswordValid); // Update the state based on the username input

        if (!isPasswordValid) {
            // If the username is not filled, don't proceed with form submission
            return;
        }

        const isConfirmPasswordValid = formValues.confirmPassword.trim() !== '';
        setIsConfirmPasswordValid(isConfirmPasswordValid); // Update the state based on the username input

        if (!isConfirmPasswordValid) {
            // If the username is not filled, don't proceed with form submission
            return;
        }

        // Proceed with form submission if valid
        console.log(formValues);
    };


    return (
        <>
            <ConfirmElement
                message="Are you sure you want to close this app?"
                status={showConfirmDialog}
                onCancel={handleCancel}
            />
            <CloseButton onClick={onConfirmButtonClick} />
            <div className={styles.container}>
                <div className={styles.parents}>
                    <div className={styles.leftSide}>
                        <div className={styles.imageAnimation}>
                            <Image
                                src="/images/animation-signup/Backhoe.png"
                                alt="Picture of the author"
                                width={200}
                                height={200}
                            />
                            <Image
                                src="/images/animation-signup/Bucket.png"
                                alt="Picture of the author"
                                width={200}
                                height={200}
                            />
                            <Image
                                src="/images/animation-signup/Dump.png"
                                alt="Picture of the author"
                                width={200}
                                height={200}
                            />  <Image
                                src="/images/animation-signup/Blade.png"
                                alt="Picture of the author"
                                width={200}
                                height={200}
                            />

                        </div>
                        <div className="information"></div>
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
                                            {attemptedSubmit && !isUsernameValid ? (
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
                                        <label htmlFor="unitid">Unit ID</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isUnitIdValid ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="unitid"
                                            name="unitid"
                                            placeholder={isUnitIdValid ? "Unit ID" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {attemptedSubmit && !isUnitIdValid ? (
                                                <Image
                                                    src="/icons/info-alert.svg"
                                                    alt="Alert icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : formValues.unitid.trim() !== '' ? (
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
                                        <label htmlFor="owner">Owner Name</label>
                                    </div>
                                    <div className={`${styles.iconStatusColumn} ${!isOwnerValid ? styles.invalid : ''}`}>
                                        <input
                                            type="text"
                                            id="owner"
                                            name="owner"
                                            placeholder={isOwnerValid ? "Owner" : "Fill in this data"}
                                            required
                                            onChange={handleChange}
                                        />
                                        <div className={styles.iconStatusColumnButton}>
                                            {attemptedSubmit && !isOwnerValid ? (
                                                <Image
                                                    src="/icons/info-alert.svg"
                                                    alt="Alert icon"
                                                    width={30}
                                                    height={30}
                                                />
                                            ) : formValues.owner.trim() !== '' ? (
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
                                            {attemptedSubmit && !isEmailValid ? (
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
                                                type="text"
                                                id="password"
                                                name="password"
                                                placeholder={isPasswordValid ? "Password" : "Fill in this data"}
                                                required
                                                onChange={handleChange}
                                            />
                                            <div className={styles.iconStatusColumnButton}>
                                                {attemptedSubmit && !isPasswordValid ? (
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
                                        <div className={`${styles.iconStatusColumn} ${!passwordsMatch ? styles.invalid : ''}`}>
                                            <input
                                                type="text"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                required
                                                onChange={handleChange}
                                                // If you want to show a red border when passwords do not match
                                                className={!passwordsMatch ? styles.invalidInput : ''}
                                            />
                                            <div className={styles.iconStatusColumnButton}>
                                                {formValues.confirmPassword && !passwordsMatch ? (
                                                    <Image
                                                        src="/icons/info-alert.svg"
                                                        alt="Alert icon"
                                                        width={30}
                                                        height={30}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        {!passwordsMatch && formValues.confirmPassword ? (
                                            <div className={styles.tooltip}>
                                                <p>Passwords do not match</p>
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
                            <p>I have an account and my unit is registered</p>
                            <div className={styles.buttonLogin}>
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
