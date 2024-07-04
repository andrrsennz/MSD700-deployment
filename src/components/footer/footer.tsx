import React from 'react'; // Import React for type annotations
import styles from './footer.module.css';
import { usePathname } from 'next/navigation';

interface FooterProps {
  status: boolean;
}

const Footer: React.FC<FooterProps> = (props) => {

  const pathname = usePathname()

  return (
    <footer className={styles.theFooter}>
      {props.status === true ? (
        <div className={`${styles.container} ${styles.mobileHide}`}>
          <div className={styles.handlingInstructions}>
            <img src="/icons/new-book.svg" alt="" />
            <p>
              Handling
              <br />
              Instructions
            </p>
          </div>
          <div className={styles.safetyPrecautions}>
            <img src="/icons/new-shield.svg" alt="" />
            <p>
              Safety <br />
              Precaution
            </p>
          </div>
        </div>
      ) : (
        ''
      )}

      <div className={`${styles.copyright} ${pathname?.includes('/unit') || pathname?.includes('control') || pathname?.includes('mapping') || pathname?.includes('database') ? styles.unit : ''} ${styles.copyrightUnit}`}>
        <p>
          <span>&#169;</span> 2023 ITBdeLabo
        </p>
      </div>
    </footer>
  );
};

export default Footer;
