import { FC } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './tokenExpired.module.css';

interface TokenExpiredProps {
    status: boolean;
}

const TokenExpired: FC<TokenExpiredProps> = (props) => {
    const router = useRouter();

    const goToSigninPage = (): void => {
        router.push("/");
    }

    return (
        <div
            className={`${styles.container} ${props.status === false ? styles.hide : ''}`}
        >
            <div className={styles.confirmationDialog}>
                <img src="/images/401.svg" alt="" />
                <div className={styles.expiredMessage}>
                    <img src="/icons/person-icon.svg" alt="" />
                    <p>Your session has expired due to idle timeout.<br />
                        Please login to continue using the application. </p>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.buttonLogin} onClick={goToSigninPage}>
                        <img src="/icons/Login.svg" alt="" />
                        <p className={`${styles.mobileHiden}`}>Go to LOGIN page</p>
                        <p className={`${styles.displayNone}`}>LOG IN</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenExpired;
