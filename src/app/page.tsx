"use client";


import Image from "next/image";
import { useEffect, useState } from "react";
import ConfirmElement from "@/components/confirm-element/confirmElement";
import { useRouter } from "next/navigation"; // Changed from "next/navigation"
import CloseButton from "@/components/close-button/closeButton";
import Footer from "@/components/footer/footer";
import styles from "./page.module.css";
import axios from "axios";

export default function Home(): JSX.Element {
  const router = useRouter();

  const [showRegisterUnitColumn, setShowRegisterUnitColumn] = useState<boolean>(false);


  const data = [
    { id: 1, unit: 'MSD700-1', status: 'on', battery: '90%', uptime: '5 hours' },
    { id: 2, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },
    { id: 3, unit: 'MSD700-1', status: 'on', battery: '90%', uptime: '5 hours' },
    { id: 4, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },
    { id: 5, unit: 'MSD700-1', status: 'on', battery: '90%', uptime: '5 hours' },
    { id: 6, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },
    { id: 7, unit: 'MSD700-1', status: 'on', battery: '90%', uptime: '5 hours' },
    { id: 8, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },
    { id: 9, unit: 'MSD700-1', status: 'on', battery: '90%', uptime: '5 hours' },
    { id: 10, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },
    { id: 11, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },
    { id: 12, unit: 'MSD700-1', status: 'on', battery: '90%', uptime: '5 hours' },
    { id: 13, unit: 'MSD700-2', status: 'off', battery: '65%', uptime: '3 hours' },


    // Add more data rows here
  ];

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
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    axios.post(`${backendUrl}/user/login`, {
      username: username.value,
      password: password.value
    })
      .then(function (response: any) {
        if (response.status === 200) {
          sessionStorage.setItem("username", response.data.username);
          sessionStorage.setItem("full_name", response.data.full_name);
          sessionStorage.setItem("token", response.data.token);
          router.push("/unit/control");
        }
        else {
          alert("Invalid username or password");
        }
      })
      .catch(function (error: any) {
        console.log(error);
        alert("Invalid username or password");
      })
    setShowUtilSection(true);
  };

  const onConfirmButtonClick = (): void => {
    setShowConfirmDialog(true);
  };

  const handleCancel = (): void => {
    setShowConfirmDialog(false);
  };

  const goToSignUpPage = (): void => {
    router.push("/signup");
  }

  useEffect(() => {
    const table: HTMLTableElement | null = document.querySelector('.table');
    const thead: HTMLTableSectionElement | null = table ? table.querySelector('thead') : null;

    const addBoxShadowToColumn = (event: MouseEvent) => {
      const th: HTMLTableDataCellElement = event.target as HTMLTableDataCellElement;
      const columnIndex: number = Array.from(thead?.querySelectorAll('th') || []).indexOf(th);

      if (columnIndex !== -1) {
        const tds: NodeListOf<HTMLTableDataCellElement> = table?.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`) as NodeListOf<HTMLTableDataCellElement>;
        tds.forEach((td) => {
          td.style.boxShadow = '0px 4px 4px 0px #0567A680';
        });
      }
    };

    const removeBoxShadowFromColumn = () => {
      const tds: NodeListOf<HTMLTableDataCellElement> | null = table ? table.querySelectorAll('tbody tr td') : null;
      if (tds) {
        tds.forEach((td) => {
          td.style.boxShadow = 'none';
        });
      }
    };

    if (thead) {
      const ths: NodeListOf<HTMLTableDataCellElement> = thead.querySelectorAll('th');
      ths.forEach((th) => {
        th.addEventListener('mouseenter', addBoxShadowToColumn);
        th.addEventListener('mouseleave', removeBoxShadowFromColumn);
      });
    }

    return () => {
      if (thead) {
        const ths: NodeListOf<HTMLTableDataCellElement> = thead.querySelectorAll('th');
        ths.forEach((th) => {
          th.removeEventListener('mouseenter', addBoxShadowToColumn);
          th.removeEventListener('mouseleave', removeBoxShadowFromColumn);
        });
      }
    };
  }, []);

  useEffect(() => {
    const maxRows = 10;
    const rowHeight = 50; // Adjust this based on your actual row height

    // Use a function to handle the update
    const updateTableStyle = () => {
      const tableSection = document.querySelector('.tableSection') as HTMLElement;
      const tableBody = document.querySelector('.table tbody');

      if (tableSection && tableBody && tableBody.childElementCount > maxRows) {
        tableSection.style.maxHeight = `${maxRows * rowHeight}px`;
        tableSection.style.overflowY = 'auto';
      } else if (tableSection) {
        tableSection.style.maxHeight = 'none';
        tableSection.style.overflowY = 'hidden';
      }
    };

    // Call the function
    updateTableStyle();

    // Optional: If you expect the number of rows or the element to change, 
    // set up a mutation observer or resize observer here to call updateTableStyle() when needed.

  }, [data]);


  // Handler to show registerUnitColumn
  const handleShowRegisterUnitColumn = () => {
    setShowRegisterUnitColumn(true);
  };

  // Handler to hide registerUnitColumn
  const handleHideRegisterUnitColumn = () => {
    setShowRegisterUnitColumn(false);
  };



  return (
    <>
      <ConfirmElement
        message="Are you sure you want to close this app?"
        status={showConfirmDialog}
        onCancel={handleCancel}
      />

      <div className={styles.container}>

        <div className={styles.topSection}>
          <CloseButton onClick={onConfirmButtonClick} />
          <div className={styles.register}>
            <p>Don't have an account yet?</p>
            <div className={styles.buttonRegister} onClick={goToSignUpPage}>
              <Image
                src="/icons/user-register.svg"
                alt="Sign up icon"
                width={20}
                height={20}
              />
              <p>SIGN UP</p>
            </div>
          </div>
        </div>

        <div className={styles.centerSection}>

          <div className={styles.greetings}>
            <p>Hello, welcome to the MSD700 application!</p>
          </div>

          <div className={styles.dataSection}>

            <div className={styles.loginSection}>
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

            <div className={styles.tableUnit}>
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
                  Please choose your MSD700 unit.
                </p>
              </div>
              <div className={styles.tableSection}>
                <table className={styles.table}>
                  <thead className={styles.headerTable}>
                    <tr >
                      <th>No.</th>
                      <th>MSD700 Unit</th>
                      <th>Status</th>
                      <th>Battery</th>
                      <th>Uptime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id} className={item.status === 'off' ? styles.offRow : styles.onRow}>
                        <td data-column="0">{item.id}</td>
                        <td data-column="1">{item.unit}</td>
                        <td data-column="2">{item.status}</td>
                        <td data-column="3">{item.battery}</td>
                        <td data-column="4">{item.uptime}</td>
                      </tr>
                    ))}

                  </tbody>
                </table>

              </div>
              <button
                // onClick={goToUnitPage}
                aria-label="Submit form Button"
                className={styles.loginFormButton}
              >
                <p>Start</p>
                <Image
                  src="/icons/arrow-right-3-svgrepo-com (1).svg"
                  alt=""
                  width={500}
                  height={500}
                />
              </button>
            </div>

          </div>

          <div className={styles.registerUnit}>
            <div className={styles.registerUnitForm}>
              <div className={styles.registerUnitText}>
                <p>Is the unit not registered yet?</p>
              </div>
              <div className={styles.buttonRegisterUnit} onClick={handleShowRegisterUnitColumn}>
                <Image
                  src="/icons/user-register.svg"
                  alt="Picture of the author"
                  width={20}
                  height={20}
                />
                <p>UNIT REGISTER</p>
              </div>
            </div>
            {showRegisterUnitColumn && (
              <div className={styles.registerUnitColumn}>
                <div className={styles.inputUnit}>
                  <label htmlFor="username">Unit ID</label>
                  <p className={styles.separateElement}>:</p>
                  <input
                    type="text"
                    id="unitid"
                    name="unitid"
                    defaultValue=""
                    required
                  />
                </div>
                <div className={styles.buttonSection}>
                  <button className={styles.registerButton} type="submit" >
                    Register
                  </button>
                  <button className={styles.cancelButton} type="submit" onClick={handleHideRegisterUnitColumn}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {/* <div className={styles.registerUnitColumn}>
              <div className={styles.inputUnit}>
                <label htmlFor="username">Unit ID</label>
                <p className={styles.separateElement}>:</p>
                <input
                  type="text"
                  id="unitid"
                  name="unitid"
                  defaultValue=""
                  required
                />
              </div>
              <div className={styles.buttonSection}>
                <button
                  className={styles.registerButton}
                  type="submit" // Specify the type as submit
                  onClick={onProceedButtonClick}
                >
                  Register
                </button>
                <button
                  className={styles.submitButton}
                  type="submit" // Specify the type as submit
                  onClick={onProceedButtonClick}
                >
                  Cancel
                </button>
              </div>
            </div> */}
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.theFooter}>
            <Footer status={true} />
          </div>
        </div>
      </div>
    </>
  );
}