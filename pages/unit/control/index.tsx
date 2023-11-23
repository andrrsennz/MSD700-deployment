import React, { useEffect, useState } from 'react';
import ConfirmElement from '../../../components/confirm-element/confirmElement';
import Navigation from '../../../components/unit-navigation/navigation';
import styles from './controle.module.css';
import CloseButton from '../../../components/close-button/closeButton';
import Footer from '../../../components/footer/footer';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ControlNonIndex from '../../../components/control-non-index/controlNonIndex';
import ControlIndex from '../../../components/control-index/controlIndex';
import { useDispatch, useSelector } from 'react-redux';
import Script from 'next/script';

const Control: React.FC = () => {
  const [mapIndex, setMapIndex] = useState<number>(-1);
  // let mapIndex;
  useEffect(() => {
    // storing input name
    setMapIndex(
      localStorage.getItem('mapIndex') === null
        ? -1
        : parseInt(localStorage.getItem('mapIndex') || '0', 10)
    );

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
      {' '}
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
            <Footer status={false /* or false */}/>
          </div>
        </div>
      ) : (
        <ControlIndex />
      )}
    </>
  );
};

export default Control;
