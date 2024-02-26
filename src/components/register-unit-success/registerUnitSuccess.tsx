import styles from './registerUnitSuccess.module.css';
import Image from 'next/image';


const RegisterUnitSuccess = () => {
    return (
        <div className={`${styles.registerUnitSuccessInformation} ${styles.registerResponseBox}`}>
            <Image
                src="/icons/save.svg"
                alt="Success icon"
                width={20}
                height={20}
            />
            <p>The unit has been registered.</p>
        </div>
    );
};

export default RegisterUnitSuccess;
