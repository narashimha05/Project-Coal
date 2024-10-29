// src/components/Leaderboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('https://project-coal-backend.onrender.com/api/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
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
  );
};

export default Leaderboard;
