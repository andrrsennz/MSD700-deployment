"use client";


import Image from "next/image";
import { useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import styles from "./page.module.css";

export default function Home(): JSX.Element {
  const router = useRouter();

  if (typeof window !== "undefined") {
    // Code using sessionStorage
    sessionStorage.getItem("mapIndex") === null
      ? sessionStorage.setItem("mapIndex", "-1") // Ensure setting string "0"
      : "";
  }

  const [showUtilSection, setShowUtilSection] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);


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

  const goToSignUpPage = ():void=>{
    router.push("/signup");
  }

  return (
    <>
      <ConfirmElement
        message="Are you sure you want to close this app?"
        status={showConfirmDialog}
        onCancel={handleCancel}
      />

      <div className={styles.container}>
        <div className={styles.parents}>
          <CloseButton onClick={onConfirmButtonClick} />
          <div className={styles.register}>
            <p>Don't have an account or the unit hasn't been registered yet?</p>
            <div className={styles.buttonRegister} onClick={goToSignUpPage}>
              <Image
                src="/icons/user-register.svg"
                alt="Picture of the author"
                width={20}
                height={20}
              />
              <p>SIGN UP</p>
            </div>
          </div>

          <div className={styles.centeredContent}>

            <div className={styles.greetings}>
              <p>Hello Username, welcome to the MSD700 application!</p>
            </div>

            <div className={styles.dataSection}>
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
                  Please input your login data.
                </p>
              </div>
              <div className={styles.inputSection}>
                <form action="#" method="post">
                  <div className={styles.inputUnit}>
                    <label htmlFor="username">Username</label>
                    <p className={styles.separateElement}>:</p>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      defaultValue=""
                      required
                    />
                  </div>
                  <div className={styles.inputUnit}>
                    <label htmlFor="unitID">Unit ID</label>
                    <p className={styles.separateElement}>:</p>
                    <input
                      type="text"
                      id="unitID"
                      name="unitID"
                      defaultValue=""
                      required
                    />
                  </div>
                  <div className={styles.inputUnit}>
                    <label htmlFor="password">Password</label>
                    <p className={styles.separateElement}>:</p>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        defaultValue=""
                        required
                      />
                      <div className={styles.passwordStatusButton} >
                        <Image
                          src="/icons/Eye.svg"
                          alt="Picture of the author"
                          width={30}
                          height={30}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.submitButton}
                    type="submit" // Specify the type as submit
                    onClick={onProceedButtonClick}
                  >
                    Proceed
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className={styles.theFooter}>
            <Footer status={true} />
          </div>
        </div>
      </div>
    </>
  );
}
