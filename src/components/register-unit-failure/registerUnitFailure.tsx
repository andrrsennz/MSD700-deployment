import styles from './registerUnitFailure.module.css';
import Image from 'next/image';


const RegisterUnitFailure = () => {
    return (
        <div className={styles.registerUnitFailedInformation}>
        <Image
          src="/icons/error.svg" // Change this to an error icon
          alt="Error icon"
          width={20}
          height={20}
        />
        <p>Invalid unit name</p>
      </div>
    );
};

export default RegisterUnitFailure;
