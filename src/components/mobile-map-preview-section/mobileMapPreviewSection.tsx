// MapPreviewSection.tsx
import React from 'react';
import styles from './mobileMapPreviewSection.module.css';

interface MapPreviewSectionProps {
  mapPreview: boolean;
  mapPreviewStatus: number;
  handleMapPreviewStatus: (status: number) => void;
}

const MapPreviewSection: React.FC<MapPreviewSectionProps> = ({
  mapPreview,
  mapPreviewStatus,
  handleMapPreviewStatus
}) => {
  return (
    <div className={`${styles.displayNone} ${mapPreview ? styles.liveMapSection : ""}`}>
      <div className={styles.buttonLiveMapSection}>
        <div onClick={() => handleMapPreviewStatus(0)} className={`${styles.cameraButton} ${styles.buttonLiveMap} ${mapPreviewStatus === 0 ? styles.buttonActive : ""}`}>
          <img src="/icons/Camera.svg" alt="" />
          <p>Camera</p>
        </div>
        <div onClick={() => handleMapPreviewStatus(1)} className={`${styles.previewButton} ${styles.buttonLiveMap} ${mapPreviewStatus === 1 ? styles.buttonActive : ""}`}>
          <img src="/icons/mapping.svg" alt="" />
          <p>Preview</p>
        </div>
      </div>
      <div className={styles.previewMapLiveSection}>
        {mapPreviewStatus === 0 ? (<img src="/images/camera.png" alt="" />) : (<img src="/images/map.png" alt="" />)}
      </div>
    </div>
  );
}

export default MapPreviewSection;
