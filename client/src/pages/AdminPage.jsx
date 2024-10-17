import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const AdminPage = () => {
    const [name, setName] = useState('');
    const [truckName, setTruckName] = useState('');
    const [excelColumns, setExcelColumns] = useState([]);
    const [parsedData, setParsedData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

   
    const predefinedColumns = ['Column1', 'Column2', 'Column3', 'Column4', 'Column5', 'Column6', 'Column7', 'Column8', 'Column9', 'Column10', 'Column11', 'Column12'];

 
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

           
            const fileHeaders = jsonData[0];
            const rows = jsonData.slice(1);

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
                <table border="1">
                    <thead>
                        <tr>
                            {predefinedColumns.map((col, index) => (
                                <th key={index}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {parsedData.map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {predefinedColumns.map((col, colIndex) => {
                                    const columnData = getColumnData(col);
                                    return <td key={colIndex}>{columnData[rowIndex]}</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
