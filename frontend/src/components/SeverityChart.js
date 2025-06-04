import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement);

const SeverityChart = ({ data }) => {
  const labels = data.map(d => d.severity);
  const counts = data.map(d => d.count);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Logs',
        data: counts,
        backgroundColor: '#3b82f6',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };
  return <Bar data={chartData} options={options} />;
};

export default SeverityChart;
