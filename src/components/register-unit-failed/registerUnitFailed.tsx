import styles from './registerUnitFailed.module.css';
import Image from 'next/image';


const RegisterUnitFailed = () => {
    return (
        <div className={`${styles.registerUnitFailedInformation} ${styles.registerResponseBox}`}>
            <Image
                src="/icons/warning.svg" // Change this to an error icon
                alt="Error icon"
                width={20}
                height={20}
            />
            <p>This unit has previously been registered.</p>
        </div>
    );
};

export default RegisterUnitFailed;
