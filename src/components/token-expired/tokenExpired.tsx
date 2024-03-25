import { FC } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './tokenExpired.module.css';

interface TokenExpiredProps {
    status: boolean;
    // message: string;
    // onCancel: () => void;
    // onConfirm?: () => void;
}

const TokenExpired: FC<TokenExpiredProps> = (props) => {
    const router = useRouter();

    const handleCancelClick = () => {
        // Call the callback function to set showConfirmDialog to false
        // props.onCancel();
    };

    const confirmClick = () => {
        // if (props.onConfirm) {
        //     props.onConfirm(); // Call the onConfirm callback when Confirm is clicked
        //     props.onCancel();
        // }
    };

    const goToSigninPage = (): void => {
        router.push("/");
    }


    return (
        <div
            className={`${styles.container} ${props.status === false ? styles.hide : ''}`}
        >
            <div className={styles.confirmationDialog}>
                <img src="/images/401_image.svg" alt="" />
                <div className={styles.expiredMessage}>
                    <img src="/icons/person-icon.svg" alt="" />
                    <p>Your session has expired due to idle timeout.<br />
                        Please login to continue using the application. </p>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.buttonLogin} onClick={goToSigninPage}>
                        <img src="/icons/Login.svg" alt="" />
                        <p>LOG IN</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenExpired;
