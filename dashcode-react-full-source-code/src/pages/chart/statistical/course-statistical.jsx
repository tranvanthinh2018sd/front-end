import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import axios from "axios";

const BasicBar = () => {
  const [isDark] = useDarkMode();
  const [series, setSeries] = useState([{ data: [] }]);
  const [categories, setCategories] = useState([]);
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2025);

  // Token for API authentication
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/courses/statistics/yearly`, {
        params: { startYear, endYear },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setCategories(Object.keys(data));
      setSeries([{ data: Object.values(data) }]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startYear, endYear]);

  const options = {
    chart: { toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#e2e8f0",
      strokeDashArray: 10,
      position: "back",
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    colors: ["#4669FA"],
  };

  return (
    <div style={{ padding: "20px", borderRadius: "8px", backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
      <h2 style={{ fontSize: "1.5em", fontWeight: "bold", color: isDark ? "#CBD5E1" : "#475569", marginBottom: "20px" }}>
        Yearly Course Enrollment Statistics
      </h2>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: "bold", color: isDark ? "#CBD5E1" : "#475569" }}>Start Year:</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            style={{
              padding: "8px",
              border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
              borderRadius: "4px",
              backgroundColor: isDark ? "#334155" : "#ffffff",
              color: isDark ? "#CBD5E1" : "#475569",
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: "bold", color: isDark ? "#CBD5E1" : "#475569" }}>End Year:</label>
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            style={{
              padding: "8px",
              border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
              borderRadius: "4px",
              backgroundColor: isDark ? "#334155" : "#ffffff",
              color: isDark ? "#CBD5E1" : "#475569",
              outline: "none",
            }}
          />
        </div>
      </div>
      <Chart options={options} series={series} type="bar" height="350" />
    </div>
  );  
};

export default BasicBar;
