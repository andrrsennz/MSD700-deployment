import React from 'react';
import styles from './controlInstruction.module.css';

interface ControlInstructionProps {
  onClick: () => void;
  imgUrl: string;
  width?: number; // Optional width property
  height?: number; // Optional height property
}

const ControlInstruction: React.FC<ControlInstructionProps> = ({ onClick, imgUrl, width, height }) => {
  const style = {
    width: width ? `${width}%` : `80%`,
    height: height ? `${height}%` : `80%`,
  };

  return (
    <div className={styles.ControlInstruction} onClick={onClick}>
      <img src={imgUrl} alt="" style={style} />
    </div>
  );
};

export default ControlInstruction;
