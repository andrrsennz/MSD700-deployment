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
    const router = useRouter();

    const initialCheckedIndex =
        typeof window !== 'undefined' ? sessionStorage.getItem('mapIndex') : '-1';
    const parsedInitialIndex = initialCheckedIndex !== null ? parseInt(initialCheckedIndex, 10) : null;
    const [checkedIndex, setCheckedIndex] = useState<number | null>(parsedInitialIndex);

    let mapIndex: number = -1;

    if (typeof window !== 'undefined' && window.sessionStorage) {
        mapIndex = parseInt(sessionStorage.getItem('mapIndex') || '', 10);
    }

    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [data, setData] = useState<DataItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortOrderStatus, setSortOrderStatus] = useState<String>('name');
    const [sortDateOrder, setDateSortOrder] = useState<'asc' | 'desc'>('asc');
    const [deleteItemConfirm, setDeleteItemConfirm] = useState<boolean>(false);
    const [indexDelete, setIndexDelete] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [backendUrl, setBackendUrl] = useState<string>(process.env.BACKEND_URL || 'http://localhost:5000');
    const [isEditing, setIsEditing] = useState<Record<number, boolean>>({});
    const [render, setRender] = useState<boolean>(true);
    const [firstLoaded, setFirstLoaded] = useState<string>('false')
    const [showControlInstruction, setShowControlInstruction] = useState<boolean>(false);
    const [tokenExpired, setTokenExpired] = useState<boolean>(false);
    const [mobileNavigation, setMobileNavigation] = useState<boolean>(false);
    const [mobileInstruction, setMobileInstruction] = useState<boolean>(false);
    const [mobileSorterDisplay, setMobileSorterDisplay] = useState<boolean>(false);
    const [mobileMapDisplay, setMobileMapDisplay] = useState<boolean>(false);
    const [mobileMapName, setMobileMapName] = useState<string>('');
    const [mobileEditNameDisplay, setMobileEditNameDisplay] = useState<boolean>(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {

        function checkToken() {
            axios.get(`${backendUrl}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setRender(true);
                    } else {
                        setTokenExpired(true);
                    }
                })
                .catch((error) => {
                    setTokenExpired(true)
                });
        }

        function fetchData() {
            axios.get(`${backendUrl}/api/pgm_data`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            }).then((response) => {
                const data = response.data.data;
                data.forEach((item: any, index: any) => {
                    // Convert modified_time string to a Date object
                    const originalDate = new Date(item.modified_time);

                    // Format the date
                    const formattedDate = `${originalDate.getFullYear()}/${('0' + (originalDate.getMonth() + 1)).slice(-2)}/${('0' + originalDate.getDate()).slice(-2)} ${('0' + originalDate.getHours()).slice(-2)}:${('0' + originalDate.getMinutes()).slice(-2)}`;

                    // Update the modified_time property with the formatted date
                    item.modified_time = formattedDate;

                    // Add unique id (use uuidv4() if using UUIDs)
                    item.mapId = index; // or uuidv4() if UUIDs
                });

                const sortedData = data.sort((a: any, b: any) => a.map_name.localeCompare(b.map_name));

                setData(sortedData);
                setRender(true);
            }).catch((error) => {

            });
        }

        checkToken();
        fetchData();
        setFirstLoaded(sessionStorage.getItem('firstLoadDatabasePage') === null ? 'true' : 'false');

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

    const handleSortClick = (status: any, condition: any) => {
        console.log("status : ", status);
        console.log("condition : ", condition);



        if (status == "date") {
            setSortOrderStatus('date')
            if (condition.length > 0) {
                setSortOrder(condition)
            } else {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }
            const sortedDataByDate = sortByDate(data, sortOrder);
            setData(sortedDataByDate);
        } else {
            setSortOrderStatus('name')
            if (condition.length > 0) {
                setSortOrder(condition)
            } else {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }

            const sortedData = sortDataByMapName(data, sortOrder);
            setData(sortedData);

        }
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
            sessionStorage.setItem("mapIndex", "-1");
            setCheckedIndex(-1);
        } else {
            console.log("CCCC");
            setCheckedIndex(startIndex + parseInt(index));
            sessionStorage.setItem("mapIndex", String(startIndex + parseInt(index)));
            console.log("nnnn : ", data[startIndex + parseInt(index)].map_name);

            sessionStorage.setItem("mapName", data[startIndex + parseInt(index)].map_name)
        }
    };

    const handleLidarChecked = () => { }

    const goToControlWithIndex = () => {
        if (checkedIndex != -1) {
            router.push(`/unit/control?index=${checkedIndex}`);
        }
    };

    //delete Item
    const handleDeleteItem = (index: number) => {
        const dataIdx = startIndex + index;
        setDeleteItemConfirm(true);
        setIndexDelete(dataIdx);
    };

    const handleCancelDelete = () => {
        setDeleteItemConfirm(false);
        setCheckedIndex(-1);
        // setIndexDelete();
    };

    const deleteItem = (indexDelete: number) => {
        const pgm_map_name = data[indexDelete].map_name;
        const yaml_map_name = pgm_map_name.replace(".pgm", ".yaml");

        // delete pgm file
        axios.delete(`${backendUrl}/api/pgm_data`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            data: {
                map_name: pgm_map_name
            }
        })
            .then((response) => {
                console.log(response);
                // delete yaml file
                axios.delete(`${backendUrl}/api/yaml_data`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    },
                    data: {
                        map_name: yaml_map_name
                    }
                })
                    .then((response) => {
                        console.log(response)
                        // Update data
                        axios.get(`${backendUrl}/api/pgm_data`, {
                            headers: {
                                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                            }
                        })
                            .then((response) => {
                                console.log(response);
                                setData(response.data.data);
                                setDeleteItemConfirm(false);
                                setCheckedIndex(-1);
                            })
                            .catch((error) => {
                                console.log(error);
                                alert("Map failed to delete")
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        alert("Map failed to delete")
                    });
            })
            .catch((error) => {
                console.log(error);
                alert("Map failed to delete")
            });
    };

    //search Item
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);
    };

    const filteredData = data.filter((item) => {
        return item.map_name.toLowerCase().includes(searchQuery.toLowerCase());
    });



    const itemsPerPage = 10;
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Ensure currentPage doesn't exceed totalPages when search is used
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Reset to the first page when the search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentData = filteredData.slice(startIndex, endIndex);

    const handleDoubleClick = (index: number) => {
        setIsEditing({ ...isEditing, [index]: true });
    };

    const updateMapName = (index: number) => {
        const inputElement = document.getElementById(`mapNameInput${index}`);
        if (inputElement instanceof HTMLInputElement) {
            const oldName = data[startIndex + index].map_name;
            const newName = `${inputElement.value}.pgm`;

            if (newName !== oldName) {
                axios.put(`${backendUrl}/api/pgm_data`, {
                    map_name: oldName,
                    new_map_name: newName
                }, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                })
                    .then(response => {
                        console.log('PGM Data Update Response:', response);
                        if (response.status === 200) {
                            axios.get(`${backendUrl}/api/pgm_data`, {
                                headers: {
                                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                                }
                            })
                                .then(res => {
                                    const data = res.data.data
                                    setData(data);
                                    alert("Map name updated successfully");
                                })
                                .catch(err => {
                                    alert("Error refreshing data");
                                })
                        }
                        else {
                            alert("Map failed to update")
                        }
                    })
                    .catch(error => {
                        console.error('Error updating map name:', error);
                    });
            }
        } else {
            console.error('Input element not found');
        }

        setIsEditing({ ...isEditing, [index]: false });
    };

    const updateMapNameMobile = (index: any, newName: string, oldName: string) => {

        if (newName.length > 0 && newName !== oldName) {
            axios.put(`${backendUrl}/api/pgm_data`, {
                map_name: `${oldName}.pgm`,
                new_map_name: `${newName}.pgm`
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            })
                .then(response => {
                    console.log('PGM Data Update Response:', response);
                    if (response.status === 200) {
                        axios.get(`${backendUrl}/api/pgm_data`, {
                            headers: {
                                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                            }
                        })
                            .then(res => {
                                const data = res.data.data
                                setData(data);
                                alert("Map name updated successfully");
                            })
                            .catch(err => {
                                alert("Error refreshing data");
                            })
                    }
                    else {
                        alert("Map failed to update")
                    }
                })
                .catch(error => {
                    console.error('Error updating map name:', error);
                });
        } else {
            console.log("newName cannot be null");

        }
    };

    function getBaseName(fileName: any) {
        return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    }

    const handleInfoIconClick = () => {
        setShowControlInstruction(!showControlInstruction); // Toggle the state
    };

    const handleControlInstructionClick = () => {
        setShowControlInstruction(false);
        sessionStorage.setItem('firstLoadDatabasePage', 'false')
        setFirstLoaded('false')
    };

    const handleCloseButtonClick = () => {
        setShowConfirmDialog(true); // or false, depending on your logic
    };

    let pathname = usePathname()
    let iconPage;

    if (pathname == "/unit/control") {
        pathname = "Control Mode"
        iconPage = "/icons/Marker.svg"
    }

    if (pathname == "/unit/mapping") {
        pathname = "Mapping"
        iconPage = "/icons/mapping.svg"
    }

    if (pathname == "/unit/database") {
        pathname = "Database"
        iconPage = "/icons/database.svg"
    }

    const handleMobileNavigation = () => {
        setMobileNavigation(!mobileNavigation);
    }

    const handleMobileInstruction = () => {
        setMobileInstruction(!mobileInstruction);

        sessionStorage.setItem('firstLoadDatabasePage', 'false')
        setFirstLoaded('false')
    }

    const handleMobileSorterDisplay = () => {
        setMobileSorterDisplay(!mobileSorterDisplay)
    }

    // Define the media query for max-width: 360px
    const mediaQuery = window.matchMedia("(max-width: 1400px)");

    // Check if the media query matches and call the function if it does
    function handleMobileMapDisplay(mapName: any, index: any) {
        const width = window.innerWidth;

        if (width < 1400) {
            if (mapIndex == startIndex + parseInt(index)) {
                sessionStorage.setItem("mapIndex", "-1");
                setCheckedIndex(-1);
            } else {
                setCheckedIndex(startIndex + parseInt(index));
                sessionStorage.setItem("mapIndex", String(startIndex + parseInt(index)));
            }

            let dotIndex = mapName.lastIndexOf(".");

            setMobileMapName(mapName.substring(0, dotIndex))
            setCheckedIndex(startIndex + parseInt(index));
            setMobileMapDisplay(!mobileMapDisplay)
        }
    }


    const handleMobileEditName = () => {
        setMobileEditNameDisplay(!mobileEditNameDisplay)
        setMobileMapDisplay(!mobileMapDisplay)
    }

    const handleNewNameChange = (event: any) => {
        setNewName(event.target.value);
    };

    const handleMapPreview = () => {}

    const handlePseudo = () => { }

    return (
        <>  {render ?
            (
                <>
                    {' '}
                    <Head>
                        <title>Database</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    </Head>
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

                    {mobileNavigation ? <MobileNavigation onClick={handleMobileNavigation} /> : ""}
                    {mobileInstruction || firstLoaded == 'true' ? <MobileInstruction onClick={handleMobileInstruction} imgUrl={"/images/mobile_instruction_database.svg"} /> : ""}


                    <TokenExpired status={tokenExpired} />

                    {/* MOBILE SECTION */}
                    <div
                        className={`${styles.displayNone}  ${mobileSorterDisplay ? styles.mobileSortingnBackground : ""} ${mobileSorterDisplay ? styles.mobileDisplayFlex : ""}`}
                        onClick={handleMobileSorterDisplay}
                    >
                        <div className={`${styles.mobileSorting}`}>
                            <div className={styles.topSection}>
                                <p>Sort By</p>
                            </div>

                            <div className={styles.mainSection}>
                                <div className={`${styles.mapNameSection} ${styles.columnSection}`}>
                                    <div className={styles.title}>
                                        <p>Map Name</p>
                                    </div>
                                    <div className={styles.iconSection}>
                                        <div className={`${styles.sortIcon} ${sortOrderStatus == 'name' && sortOrder == 'asc' ? styles.sortIconActive : ""}`} onClick={() => handleSortClick('name', 'asc')}>
                                            <img src="/icons/dsc_icon.svg" alt="" />
                                        </div>
                                        <div className={`${styles.sortIcon} ${sortOrderStatus == 'name' && sortOrder == 'desc' ? styles.sortIconActive : ""}`} onClick={() => handleSortClick('name', 'desc')}>
                                            <img src="/icons/asc_icon.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className={`${styles.dateModifiedSection} ${styles.columnSection}`}>
                                    <div className={styles.title}>
                                        <p>Date Modified</p>
                                    </div>
                                    <div className={styles.iconSection}>
                                        <div className={`${styles.sortIcon} ${sortOrderStatus == 'date' && sortOrder == 'asc' ? styles.sortIconActive : ""}`} onClick={() => handleSortClick('date', 'asc')}>
                                            <img src="/icons/dsc_icon.svg" alt="" />
                                        </div>
                                        <div className={`${styles.sortIcon} ${sortOrderStatus == 'date' && sortOrder == 'desc' ? styles.sortIconActive : ""}`} onClick={() => handleSortClick('date', 'desc')}>
                                            <img src="/icons/asc_icon.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.titleBottomSection}>
                                <p>Tap outside this box to exit</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${styles.displayNone}  ${mobileMapDisplay ? styles.mobileMapSelectorBackground : ""} ${mobileMapDisplay ? styles.mobileDisplayFlex : ""}`}
                    >
                        <div className={`${styles.mobileMapSelector}`}>
                            <div className={`${styles.mobileMapPreview}`}>
                                <img src="/images/map.png" alt="" />
                            </div>
                            <div className={`${styles.mobileMapName}`}>
                                <p>{mobileMapName}</p>
                            </div>
                            <div className={`${styles.mobileMapButtonSection}`}>
                                <div className={`${styles.editNameButton}`} onClick={handleMobileEditName}>
                                    <img src="/icons/pencil.svg" alt="" />
                                </div>
                                <div className={`${styles.removeButton}`}>
                                    <img src="/icons/delete_mode_list.svg" alt="" />
                                </div>
                            </div>
                            <div className={`${styles.mobileGoToMap}`}>
                                <div
                                    className={`${styles.confirmMappingChoosed}`}
                                    onClick={goToControlWithIndex}
                                >
                                    <p>Go to the Map</p>
                                    <Image src="/icons/3.svg" width={20} height={20} alt="play" />
                                </div>
                            </div>
                            <div className={`${styles.mobileMapSelectorButton}`} onClick={() => handleMobileMapDisplay("", "-1")}>
                                <p>Choose Another Map</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.displayNone}  ${mobileEditNameDisplay ? styles.mobileEditNameBackground : ""} ${mobileEditNameDisplay ? styles.mobileDisplayFlex : ""}`}>
                        <div className={styles.mobileEditName}>

                            <div className={styles.columnName}>
                                <div className={styles.title}>
                                    Current
                                </div>
                                <div className={styles.input}>
                                    <p>:</p>
                                    <input type="text" placeholder={mobileMapName} disabled />
                                </div>
                            </div>

                            <div className={styles.columnName}>
                                <div className={styles.title}>
                                    New Name
                                </div>
                                <div className={styles.input}>
                                    <p>:</p>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newName}
                                        onChange={handleNewNameChange}
                                    />
                                </div>
                            </div>

                            <div className={`${styles.buttonSection}`}>
                                <div className={`${styles.rename}`} onClick={() => updateMapNameMobile(checkedIndex, newName, mobileMapName)}>
                                    <p>Rename</p>
                                </div>
                                <div className={`${styles.cancel}`} onClick={handleMobileEditName}>
                                    <p>Cancel</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ----------------- */}

                    <div className={styles.container}>
                        {showControlInstruction || firstLoaded == 'true' ? <ControlInstruction onClick={handleControlInstructionClick} height={80} imgUrl='/images/instruction_database.svg' /> : ''}

                        <div className={styles.parents}>
                            <div className={`${styles.topSection} ${styles.mobileDisplayNone}`}>
                                <GreetingsUnit />
                            </div>

                            <MobileTopSection onConfirmButtonClick={handleCloseButtonClick} />

                            <div className={styles.mobileDisplayNone}>
                                <CloseButton onClick={onConfirmButtonClick} />
                            </div>


                            <div className={styles.unitParents}>
                                <div className={`${styles.navigation} ${styles.mobileDisplayNone}`}>
                                    <Navigation />
                                </div>

                                <MobileLidarSection // Use the new component here
                                    isChecked={isChecked}
                                    handleCheckboxChange={handleLidarChecked}
                                />

                                {/* MOBILE SECTION */}
                                <div className={styles.mapSection}>
                                    <div className={`${styles.topSection} ${styles.mobileDisplayNone}`}>
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
                                            <img src="/icons/search_icon.svg" alt="" className={styles.largeScreenImage} />
                                        </div>
                                    </div>


                                    <div className={styles.mainSection}>

                                        <div className={`${styles.displayNone} ${styles.searchBarMobile} `}>
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={searchQuery} // Set the input value to searchQuery
                                                onChange={handleSearchInputChange} // Call the handler on input change
                                            />
                                            <img src="/icons/search_icon.svg" alt="" className={styles.largeScreenImage} />
                                        </div>

                                        <table className={styles.theTable}>
                                            <thead>
                                                <tr className={styles.header}>
                                                    <th className={styles.idColumn} >No.</th>
                                                    <th className={`${styles.sortableHeader} ${styles.mapNameColumn} `}>
                                                        <div className={`${styles.headerContent} ${styles.spanSorter} `}>
                                                            <span>Map Name</span>
                                                        </div>
                                                        <Image
                                                            className={styles.mobileDisplayNone}
                                                            alt=""
                                                            src={`/icons/${sortOrder}ending.svg`}
                                                            width={40}
                                                            height={40}
                                                            onClick={() => handleSortClick('name', '')}
                                                        />
                                                    </th>
                                                    <th className={`${styles.sortableHeader} ${styles.dateModifiedColumn}`}>
                                                        <div className={`${styles.headerContent} ${styles.spanSorter} `}>
                                                            <span>Date Modified</span>
                                                        </div>
                                                        <Image
                                                            className={styles.mobileDisplayNone}
                                                            alt=""
                                                            src={`/icons/${sortDateOrder}ending.svg`}
                                                            width={40}
                                                            height={40}
                                                            onClick={() => handleSortClick('date', '')}
                                                        />
                                                    </th>
                                                    <th className={`${styles.fileType} ${styles.mobileDisplayNone}`}>File Type</th>
                                                    <th className={`${styles.fileSize} ${styles.mobileDisplayNone}`}>Size</th>
                                                    <th className={`${styles.selectedMap} ${styles.mobileDisplayNone}`}>Selected<br /> Map to Load</th>
                                                    <th className={`${styles.delete} ${styles.mobileDisplayNone}`}>Delete</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {currentData.map((item, index) => (
                                                    <tr key={index} onClick={() => handleMobileMapDisplay(item.map_name, index)}>
                                                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>

                                                        <td onDoubleClick={() => handleDoubleClick(index)}>
                                                            {isEditing[index] ? (
                                                                <input
                                                                    type="text"
                                                                    id={`mapNameInput${index}`} // Assign the ID here
                                                                    defaultValue={getBaseName(item.map_name)} // Remove the extension before editing
                                                                    onBlur={() => updateMapName(index)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                getBaseName(item.map_name) // Display the name without the extension
                                                            )}
                                                        </td>

                                                        <td className={styles.sortableHeader}>{item.modified_time}</td>
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
                                                        <td className={`${styles.dark} ${styles.delete} ${styles.mobileDisplayNone}`}>
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
                                        <div
                                            className={`${styles.confirmMappingChoosed} ${(initialCheckedIndex !== null && parseInt(initialCheckedIndex) > -1) || mapIndex > -1
                                                ? ""
                                                : styles.disable
                                                } ${styles.mobileDisplayNone}`}
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

                                <MobileBottomSection
                                    handleMobileNavigation={handleMobileNavigation}
                                    handleMapPreview={handleMapPreview}
                                    handleMobileInstruction={handleMobileInstruction}
                                    handleMobileSorterDisplay={handleMobileSorterDisplay}
                                    mapIndex={false}
                                />

                            </div>

                            <ButtonInformation onClick={handleInfoIconClick} />


                            <div className={`${styles.mobileDisplayNone}`}>
                                <Footer status={false} />
                            </div>
                        </div>
                    </div>
                </>
            ) : <></>}
        </>
    );
}
