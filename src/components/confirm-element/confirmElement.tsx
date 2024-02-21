import { FC } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './confirmElement.module.css';

interface ConfirmElementProps {
  status: boolean;
  message: string;
  onCancel: () => void;
  onConfirm?: () => void;
}

const ConfirmElement: FC<ConfirmElementProps> = (props) => {
  const router = useRouter();

  const handleCancelClick = () => {
    // Call the callback function to set showConfirmDialog to false
    props.onCancel();
  };

  const confirmClick = () => {
    if (props.onConfirm) {
      props.onConfirm(); // Call the onConfirm callback when Confirm is clicked
      props.onCancel();
    } else {
      router.push("/closing-page");
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

export default ConfirmElement;
