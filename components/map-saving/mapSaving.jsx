import { useRouter } from "next/navigation";
import styles from "./mapSaving.module.css";
import Image from "next/image";
import { useState } from "react";

const reloadPage = () => {
  window.location.reload();
};

export default function MapSaving(props) {
  const router = useRouter();
  const [mapSaved, setMapSaved] = useState(false);

  if (props.status == true) {
    addEventListener("click", (event) => {
      window.addEventListener("click", reloadPage);
    });
  }

  return (
    <div
      className={`${styles.container} ${
        props.status == false ? styles.hide : ""
      } `}
    >
      {mapSaved && <MapSaving status={true} />}{" "}
      {
        <div className={styles.confirmationDialog}>
          <Image
            src="/icons/save.svg"
            width={20}
            height={20}
            alt="save icons"
          />
          <p>The map has been saved.</p>
        </div>
      }
    </div>
  );
}
