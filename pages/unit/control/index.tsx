import React, { useEffect, useState } from 'react';
import ConfirmElement from '@/components/confirm-element/confirmElement';
import Navigation from '@/components/unit-navigation/navigation';
import styles from './controle.module.css';
import CloseButton from '@/components/close-button/closeButton';
import Footer from '@/components/footer/footer';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import ControlIndex from '@/components/control-index/controlIndex';
import Script from 'next/script';
import Head from 'next/head';
import axios from 'axios';
import ControlInstruction from '@/components/control-instruction/controlInstruction';
import ButtonInformation from '@/components/unit-information-button/unitInformationButton';
import TokenExpired from '@/components/token-expired/tokenExpired';
import MobileTopSection from '@/components/mobile-top-section/mobileTopSection';
import MobileNavigation from '@/components/mobile-navigation/mobileNavigation';
import ControlNonIndex from '@/components/control-non-index/controlNonIndex';
import MobileInstruction from '@/components/mobile-instruction/mobileInstruction';

const Control: React.FC = () => {
  const [mapIndex, setMapIndex] = useState<number>(-1);
  const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || 'http://localhost:5000');
  const [render, setRender] = useState<boolean>(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showControlInstruction, setShowControlInstruction] = useState<boolean>(false); // Added state
  const [firstLoaded, setFirstLoaded] = useState<string>('false')
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);
  const [mobileNavigation, setMobileNavigation] = useState<boolean>(false);
  const [mobileInstruction, setMobileInstruction] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    setMapIndex(
      sessionStorage.getItem('mapIndex') === null
        ? -1
        : parseInt(sessionStorage.getItem('mapIndex') || '0', 10)
    );

    setFirstLoaded(sessionStorage.getItem('firstLoadControlPage') === null ? 'true' : 'false');

    async function checkToken() {
      await axios.get(`${backendUrl}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`
        }
      })
        .then((response) => {
          if (response.status === 200) {
            setRender(true);
          } else {
            router.push('/');
          }
        })
        .catch((error) => {
          setTokenExpired(false)
        });
    }
    checkToken();
  }, []);

  const searchParams = useSearchParams();

  const onConfirmButtonClick = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleInfoIconClick = () => {
    setShowControlInstruction(!showControlInstruction); // Toggle the state
  };

  const handleControlInstructionClick = () => {
    setShowControlInstruction(false);
    sessionStorage.setItem('firstLoadControlPage', 'false')
    setFirstLoaded('false')
  };

  const handleCloseButtonClick = () => {
    setShowConfirmDialog(true); // or false, depending on your logic
  };

  const handleMobileNavigation = () => {
    setMobileNavigation(!mobileNavigation);
  }

  const handleMobileInstruction = () => {
    setMobileInstruction(!mobileInstruction);
  }

  return (
    <>


      {render ? (
        <>
          <Head>
            <title>Control Mode</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          </Head>
          <ConfirmElement
            message="Are you sure you want to close this app?"
            status={showConfirmDialog}
            onCancel={handleCancel}
          />
          <TokenExpired status={tokenExpired} />
          {showControlInstruction || firstLoaded == 'true' ? <ControlInstruction onClick={handleControlInstructionClick} imgUrl='/images/instruction_ control.png' /> : ''}
          {mobileNavigation ? <MobileNavigation onClick={handleMobileNavigation} /> : ""}
          {mobileInstruction ? <MobileInstruction onClick={handleMobileInstruction} imgUrl={"/images/mobile_instruction_control.svg"} /> : ""}

          {mapIndex < 0 ? (
            <div className={styles.container}>
              {/* --------------------------- Mobile Section  ------------------------------*/}
              <MobileTopSection onConfirmButtonClick={handleCloseButtonClick} />
              {/* -----------------------------------------------------------------------*/}

              <div className={`${styles.parents}`}>
                <div className={`${styles.mobileHide}`}>
                  <CloseButton onClick={onConfirmButtonClick} />
                </div>

                {/* --------------------------- Mobile Section  ------------------------------*/}
                <div className={`${styles.topSection} ${styles.displayNone}`}></div>
                {/* -----------------------------------------------------------------------*/}

                <div className={`${styles.navigation}  ${styles.mobileHide}`}>
                  <Navigation />
                </div>
                <ControlNonIndex handleMobileNavigation={handleMobileNavigation} handleMobileInstruction={handleMobileInstruction} />

              </div>
            </div>
          ) : (
            <ControlIndex />
          )}


          <ButtonInformation onClick={handleInfoIconClick} />

          <Script src="/script/Nav2D.js" strategy="beforeInteractive" />
          <Script src="/script/roslib.js" strategy="beforeInteractive" />
          <Script src="/script/eventemitter2.min.js" strategy="beforeInteractive" />
          <Script src="/script/easeljs.js" strategy="beforeInteractive" />
          <Script src="/script/ros2d.js" strategy="beforeInteractive" />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Control;
