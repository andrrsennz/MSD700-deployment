// MobileBottomSection.tsx
import React from 'react';
import styles from './mobileBottomSection.module.css';
import Footer from "@/components/footer/footer";
import { usePathname } from 'next/navigation';

interface MobileBottomSectionProps {
    handleMobileNavigation: () => void;
    handleMapPreview: () => any;
    handleMobileInstruction: () => void;
    handleMobileSorterDisplay: () => void;
    mapIndex: Boolean;
}

const MobileBottomSection: React.FC<MobileBottomSectionProps> = ({ handleMobileNavigation, handleMapPreview, handleMobileInstruction, mapIndex, handleMobileSorterDisplay }) => {
    const pathname = usePathname()

    console.log(pathname);


    return (
        <div className={`${styles.displayNone} ${styles.mobileBottomSection}`}>
            <div className={`${styles.navigationMobileButton} ${styles.bottomSectionButton}`} onClick={() => handleMobileNavigation()}>
                <img src="/icons/list.svg" alt="" />
            </div>

            {
                pathname != '/unit/database' ? <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={handleMapPreview}>
                    <img src="/icons/Webcam.svg" alt="" />
                </div> :
                    <>
                        <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={handleMobileSorterDisplay}>
                            <img src="/icons/arrange_icon.svg" alt="" />
                        </div>

                        <div className={`${styles.webcamButton} ${styles.sircleIcon} ${styles.bottomSectionButton}`} onClick={handleMobileInstruction}>
                            <img src="/icons/information-circle-svgrepo-com.svg" alt="" />
                        </div>
                    </>
            }


            {
                mapIndex || pathname == '/unit/mapping' ? (
                    <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={() => handleMobileInstruction()}>
                        <img src="/icons/information-circle-svgrepo-com.svg" alt="" />
                    </div>
                ) : ''
            }

            <div className={styles.copyright}>
                <p>
                    <span>&#169;</span> 2023 ITBdeLabo
                </p>
            </div>
        </div>
    );
}

export default MobileBottomSection;
