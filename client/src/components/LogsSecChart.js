import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const LogsSecChart = ({ dataPoints }) => {
  const labels = dataPoints.map((_, idx) => `-${(dataPoints.length - idx) * 5}s`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Logs/sec',
        data: dataPoints,
        fill: false,
        borderColor: '#3b82f6', // Tailwind blue-500
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LogsSecChart;
