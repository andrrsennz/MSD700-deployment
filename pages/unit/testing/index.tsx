import React, { useEffect, useState } from 'react';
import ConfirmElement from '@/components/confirm-element/confirmElement';
import Navigation from '@/components/unit-navigation/navigation';
import styles from './database.module.css';
import CloseButton from '@/components/close-button/closeButton';
import Footer from '@/components/footer/footer';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import ConfirmDelete from '@/components/confirm-delete/confirmDelete';
import axios from 'axios';
import Head from 'next/head';
import ButtonInformation from '@/components/unit-information-button/unitInformationButton';
import ControlInstruction from '@/components/control-instruction/controlInstruction';
import TokenExpired from '@/components/token-expired/tokenExpired';
import MobileTopSection from '@/components/mobile-top-section/mobileTopSection';
import MobileNavigation from '@/components/mobile-navigation/mobileNavigation';
import MobileInstruction from '@/components/mobile-instruction/mobileInstruction';
import GreetingsUnit from '@/components/greetings-unit/greetingsUnit';
import MobileBottomSection from '@/components/mobile-bottom-section/mobileBottomSection';
import MobileLidarSection from '@/components/mobile-lidar-section/mobileLidarSection';

interface DataItem {
    mapId: any;
    map_name: string;
    modified_time: string;
    file_type: string;
    file_size: string;
}

export default function Database(): JSX.Element {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const initialCheckedIndex =
        typeof window !== 'undefined' ? sessionStorage.getItem('mapIndex') : '-1';
    const parsedInitialIndex = initialCheckedIndex !== null ? parseInt(initialCheckedIndex, 10) : null;
    const [checkedIndex, setCheckedIndex] = useState<number | null>(parsedInitialIndex);
    const [data, setData] = useState<DataItem[]>([
        {
            "mapId": "1",
            "map_name": "20230804_Room A",
            "modified_time": "2023/08/04 11:30 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "2",
            "map_name": "20230804_Room B",
            "modified_time": "2023/08/04 11:37 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "3",
            "map_name": "20230804_Room C",
            "modified_time": "2023/08/04 11:53 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "4",
            "map_name": "20230804_Room D",
            "modified_time": "2023/08/04 11:23 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "5",
            "map_name": "20230804_Room E",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "6",
            "map_name": "20230804_Room F",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "7",
            "map_name": "20230804_Room G",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "8",
            "map_name": "20230804_Room H",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "9",
            "map_name": "20230804_Room I",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "10",
            "map_name": "20230804_Room J",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "1",
            "map_name": "20230804_Room A",
            "modified_time": "2023/08/04 11:30 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "2",
            "map_name": "20230804_Room B",
            "modified_time": "2023/08/04 11:37 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "3",
            "map_name": "20230804_Room C",
            "modified_time": "2023/08/04 11:53 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "4",
            "map_name": "20230804_Room D",
            "modified_time": "2023/08/04 11:23 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "5",
            "map_name": "20230804_Room E",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "6",
            "map_name": "20230804_Room F",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "7",
            "map_name": "20230804_Room G",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "8",
            "map_name": "20230804_Room H",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "9",
            "map_name": "20230804_Room I",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "10",
            "map_name": "20230804_Room J",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "1",
            "map_name": "20230804_Room A",
            "modified_time": "2023/08/04 11:30 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "2",
            "map_name": "20230804_Room B",
            "modified_time": "2023/08/04 11:37 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "3",
            "map_name": "20230804_Room C",
            "modified_time": "2023/08/04 11:53 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "4",
            "map_name": "20230804_Room D",
            "modified_time": "2023/08/04 11:23 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "5",
            "map_name": "20230804_Room E",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "6",
            "map_name": "20230804_Room F",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "7",
            "map_name": "20230804_Room G",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "8",
            "map_name": "20230804_Room H",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "9",
            "map_name": "20230804_Room I",
            "modified_time": "2023/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        },
        {
            "mapId": "10",
            "map_name": "tes",
            "modified_time": "2021/08/04 11:35 AM",
            "file_type": "PGM",
            "file_size": "120 MB"
        }
    ]);
    const [render, setRender] = useState<boolean>(true);
    const router = useRouter();
    const [indexMapChoosed, setIndexMapChoosed] = useState();


    let mapIndex: number = -1;

    if (typeof window !== 'undefined' && window.sessionStorage) {
        mapIndex = parseInt(sessionStorage.getItem('mapIndex') || '', 10);
    }

    
    const filteredData = data.filter((item) => {
        // return item.map_name.toLowerCase().includes(searchQuery.toLowerCase());
    });


    const itemsPerPage = 10;
    const totalItems = filteredData.length;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handleCheckboxChange = (index: string) => {
        if (checkedIndex == parseInt(index)) {

        } else {
            if (mapIndex == startIndex + parseInt(index)) {
                sessionStorage.setItem("mapIndex", "-1");
                setCheckedIndex(-1);
            } else {
                setCheckedIndex(startIndex + parseInt(index));
                sessionStorage.setItem("mapIndex", String(startIndex + parseInt(index)));
                sessionStorage.setItem("mapName", data[startIndex + parseInt(index)].map_name)
            }
        }

    };

    const goToControlWithIndex = () => {
        if (checkedIndex != -1) {
            router.push(`/unit/control?index=${checkedIndex}`);
        }
    };

    return (
        <>
            {render ?
                (
                    <>
                        {' '}
                        <Head>
                            <title>Database</title>
                            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                        </Head>


                        <div className={styles.container}>

                            <div className={styles.parents}>

                                <div className={styles.unitParents}>

                                    {/* MOBILE SECTION */}
                                    <div className={styles.mapSection}>


                                        <div className={styles.mainSection}>

                                            <table className={styles.theTable}>
                                                <tbody>
                                                    {currentData.map((item, index) => {
                                                        return (
                                                            (
                                                                <tr key={index}  className={indexMapChoosed == index ? styles.mapMobileSelected : ''}>
                                                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                                                    <td className={`${styles.mobileDisplayNone}`}>{item.file_type}</td>
                                                                    <td className={`${styles.fileSize} ${styles.mobileDisplayNone}`}>{item.file_size}</td>
                                                                    <td className={`${styles.dark} ${styles.mobileDisplayNone}`}>
                                                                        <div className={`${styles.inputContainer}`}>
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`checklistItem${index}`}
                                                                                checked={checkedIndex == item.mapId}
                                                                                onChange={() => handleCheckboxChange(item.mapId)}
                                                                            />
                                                                            <label htmlFor={`checklistItem${index}`}></label>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className={styles.bottomSection}>
                                            <div
                                                className={`${styles.confirmMappingChoosed} 
                                                ${(initialCheckedIndex !== null
                                                        && parseInt(initialCheckedIndex) > -1) || mapIndex > -1 ? ""
                                                        : styles.disable
                                                    } ${styles.mobileDisplayNone}`}
                                                onClick={goToControlWithIndex}
                                            >
                                                <p>Go to the Map</p>
                                                <Image src="/icons/3.svg" width={20} height={20} alt="play" />
                                            </div>

     
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : <></>}
        </>
    );
}
