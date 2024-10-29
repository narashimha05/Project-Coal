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
            }, {
                headers: { 'Access-Control-Allow-Origin': '*' }
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
            <h1 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl text-c"><span class="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Admin Page</span></h1>

            <div className="p-6 bg-gray-100 rounded-lg shadow-lg max-w-md mx-auto">
    <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
        type="text"
        placeholder="Truck Name"
        value={truckName}
        onChange={(e) => setTruckName(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <div className="mb-4">
        <label className="block mb-2 text-gray-700 font-semibold">Mechanical File</label>
        <input
            type="file"
            onChange={(e) => handleFileChange(e, 'mechanical')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />
    </div>
    <div className="mb-4">
        <label className="block mb-2 text-gray-700 font-semibold">Behavioral File</label>
        <input
            type="file"
            onChange={(e) => handleFileChange(e, 'behavioral')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />
    </div>
</div>


<h2 class="text-4xl font-extrabold text-black">Mechanical Data</h2>
            {mechanicalData.length > 0 && (
                <div className='border-4 border-black'>
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

                    <div className="pagination-controls flex mt-2 items-center justify-center mb-2">
                        <button onClick={prevMechanicalPage} disabled={currentMechanicalPage === 1} class="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            Previous
                        </button>
                        <span className='px-4 text-blue-700'>Page {currentMechanicalPage}</span>
                        <button onClick={nextMechanicalPage} disabled={currentMechanicalPage * rowsPerPage >= mechanicalData.length} class="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            Next
                        </button>
                    </div>
                </div>
            )}

<h2 class="text-4xl font-extrabold text-black">Behavioural Data</h2>
            {behavioralData.length > 0 && (
                <div className='border-4 border-black'>
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

                    <div className="pagination-controls flex mt-2 items-center justify-center mb-2">
                        <button onClick={prevBehavioralPage} disabled={currentBehavioralPage === 1} class="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" >
                            Previous
                        </button>
                        <span className='px-4 text-blue-700'>Page {currentBehavioralPage}</span>
                        <button onClick={nextBehavioralPage} disabled={currentBehavioralPage * rowsPerPage >= behavioralData.length} class="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            Next
                        </button>
                    </div>
                </div>
            )}

            <button onClick={handleSubmit} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-4">Calculate Combined Score</button>

            <div className="leaderboard">
      
<h1 class="text-3xl font-extrabold text-black mt-8 mb-2">Leaderboard</h1>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-md text-gray-700 uppercase dark:text-gray-400 ">
          <tr>
            <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">Name</th>
            <th scope="col" class="px-6 py-3">Truck Name</th>
            <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index} class="border-b border-gray-200 dark:border-gray-700 text-sm">
              <td class="px-6 py-4 bg-gray-50 dark:bg-gray-800">{entry.name}</td>
              <td class="px-6 py-4">{entry.truckName}</td>
              <td class="px-6 py-4 bg-gray-50 dark:bg-gray-800">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>


{/* <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                    Product name
                </th>
                <th scope="col" class="px-6 py-3">
                    Color
                </th>
                <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                    Category
                </th>
            </tr>
        </thead>
        <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr class="border-b border-gray-200 dark:border-gray-700" key={index}>
                        <td class="px-6 py-4 text-black">{entry.name}</td>
                        <td class="px-6 py-4 bg-gray-50 dark:bg-gray-800">{entry.truckName}</td>
                        <td class="px-6 py-4">{entry.score}</td>
                    </tr>
                ))}
        </tbody>
        </table> */}
        </div>
    );
};

export default AdminPage;
