// src/components/Leaderboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = ({ API }) => {
  const [combinedLeaderboard, setCombinedLeaderboard] = useState([]);
  const fetchCombinedLeaderboard = async () => {
    try {
      const response = await axios.get(API + "api/combinedleaderboard");
      setCombinedLeaderboard(response.data);
      await fetchCombinedLeaderboard();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchCombinedLeaderboard();
  },[]);


  return (
    <div className="leaderboard">
  <h1 class="text-3xl font-extrabold text-black mt-8 mb-2">
    Leaderboard
  </h1>

  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-md text-gray-700 uppercase dark:text-gray-400 ">
        <tr>
          <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
            Serial Number
          </th>
          <th scope="col" class="px-6 py-4">
            Name
          </th>
          <th scope="col" class="px-6 py-4">
            Score
          </th>
        </tr>
      </thead>
      <tbody>
        {combinedLeaderboard.map((entry, index) => (
          <tr
            key={index}
            className="border-b border-gray-200 dark:border-gray-700 text-sm"
          >
            <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
              {index + 1}
            </td>{" "}
            <td className="px-6 py-4">{entry.name}</td>
            {/* <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
              {entry.truckName}
            </td> */}
            <td className="px-6 py-4">{entry.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
};

export default Leaderboard;
