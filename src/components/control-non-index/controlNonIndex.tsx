import { usePathname, useRouter } from "next/navigation";
import styles from "./controlNonIndex.module.css";
import { useEffect, useState } from "react";
import Footer from "@/components/footer/footer";
import ButtonInformation from "@/components/unit-information-button/unitInformationButton";
import ControlInstruction from "@/components/control-instruction/controlInstruction";
import MapPreviewSection from "@/components/mobile-map-preview-section/mobileMapPreviewSection";
import MobileBottomSection from "../mobile-bottom-section/mobileBottomSection";
import MobileLidarSection from "../mobile-lidar-section/mobileLidarSection";

interface ControlNonIndexProps {
  handleMobileNavigation: () => void; // Define handleMobileNavigation prop
  handleMobileInstruction: () => void;
  handleMobileSorterDisplay: () => void;
}

const ControlNonIndex: React.FC<ControlNonIndexProps> = ({ handleMobileNavigation, handleMobileInstruction, handleMobileSorterDisplay }) => {
  const [showControlInstruction, setShowControlInstruction] = useState(true); // Added state
  const [firstLoaded, setFirstLoaded] = useState("false");
  const [mapPreview, setMapPreview] = useState(false);
  const [mapPreviewStatus, setMapPreviewStatus] = useState(0);

  const router = useRouter();

  const goToDatabasePage = () => {
    router.push("/unit/database");
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    setFirstLoaded(
      sessionStorage.getItem("firstLoadControlPage") === null ? "true" : "false"
    );
  });

  const handleControlInstructionClick = () => {
    setShowControlInstruction(false);
    sessionStorage.setItem("firstLoadControlPage", "false");
    setFirstLoaded("false");
  };

  const handleMapPreview = () => {
    setMapPreview(!mapPreview)
  }

  const handleMapPreviewStatus = (value: any) => {
    setMapPreviewStatus(value)
  }

  return (
    <>
      <MobileLidarSection // Use the new component here
        isChecked={isChecked}
        handleCheckboxChange={handleCheckboxChange}
      />

      <div className={`${styles.mapSection} ${mapPreview ? "" : styles.mapSectionWithoutPreview}`}>
        <div className={styles.centerDiv}>
          <img className={styles.location} src="/icons/Icon.svg" alt="" />
          <p>No map have been selected for navigation yet</p>

          <div className={styles.informationSection} onClick={goToDatabasePage}>
            <img src="/icons/information-circle-svgrepo-com (1).svg" alt="" />
            <p>
              Please go to the <span className={styles.bolder}>DATABASE</span>{" "}
              and choose the map to load
            </p>
          </div>
        </div>
      </div>

      <MapPreviewSection
        mapPreview={mapPreview}
        mapPreviewStatus={mapPreviewStatus}
        handleMapPreviewStatus={handleMapPreviewStatus}
      />

      <MobileBottomSection
        handleMobileNavigation={handleMobileNavigation}
        handleMapPreview={handleMapPreview}
        handleMobileInstruction={handleMobileInstruction}
        handleMobileSorterDisplay={handleMobileSorterDisplay}
        mapIndex={false}
      />

    </>
  );
}

export default ControlNonIndex;