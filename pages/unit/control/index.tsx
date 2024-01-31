import React, { useEffect, useState } from 'react';
import ConfirmElement from '@/components/confirm-element/confirmElement';
import Navigation from '@/components/unit-navigation/navigation';
import styles from './controle.module.css';
import CloseButton from '@/components/close-button/closeButton';
import Footer from '@/components/footer/footer';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ControlNonIndex from '@/components/control-non-index/controlNonIndex';
import ControlIndex from '@/components/control-index/controlIndex';
import { useDispatch, useSelector } from 'react-redux';
import Script from 'next/script';
import Head from 'next/head';
import axios from 'axios';

const Control: React.FC = () => {
  const [mapIndex, setMapIndex] = useState<number>(-1);
  const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || 'http://localhost:5000');
  const [render, setRender] = useState<boolean>(true);
  const router = useRouter();
  
  // let mapIndex;
  useEffect(() => {
    // storing input name
    setMapIndex(
      sessionStorage.getItem('mapIndex') === null
        ? -1
        : parseInt(sessionStorage.getItem('mapIndex') || '0', 10)
    );

    async function checkToken() {
        await axios.get(`${backendUrl}`, {
          headers: {
              'Authorization' : `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`
          }
        })
        .then((response) => {
          if (response.status === 200) {
            setRender(true);
          }
          else {
            router.push('/');
          }
        })
        .catch((error) => {
          router.push('/');
        });
    }
    checkToken();

    console.log(mapIndex);
  }, []);

  const searchParams = useSearchParams();
  // const index = searchParams.get('index');

  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const onConfirmButtonClick = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    // Set showConfirmDialog to false when Cancel button is clicked
    setShowConfirmDialog(false);
  };

  return (
    <> 
      {render ? 
        (
          <>
            {' '}
            <Head>
              <title>Control Mode</title>
              <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <ConfirmElement
              message="Are you sure you want to close this app?"
              status={showConfirmDialog}
              onCancel={handleCancel}
            />
            {mapIndex < 0 ? (
              <div className={styles.container}>
                <div className={styles.parents}>
                  <CloseButton onClick={onConfirmButtonClick} />
                  <div className={styles.navigation}>
                    <Navigation />
                  </div>
                  <ControlNonIndex />
                  <Footer status={false /* or false */} />
                </div>
              </div>
            ) : (
              <ControlIndex />
            )}

            <Script src="/script/Nav2D.js" strategy="beforeInteractive" />
            <Script src="/script/roslib.js" strategy="beforeInteractive" />
            <Script src="/script/eventemitter2.min.js" strategy="beforeInteractive" />
            <Script src="/script/easeljs.js" strategy="beforeInteractive" />
            <Script src="/script/ros2d.js" strategy="beforeInteractive" />
          </>
        ) :
        <></>
      }
    </>
  );
};

export default Control;
