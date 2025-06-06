import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Title,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Title);

const LogsSecChart = ({ dataPoints }) => {
  const labels = dataPoints.map((_, idx) => `-${(dataPoints.length - idx) * 5}s`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Logs/sec',
        data: dataPoints,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Tailwind blue-500 with opacity
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280', // gray-500
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#e5e7eb', // gray-200
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default LogsSecChart;

