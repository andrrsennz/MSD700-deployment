import React from 'react';
import styles from './controlInstruction.module.css';
import { usePathname } from 'next/navigation';
interface ControlInstructionProps {
  onClick: () => void;
  imgUrl: string;
  width?: number; // Optional width property
  height?: number; // Optional height property
}

const ControlInstruction: React.FC<ControlInstructionProps> = ({ onClick, imgUrl, width, height }) => {

  const pathname = usePathname();
  const routeName = pathname ? pathname.split('/').filter(Boolean).pop() : '';

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`${styles.ControlInstruction} ${styles.mobileHide} ${routeName && styles[routeName]}`}
      onClick={onClick}>
      <img src={imgUrl} alt="" onClick={handleImageClick} />
    </div>
  );
};

export default ControlInstruction;