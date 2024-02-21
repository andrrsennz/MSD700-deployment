import { FC } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './confirmDelete.module.css';

interface ConfirmDeleteProps {
    status: boolean;
    message: string;
    onCancel: () => void;
    onConfirm?: () => void;
}

const ConfirmDelete: FC<ConfirmDeleteProps> = (props) => {
    const router = useRouter();

    const handleCancelClick = () => {
        // Call the callback function to set showConfirmDialog to false
        props.onCancel();
    };

    const confirmClick = () => {
        if (props.onConfirm) {
            props.onConfirm(); // Call the onConfirm callback when Confirm is clicked
            props.onCancel();
        }
    };

    return (
        <div
            className={`${styles.container} ${props.status === false ? styles.hide : ''}`}
        >
            <div className={styles.confirmationDialog}>
                <p>{props.message}</p>
                <div className={styles.buttonContainer}>
                    <button className={styles.buttonConfirm} onClick={confirmClick}>
                        Confirm
                    </button>
                    <button className={`${styles.buttonConfirm} ${styles.cancelButton}`} onClick={handleCancelClick}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDelete;
