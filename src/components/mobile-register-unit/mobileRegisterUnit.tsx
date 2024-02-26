import { FC, useState } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './mobileRegisterUnit.module.css';

interface MobileRegisterUnitProps {
    status: boolean;
}

const MobileRegisterUnit: FC<MobileRegisterUnitProps> = (props) => {
    const router = useRouter();
    const [unitId, setUnitId] = useState(''); // Add this line to create a state variable for the unit ID input

    const handleUnitIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUnitId(event.target.value);
    };

    return (
        <div
            className={`${styles.container} ${props.status === false ? styles.hide : ''}`}
        >
            <div className={styles.confirmationDialog}>
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
                            // onClick={handleRegisterButtonClick}
                            disabled={!unitId} // Disable the button if `unitId` is empty
                        >
                            Register
                        </button>
                        {/* <button className={styles.cancelButton} type="submit" onClick={handleHideRegisterUnitColumn}> */}
                        <button className={styles.cancelButton} type="submit">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileRegisterUnit;
