import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import debounce from "lodash.debounce"; // Import debounce

const TuitionStatisticsChart = () => {
  const [type, setType] = useState("month"); // "month", "quarter", "year"
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Tháng hiện tại
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Function to fetch data from API
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8080/api/tuition-fees/statistics", {
        params: { type, year, month: type === "month" ? month : undefined },
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedData = response.data;
      if (type === "month") {
        setCategories(fetchedData.details.map((item) => item.courseName));
        setData(fetchedData.details.map((item) => item.totalFee));
        setDetails([{ label: "Total Fee", value: fetchedData.totalFee }]);
      } else if (type === "quarter") {
        setCategories(fetchedData.details.map((item) => `Quarter ${item.quarter}`));
        setData(fetchedData.details.map((item) => item.totalFee));
      } else if (type === "year") {
        setCategories(fetchedData.details.map((item) => item.courseName));
        setData(fetchedData.details.map((item) => item.totalFee));
        setDetails([{ label: "Total Fee", value: fetchedData.totalFee }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the fetch call to limit the number of API calls
  const debouncedFetchStatistics = debounce(fetchStatistics, 500);

  useEffect(() => {
    debouncedFetchStatistics();
    return () => {
      debouncedFetchStatistics.cancel(); // Cleanup debounce on unmount
    };
  }, [type, year, month]);

  // Use useMemo to memoize data for performance optimization
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false }, type: "bar" },
    xaxis: { categories },
    yaxis: { title: { text: "Tuition Fees" } },
    colors: ["#4669FA"],
    grid: { borderColor: "#e2e8f0", strokeDashArray: 10 },
    dataLabels: { enabled: false },
  }), [categories]);

  const series = useMemo(() => [{ name: "Tuition Fees", data }], [data]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
      <h2>Tuition Fee Statistics</h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginLeft: "10px" }}>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div>
          <label>Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ marginLeft: "10px" }}
            min="2000"
            max="2100"
          />
        </div>
        {type === "month" && (
          <div>
            <label>Month:</label>
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ marginLeft: "10px" }}
              min="1"
              max="12"
            />
          </div>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="loading-spinner">Loading...</div> // Custom loading spinner can be added here
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : (
        <>
          <Chart options={chartOptions} series={series} type="bar" height={350} />
          {details.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Details</h3>
              <ul>
                {details.map((detail, index) => (
                  <li key={index}>
                    {detail.label}: {detail.value ? detail.value.toLocaleString() : "N/A"} VND
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TuitionStatisticsChart;
