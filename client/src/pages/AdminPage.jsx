import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

const AdminPage = () => {
    const [name, setName] = useState('');
    const [truckName, setTruckName] = useState('');
    const [excelColumns, setExcelColumns] = useState([]);
    const [parsedData, setParsedData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const predefinedColumns = [
        'EFR', 'HRTVD', 'MET', 'ROT', 'ES', 'OP', 'EAPP', 'OT', 'CBP', 
        'RP', 'WBVS', 'FBP', 'CT', 'TKPH', 'ES', 'LS', 'STB'
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const fileHeaders = jsonData[0].slice(0, 17);
            const rows = jsonData.slice(1).map(row => row.slice(0, 17));

            setExcelColumns(fileHeaders);
            setParsedData(rows);
        };

        reader.readAsArrayBuffer(file);
    };

    const getColumnData = (columnName) => {
        const colIndex = excelColumns.indexOf(columnName);
        if (colIndex !== -1) {
            return parsedData.map((row) => row[colIndex] || 0);
        } else {
            return Array(parsedData.length).fill(0);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/upload', {
                name,
                truckName,
                fileData: parsedData,
                excelColumns
            });

            if (response.data.success) {
                alert(`Score calculated: ${response.data.score}`);
                fetchLeaderboard();
            }
        } catch (error) {
            console.error('Error uploading data:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = parsedData.slice(indexOfFirstRow, indexOfLastRow);

    const rowRenderer = ({ index, key, style }) => (
        <div key={key} style={style} className="flex border-b-2 border-b-black">
            {predefinedColumns.map((col, colIndex) => {
                const columnData = getColumnData(col);
                return (
                    <div key={colIndex} className="flex-1 p-[5px] text-center">
                        {columnData[indexOfFirstRow + index]}
                    </div>
                );
            })}
        </div>
    );

    const nextPage = () => {
        if (currentPage * rowsPerPage < parsedData.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            <h2>Admin Page</h2>

            <div>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Truck Name"
                    value={truckName}
                    onChange={(e) => setTruckName(e.target.value)}
                />
                <input type="file" onChange={handleFileChange} />
            </div>

            <h3>Data from Excel (Matched with Predefined Columns)</h3>
            {parsedData.length > 0 && (
                <div>
                    {/* Column Headers */}
                    <div className="flex border-b-2 border-black bg-gray-200">
                        {predefinedColumns.map((col, index) => (
                            <div key={index} className="flex-1 px-[10px] py-[5px] text-center font-bold">
                                {col}
                            </div>
                        ))}
                    </div>

                    {/* Virtualized List */}
                    <div style={{ height: '400px', width: '100%' }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    height={height}
                                    width={width}
                                    rowHeight={40}
                                    rowCount={currentRows.length}
                                    rowRenderer={rowRenderer}
                                />
                            )}
                        </AutoSizer>
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                        <button onClick={prevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button onClick={nextPage} disabled={currentPage * rowsPerPage >= parsedData.length}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            <button onClick={handleSubmit}>Calculate Score</button>

            <h3>Leaderboard</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Truck Name</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.name}</td>
                            <td>{entry.truckName}</td>
                            <td>{entry.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;
