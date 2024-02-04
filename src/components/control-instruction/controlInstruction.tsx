import React from 'react';
import styles from './controlInstruction.module.css';

interface ControlInstructionProps {
  onClick: () => void;
  imgUrl: string
}

const ControlInstruction: React.FC<ControlInstructionProps> = ({ onClick, imgUrl }) => {
  return (

    <div className={styles.ControlInstruction} onClick={onClick}>
      <img src={imgUrl} alt="" />
    </div>
  );
};

export default ControlInstruction;
