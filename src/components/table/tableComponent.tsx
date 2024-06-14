import React from 'react';
import styles from './tableComponent.module.css';
import Image from 'next/image';

interface TableComponentProps {
    data: { id: number; unit: string; status: string; battery: string; uptime: string; }[];
    handleRowClick: (index: number) => void;
    selectedRowIdx: number | null;
    handleStartButtonClick: () => void;
}

const TableComponent: React.FC<TableComponentProps> = ({ data, handleRowClick, selectedRowIdx, handleStartButtonClick }) => {

    return (
        <div className={styles.tableUnit}>
            <div className={styles.tableWrapper}>
                <div className={styles.tableHeaderContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th className={styles.id}>No.</th>
                                <th className={styles.unit}>MSD700 Unit</th>
                                <th className={styles.status}>Status</th>
                                <th className={styles.battery}>Battery</th>
                                <th className={styles.uptime}>Uptime</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className={styles.tableBodyContainer}>
                    <table>
                        <tbody>
                            {data.map((row, index) => (
                                <tr
                                    key={index}
                                    onClick={() => handleRowClick(index)}
                                    className={`${row.status == 'off' ? styles.offRow : ''} ${selectedRowIdx === index ? styles.selectedRow : ''}`}
                                >
                                    <td className={styles.id}>{index + 1}</td>
                                    <td className={styles.unit}>{row.unit}</td>
                                    <td className={styles.status}>{row.status}</td>
                                    <td className={styles.battery}>{row.battery}</td>
                                    <td className={styles.uptime}>{row.uptime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <button
                aria-label="Submit form Button"
                className={styles.loginFormButton}
                onClick={handleStartButtonClick}
            >
                <p>Start</p>
                <Image
                    src="/icons/new-play-button.png"
                    alt=""
                    width={500}
                    height={500}
                />
            </button>
        </div>
    );
};

export default TableComponent;
