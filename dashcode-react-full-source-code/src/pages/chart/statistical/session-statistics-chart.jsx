import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CourseStatisticsComponent = () => {
  const [statistics, setStatistics] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear()); // Khởi tạo năm hiện tại
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // Hàm xử lý khi người dùng nhập năm
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/courses/statistics/session?year=${year}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Token authentication
          },
        });
        setStatistics(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [year, token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Course Statistics for {year}</h2>
      
      {/* Input để người dùng nhập năm */}
      <div>
        <label htmlFor="year-input">Enter Year: </label>
        <input
          type="number"
          id="year-input"
          value={year}
          onChange={handleYearChange}
          min="2000"
          max="2100"
          placeholder="Enter year"
        />
      </div>

      {/* Biểu đồ thống kê */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={statistics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sessionName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="courseCount" fill="#8884d8" name="Course Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CourseStatisticsComponent;
