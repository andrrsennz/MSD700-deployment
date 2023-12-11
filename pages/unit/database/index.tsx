import React, { useEffect, useState } from 'react';
import ConfirmElement from '../../../components/confirm-element/confirmElement';
import Navigation from '../../../components/unit-navigation/navigation';
import styles from './database.module.css';
import CloseButton from '../../../components/close-button/closeButton';
import Footer from '../../../components/footer/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ConfirmDelete from '../../../components/confirm-delete/confirmDelete';
import axios from 'axios';

interface DataItem {
    map_name: string;
    modified_time: string;
    file_type: string;
    file_size: string;
}

export default function Database(): JSX.Element {
    const router = useRouter();

    const initialCheckedIndex =
        typeof window !== 'undefined' ? localStorage.getItem('mapIndex') : '-1';
    const parsedInitialIndex = initialCheckedIndex !== null ? parseInt(initialCheckedIndex, 10) : null;
    const [checkedIndex, setCheckedIndex] = useState<number | null>(parsedInitialIndex);

    let mapIndex: number = -1;

    if (typeof window !== 'undefined' && window.localStorage) {
        mapIndex = parseInt(localStorage.getItem('mapIndex') || '', 10);
    }

    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [data, setData] = useState<DataItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortDateOrder, setDateSortOrder] = useState<'asc' | 'desc'>('asc');
    const [deleteItemConfirm, setDeleteItemConfirm] = useState<boolean>(false);
    const [indexDelete, setIndexDelete] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const itemsPerPage = 10;
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    useEffect(() => {
        async function fetchData() {
            try {
                const response_axios = await axios.get("http://localhost:5000/api/pgm_data");
                const data = response_axios.data.data;
                // console.log(data);
                setData(data);

                // const response = await fetch('/data.json');
                // const jsonData = await response.json();
                // console.log(jsonData.data)
                // setData(jsonData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    function sortByDate(data: DataItem[], sortDateOrder: 'asc' | 'desc'): DataItem[] {
        return data.sort((a, b) => {
            const dateA = new Date(a.modified_time);
            const dateB = new Date(b.modified_time);

            if (sortDateOrder === "asc") {
                if (dateA < dateB) {
                    return -1;
                } else if (dateA > dateB) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (sortDateOrder === "desc") {
                if (dateA < dateB) {
                    return 1;
                } else if (dateA > dateB) {
                    return -1;
                } else {
                    return 0;
                }
            }

            return 0;
        });
    }
    // Function to sort data by map_name
    const sortDataByMapName = (data: DataItem[], sortOrder: 'asc' | 'desc'): DataItem[] => {
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const nameA = a.map_name.toUpperCase();
            const nameB = b.map_name.toUpperCase();
            if (sortOrder === "asc") {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
        return sortedData;
    };

    const handleSortClick = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        const sortedData = sortDataByMapName(data, sortOrder);
        setData(sortedData);
    };

    const handleDateSortClick = () => {
        setDateSortOrder(sortDateOrder === "asc" ? "desc" : "asc");
        const sortedDataByDate = sortByDate(data, sortDateOrder);
        setData(sortedDataByDate);
    };

    const onConfirmButtonClick = () => {
        setShowConfirmDialog(true);
    };

    const handleCancel = () => {
        setShowConfirmDialog(false);
    };

    const handlePaginationButtonClick = (buttonType: 'first' | 'prev' | 'next' | 'last') => {
        switch (buttonType) {
            case "first":
                setCurrentPage(1);
                break;
            case "prev":
                if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                break;
            case "next":
                if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                }
                break;
            case "last":
                setCurrentPage(totalPages);
                break;
            default:
                break;
        }
    };

    const handleCheckboxChange = (index: string) => {
        if (mapIndex == parseInt(index)) {
            console.log("nnnn");
            localStorage.setItem("mapIndex", "-1");
            setCheckedIndex(-1);
        } else {
            console.log("ppp");
            setCheckedIndex(parseInt(index));
            localStorage.setItem("mapIndex", index);
            localStorage.setItem("mapName", data[startIndex + parseInt(index)].map_name)
        }
    };

    const goToControlWithIndex = () => {
        if (checkedIndex != -1) {
            router.push(`/unit/control?index=${checkedIndex}`);
        }
    };

    //delete Item
    const handleDeleteItem = (index: number) => {
        setDeleteItemConfirm(true);
        setIndexDelete(index);
    };

    const handleCancelDelete = () => {
        setDeleteItemConfirm(false);
        setCheckedIndex(-1);
        // setIndexDelete();
    };

    const deleteItem = (indexDelete: number) => {
        const newData = data.filter((item, index) => index !== indexDelete);

        // Update the state with the new array without the deleted item
        setData(newData);
    };

    //search Item
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);
    };

    const filteredData = data.filter((item) => {
        // Modify the conditions based on your data structure and search logic
        return item.map_name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const currentData = filteredData.slice(startIndex, endIndex);

    return (
        <>
            {' '}
            <ConfirmElement
                message="Are you sure you want to close this app?"
                status={showConfirmDialog}
                onCancel={handleCancel}
            />
            <ConfirmDelete
                message="Are you sure you want to delete the map?"
                status={deleteItemConfirm}
                onCancel={handleCancelDelete}
                onConfirm={() => deleteItem(indexDelete)}
            />
            <div className={styles.container}>
                <div className={styles.parents}>
                    <CloseButton onClick={onConfirmButtonClick} />
                    <div className={styles.navigation}>
                        <Navigation />
                    </div>
                    <div className={styles.mapSection}>
                        <div className={styles.topSection}>
                            <div className="">
                                <p>Map Collection</p>
                            </div>

                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery} // Set the input value to searchQuery
                                    onChange={handleSearchInputChange} // Call the handler on input change
                                />
                                <Image
                                    src="/icons/search-cion.svg"
                                    alt=""
                                    height={20}
                                    width={20}
                                />
                            </div>
                        </div>

                        <div className={styles.mainSection}>
                            <table className={styles.theTable}>
                                <thead>
                                    <tr className={styles.header}>
                                        <th>No.</th>
                                        <th className={styles.sortableHeader}>
                                            <div className={styles.headerContent}>
                                                <span>Map Name</span>
                                                <Image
                                                    alt=""
                                                    src={`/icons/${sortOrder}ending.svg`} // Use different icons for ascending and descending
                                                    width={40}
                                                    height={40}
                                                    onClick={handleSortClick}
                                                />
                                            </div>
                                        </th>
                                        <th className={styles.sortableHeader}>
                                            <div className={styles.headerContent}>
                                                <span>Date Modified</span>
                                                <Image
                                                    alt=""
                                                    src={`/icons/${sortDateOrder}ending.svg`}
                                                    width={40}
                                                    height={40}
                                                    onClick={handleDateSortClick}
                                                />
                                            </div>
                                        </th>
                                        <th>File Type</th>
                                        <th>File Size</th>
                                        <th className={styles.selectedMap}>Selected Map to Load</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                            <td>{item.map_name}</td>
                                            <td>{item.modified_time}</td>
                                            <td>{item.file_type}</td>
                                            <td>{item.file_size}</td>
                                            <td className={`${styles.dark} `}>
                                                <div className={`${styles.inputContainer}`}>
                                                    <input
                                                        type="checkbox"
                                                        id={`checklistItem${index}`}
                                                        checked={mapIndex == index}
                                                        onChange={() => handleCheckboxChange(index.toString())}
                                                    />
                                                    <label htmlFor={`checklistItem${index}`}></label>
                                                </div>
                                            </td>
                                            <td className={`${styles.dark} ${styles.delete}`}>
                                                <Image
                                                    src="/icons/Delete.svg"
                                                    alt="Delete icons"
                                                    height={30}
                                                    width={30}
                                                    onClick={() => handleDeleteItem(index)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.bottomSection}>
                            <div className={styles.warning}>
                                <img
                                    src="/icons/information-circle-svgrepo-com (1).svg"
                                    alt=""
                                />
                                <p>Rename the map by double-click the name</p>
                            </div>
                            <div
                                className={`${styles.confirmMappingChoosed} ${(initialCheckedIndex !== null && parseInt(initialCheckedIndex) > -1) || mapIndex > -1
                                        ? ""
                                        : styles.disable
                                    }`}
                                onClick={goToControlWithIndex}
                            >
                                <p>Go to the Map</p>
                                <Image src="/icons/3.svg" width={20} height={20} alt="play" />
                            </div>

                            <div className={styles.pagination}>
                                <button
                                    className={`${styles.bottonPagination} ${currentPage === 1 ? styles.buttonDisable : ""
                                        }`}
                                    onClick={() => handlePaginationButtonClick("first")}
                                    disabled={currentPage === 1}
                                >
                                    <Image
                                        src="/icons/2 left.svg"
                                        alt="button left"
                                        width={10}
                                        height={10}
                                    />
                                </button>
                                <button
                                    className={`${styles.bottonPagination} ${currentPage === 1 ? styles.buttonDisable : ""
                                        }`}
                                    onClick={() => handlePaginationButtonClick("prev")}
                                    disabled={currentPage === 1}
                                >
                                    <Image
                                        src="/icons/1 left.svg"
                                        alt="button left"
                                        width={10}
                                        height={10}
                                    />
                                </button>

                                <div className={styles.currentPage}>
                                    <input
                                        className={styles.pageInput}
                                        type="text"
                                        value={currentPage}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            if (
                                                /^[0-9]*$/.test(newValue) &&
                                                parseInt(newValue) >= 1 &&
                                                parseInt(newValue) <= totalPages
                                            ) {
                                                setCurrentPage(parseInt(newValue));
                                            }
                                        }}
                                    />
                                </div>

                                <p>of</p>
                                <p>{totalPages}</p>
                                <button
                                    className={`${styles.bottonPagination} ${currentPage === totalPages ? styles.buttonDisable : ""
                                        }`}
                                    onClick={() => handlePaginationButtonClick("next")}
                                    disabled={currentPage === totalPages}
                                >
                                    <Image
                                        src="/icons/1 right.svg"
                                        alt="button 1 right"
                                        width={10}
                                        height={10}
                                    />
                                </button>
                                <button
                                    className={`${styles.bottonPagination} ${currentPage === totalPages ? styles.buttonDisable : ""
                                        }`}
                                    onClick={() => handlePaginationButtonClick("last")}
                                    disabled={currentPage === totalPages}
                                >
                                    <Image
                                        src="/icons/2 right.svg"
                                        alt="button 2 right"
                                        width={10}
                                        height={10}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <Footer status={true} />
                </div>
            </div>
        </>
    );
}
