import { FC } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './confirmRegister.module.css';

interface ConfirmRegisterProps {
    status: boolean;
}

const ConfirmSaving: FC<ConfirmRegisterProps> = (props) => {
    const router = useRouter();


    return (
        <div
            className={`${styles.container} ${props.status === false ? styles.hide : ''}`}
        >
            <div className={styles.confirmationDialog}>
                <img src="/icons/save.svg" alt="" />
                <p>The registration data has been saved.<br />
                    Thank you for registering.</p>
            </div>
        </div>
    );
};

export default ConfirmSaving;
