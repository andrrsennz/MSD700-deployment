import React, { useEffect, useState } from 'react'; // Import React for type annotations
import { useRouter } from 'next/navigation';
import styles from './mapSaving.module.css';
import Image from 'next/image';

interface MapSavingProps {
  status: boolean;
}

const reloadPage = () => {
  window.location.reload();
};

const MapSaving: React.FC<MapSavingProps> = (props) => {
  const router = useRouter();
  const [mapSaved, setMapSaved] = useState(false);

  useEffect(() => {
    if (props.status === true) {
      addEventListener('click', reloadPage);
    }

    return () => {
      removeEventListener('click', reloadPage);
    };
  }, [props.status]);

  return (
    <div
      className={`${styles.container} ${props.status === false ? styles.hide : ''}`}
    >
      {mapSaved && <MapSaving status={true} />}{' '}
      {
        <div className={styles.confirmationDialog}>
          <Image src="/icons/save.svg" width={20} height={20} alt="save icons" />
          <p>The map has been saved.</p>
        </div>
      }
    </div>
  );
};

export default MapSaving;
