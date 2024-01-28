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
  const [selectedRowIdx, setSelectedRowIdx] = useState(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerFailure, setRegisterFailure] = useState(false);
  const [unitId, setUnitId] = useState(''); // Add this line to create a state variable for the unit ID input


  const [data, setData] = useState<any[]>([]);


  if (typeof window !== "undefined") {
    // Code using sessionStorage
    sessionStorage.getItem("mapIndex") === null
      ? sessionStorage.setItem("mapIndex", "-1") // Ensure setting string "0"
      : "";
  }

  const [showUtilSection, setShowUtilSection] = useState<boolean>(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || "http://localhost:5000");


  const onProceedButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    axios.post(`${backendUrl}/user/login`, {
      username: username.value,
      password: password.value
    })
      .then(function (response: any) {
        if (response.status === 200) {
          sessionStorage.setItem("username", response.data.username);
          sessionStorage.setItem("full_name", response.data.full_name);
          sessionStorage.setItem("token", response.data.token);

          fetchUnitData(response.data.token);
          setShowUtilSection(true);
        }
        else {
          alert("Invalid username or password");
        }
      })
      .catch(function (error: any) {
        console.log(error);
        alert("Invalid username or password");
      })
  };

  const fetchUnitData = (token: any) => {
    axios.get(`${backendUrl}/unit/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (response.data && response.data.success) {
          const formattedData = response.data.data.map((item: any) => ({
            id: item.id,
            unit: item.unit_name,
            status: '', // You can define default values or modify as needed
            battery: '',
            uptime: ''
          }));

          setData(formattedData); // Update your state
          setShowUtilSection(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching unit data: ", error);
      });
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

  const handleRowClick = (idx: any) => {
    if (selectedRowIdx === idx) {
      // If the row is already selected, unselect it
      setSelectedRowIdx(null);
    } else {
      // Else, select the row and save to sessionStorage
      setSelectedRowIdx(idx);
    }
  };

  useEffect(() => {
    const handlePageClick = () => {
      if (showAlert) {
        setShowAlert(false);
      }
    };

    if (showAlert) {
      document.addEventListener('click', handlePageClick);
    }

    return () => {
      document.removeEventListener('click', handlePageClick);
    };
  }, [showAlert]);

  const handleStartButtonClick = () => {
    if (selectedRowIdx === null) {
      // Show alert if no row is selected
      setShowAlert(true);
    } else {
      // Find the selected unit data using the selectedRowIdx
      const selectedUnit = data[selectedRowIdx]
      if (selectedUnit) {
        // Save the id and the unit_name to sessionStorage
        sessionStorage.setItem('unit_name', selectedUnit.unit);

        // Proceed with starting the application if a row is selected
        router.push("/unit/control");
      } else {
        // Handle the case where the selected unit is not found in the data array
        console.error("Selected unit not found in the data array");
        // You may want to set an error state here to inform the user
      }
    }
  };

  // The JSX for the alert
  const AlertComponent = () => {
    if (!showAlert) {
      return null;
    }

    return (
      <div className={styles.alertOverlay} onClick={() => setShowAlert(false)}>
        <div className={styles.alertBox}>
          <Image
            src="/icons/warning.svg"
            alt="Warning icon"
            width={20}
            height={20}
          />
          <p>You haven't selected the unit yet.</p>
        </div>
      </div>
    );
  };

  const handleRegisterButtonClick = async () => {
    const unitInput = document.getElementById('unitid') as HTMLInputElement | null;
    const token = sessionStorage.getItem('token'); // Retrieve the token from sessionStorage

    if (unitInput && token) {
      try {
        const response = await axios.post(`${backendUrl}/unit/register`, {
          unit_name: unitInput.value
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setRegisterSuccess(true);
          setTimeout(() => setRegisterSuccess(false), 2000); // Hide the success message after 2 seconds
          fetchUnitData(token); // Fetch unit data again to update the list
        } else {
          // If the response has a success property but it's not true, assume failure
          throw new Error('Registration not successful');
        }
      } catch (error) {
        console.error("Registration failed: ", error);
        setRegisterFailure(true);
        setTimeout(() => setRegisterFailure(false), 2000); // Hide the failure message after 2 seconds
      }
    } else {
      // Handle the case where the unit input or token is null
      console.error("Unit input or token is missing");
      // You could set an error state here to inform the user
    }
  };

  const handleUnitIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUnitId(event.target.value);
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
                src="/icons/buttonregister.svg"
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

            {
              showUtilSection ? (
                <>
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
                          {data.map((item, idx) => (
                            <tr
                              key={idx}
                              onClick={() => handleRowClick(idx)}
                              className={`${item.status === 'off' ? styles.offRow : styles.onRow} ${selectedRowIdx === idx ? styles.selectedRow : ''}`}
                            >
                              <td data-column="0">{idx + 1}</td>
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
                      onClick={handleStartButtonClick}
                    >
                      <p>Start</p>
                      <Image
                        src="/icons/arrow-right-3-svgrepo-com (1).svg"
                        alt=""
                        width={500}
                        height={500}
                      />
                    </button>

                    <AlertComponent />
                  </div>
                  <div className={styles.registerUnit}>
                    <div className={styles.registerUnitForm}>
                      <div className={styles.registerUnitText}>
                        <p>Is the unit not registered yet?</p>
                      </div>
                      <div className={styles.buttonRegisterUnit} onClick={handleShowRegisterUnitColumn}>
                        <Image
                          src="/icons/Car.svg"
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
                            value={unitId} // Bind the input value to the state variable
                            onChange={handleUnitIdChange} // Update the state variable on input change
                            required
                          />

                        </div>
                        <div className={styles.buttonSection}>
                          <button
                            className={styles.registerButton}
                            type="button"
                            onClick={handleRegisterButtonClick}
                            disabled={!unitId} // Disable the button if `unitId` is empty
                          >
                            Register
                          </button>
                          <button className={styles.cancelButton} type="submit" onClick={handleHideRegisterUnitColumn}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {
                      registerSuccess && (
                        <div className={`${styles.registerUnitSuccessInformation} ${styles.registerResponseBox}`}>
                          <Image
                            src="/icons/save.svg"
                            alt="Success icon"
                            width={20}
                            height={20}
                          />
                          <p>The unit has been registered.</p>
                        </div>
                      )
                    }
                    {
                      registerFailure && (
                        <div className={`${styles.registerUnitFailedInformation} ${styles.registerResponseBox}`}>
                          <Image
                            src="/icons/warning.svg" // Change this to an error icon
                            alt="Error icon"
                            width={20}
                            height={20}
                          />
                          <p>This unit has previously been registered.</p>
                        </div>
                      )
                    }
                  </div>
                </>
              ) : ""
            }

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