import { FC } from 'react'; // Import FC (FunctionComponent) for type annotations
import styles from './closeButton.module.css';
import Image from 'next/image';

interface CloseButtonProps {
  onClick: () => void; // Specify the type for the onClick prop
}

const CloseButton: FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button
      aria-label="Close the page"
      className={styles.closeButton}
      onClick={onClick}
    >
      <Image src="/icons/Exit.svg" alt="" width={30} height={30} />
    </button>
  );
};

export default CloseButton;
