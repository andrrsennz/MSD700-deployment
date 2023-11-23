import { useRouter } from "next/navigation";
import styles from "./controlNonIndex.module.css";

export default function ControlNonIndex() {
  const router = useRouter();

  const goToDatabasePage = () => {
    router.push("/unit/database");
  };
  return (
    <>
      <div className={styles.mapSection}>
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
    </>
  );
}
