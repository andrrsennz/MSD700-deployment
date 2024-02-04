import React from 'react';
import styles from './unitInformationButton.module.css';

interface UnitInformationButton {
    onClick: () => void;
}

const ButtonInformation: React.FC<UnitInformationButton> = ({ onClick }) => {
    return (
        <div className={styles.bottomLeftElement} onClick={onClick}>
            <img src="/icons/info.svg" alt="" />
        </div>
    );
};

export default ButtonInformation;
