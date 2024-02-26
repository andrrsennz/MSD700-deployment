import { FC, useState } from 'react'; // Import FC (FunctionComponent) for type annotations
import { useRouter } from 'next/navigation';
import styles from './mobileTopSection.module.css';
import CloseButton from "@/components/close-button/closeButton";

const MobileTopSection = () => {
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const onConfirmButtonClick = (): void => {
        setShowConfirmDialog(true);
    };

    return (
        <>
            <div className={`${styles.topSection} ${styles.displayFlex} ${styles.displayNone}`}>
                <img src="/images/Backhoe.png" alt="" />
                <p>Loc Map</p>
                <CloseButton onClick={onConfirmButtonClick} />
            </div>
        </>
    );
};

export default MobileTopSection;
