"use client";


import Image from "next/image";
import { useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";

export default function Home(): JSX.Element {
  const router = useRouter();

  if (typeof window !== "undefined") {
    // Code using localStorage
    localStorage.getItem("mapIndex") === null
      ? localStorage.setItem("mapIndex", "0") // Ensure setting string "0"
      : "";
  }

  const [showUtilSection, setShowUtilSection] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const onProceedButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    const ip_address = (document.getElementById("ipAddress") as HTMLInputElement).value
    localStorage.setItem("ip_address", ip_address);
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
    <>
      <ConfirmElement
        message="Are you sure you want to close this app?"
        status={showConfirmDialog}
        onCancel={handleCancel}
      />
      <div className="centered-content">
        <CloseButton onClick={onConfirmButtonClick} />
        <div className="greetings">
          <p>Hello Username, welcome to the MSD700 application!</p>
        </div>

        <div className="data-section">
          <div>
            <div className="label-section">
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
            <div className="input-section">
              <form action="#" method="post">
                <div className="inputUnit">
                  <label htmlFor="unitID">Unit ID</label>
                  <p className="separateElement">:</p>
                  <input
                    type="text"
                    id="unitID"
                    name="unitID"
                    defaultValue="Unit A"
                    required
                  />
                </div>

                <div className="inputUnit">
                  <label htmlFor="ipAddress">IP Address</label>
                  <p className="separateElement">:</p>
                  <input
                    type="text"
                    id="ipAddress"
                    name="ipAddress"
                    defaultValue="10.147.17.198"
                    required
                  />
                </div>
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
            className={`util_section ${showUtilSection === true ? "show-class" : "hide-class"
              }`}
          >
            <Image
              src="/images/MSD700.png"
              alt="Picture of the author"
              width={350}
              height={264}
            />
            <div className="data_util">
              <form action="#" method="post">
                <div className="inputUnit">
                  <label htmlFor="battery">Battery</label>
                  <p className="separateElement">:</p>
                  <input
                    type="text"
                    id="battery"
                    name="battery"
                    defaultValue="50%"
                    required
                  />
                </div>

                <div className="inputUnit">
                  <label htmlFor="uptime">Uptime</label>
                  <p className="separateElement">:</p>
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
              className="submit_button"
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

      <div className="theFooter">
        <Footer status={true} />
      </div>
    </>
  );
}
