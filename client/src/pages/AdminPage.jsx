import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

const AdminPage = () => {
    const [name, setName] = useState('');
    const [truckName, setTruckName] = useState('');
    const [mechanicalData, setMechanicalData] = useState([]);
    const [behavioralData, setBehavioralData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentMechanicalPage, setCurrentMechanicalPage] = useState(1);
    const [currentBehavioralPage, setCurrentBehavioralPage] = useState(1);
    const rowsPerPage = 10;

    const mechanicalPredefinedColumns = [
        'EFR', 'HRTVD', 'MET', 'ROT', 'ES', 'OP', 'EAPP', 'OT', 'CBP', 
        'RP', 'WBVS', 'FBP', 'CT'
    ];

    const behavioralPredefinedColumns = ['TKPH', 'ES', 'LS', 'STB'];

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const fileHeaders = jsonData[0];
            const rows = jsonData.slice(1);

            const predefinedColumns = type === 'mechanical' ? mechanicalPredefinedColumns : behavioralPredefinedColumns;

            // Map the data to predefined columns, filling missing values with zero
            const matchedData = rows.map((row) => {
                return predefinedColumns.map((col) => {
                    const colIndex = fileHeaders.indexOf(col);
                    return colIndex !== -1 && row[colIndex] !== undefined ? row[colIndex] : 0;
                });
            });

            if (type === 'mechanical') {
                setMechanicalData(matchedData);
            } else {
                setBehavioralData(matchedData);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('https://project-coal-backend.onrender.com/api/upload', {
                name,
                truckName,
                mechanicalData,
                behavioralData,
                mechanicalColumns: mechanicalPredefinedColumns,
                behavioralColumns: behavioralPredefinedColumns
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
            const response = await axios.get('https://project-coal-backend.onrender.com/api/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Pagination control functions for mechanical data
    const paginatedMechanicalData = mechanicalData.slice(
        (currentMechanicalPage - 1) * rowsPerPage,
        currentMechanicalPage * rowsPerPage
    );

    const nextMechanicalPage = () => {
        if (currentMechanicalPage * rowsPerPage < mechanicalData.length) {
            setCurrentMechanicalPage(currentMechanicalPage + 1);
        }
    };

    const prevMechanicalPage = () => {
        if (currentMechanicalPage > 1) {
            setCurrentMechanicalPage(currentMechanicalPage - 1);
        }
    };

    // Pagination control functions for behavioral data
    const paginatedBehavioralData = behavioralData.slice(
        (currentBehavioralPage - 1) * rowsPerPage,
        currentBehavioralPage * rowsPerPage
    );

    const nextBehavioralPage = () => {
        if (currentBehavioralPage * rowsPerPage < behavioralData.length) {
            setCurrentBehavioralPage(currentBehavioralPage + 1);
        }
    };

    const prevBehavioralPage = () => {
        if (currentBehavioralPage > 1) {
            setCurrentBehavioralPage(currentBehavioralPage - 1);
        }
    };

    const rowRenderer = (data) => ({ index, key, style }) => (
        <div key={key} style={style} className="flex border-b-2 border-b-black">
            {data[index].map((cell, colIndex) => (
                <div key={colIndex} className="flex-1 p-[5px] text-center">
                    {cell || 0}
                </div>
            ))}
        </div>
    );

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
                <div>
                    <label>Mechanical File</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'mechanical')} />
                </div>
                <div>
                    <label>Behavioral File</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'behavioral')} />
                </div>
            </div>

            <h3>Mechanical Data (Matched with Predefined Columns)</h3>
            {mechanicalData.length > 0 && (
                <div>
                    <div className="flex border-b-2 border-black bg-gray-200">
                        {mechanicalPredefinedColumns.map((col, index) => (
                            <div key={index} className="flex-1 px-[10px] py-[5px] text-center font-bold">
                                {col}
                            </div>
                        ))}
                    </div>

                    <div style={{ height: '400px', width: '100%' }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    height={height}
                                    width={width}
                                    rowHeight={40}
                                    rowCount={paginatedMechanicalData.length}
                                    rowRenderer={rowRenderer(paginatedMechanicalData)}
                                />
                            )}
                        </AutoSizer>
                    </div>

                    <div className="pagination-controls">
                        <button onClick={prevMechanicalPage} disabled={currentMechanicalPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentMechanicalPage}</span>
                        <button onClick={nextMechanicalPage} disabled={currentMechanicalPage * rowsPerPage >= mechanicalData.length}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            <h3>Behavioral Data (Matched with Predefined Columns)</h3>
            {behavioralData.length > 0 && (
                <div>
                    <div className="flex border-b-2 border-black bg-gray-200">
                        {behavioralPredefinedColumns.map((col, index) => (
                            <div key={index} className="flex-1 px-[10px] py-[5px] text-center font-bold">
                                {col}
                            </div>
                        ))}
                    </div>

                    <div style={{ height: '400px', width: '100%' }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    height={height}
                                    width={width}
                                    rowHeight={40}
                                    rowCount={paginatedBehavioralData.length}
                                    rowRenderer={rowRenderer(paginatedBehavioralData)}
                                />
                            )}
                        </AutoSizer>
                    </div>

                    <div className="pagination-controls">
                        <button onClick={prevBehavioralPage} disabled={currentBehavioralPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentBehavioralPage}</span>
                        <button onClick={nextBehavioralPage} disabled={currentBehavioralPage * rowsPerPage >= behavioralData.length}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            <button onClick={handleSubmit}>Calculate Combined Score</button>

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
