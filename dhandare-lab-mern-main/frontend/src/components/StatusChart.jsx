import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 1. Register the Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend);

const StatusChart = ({ appointments }) => {
  // 2. Calculate the numbers dynamically
  const pending = appointments.filter(a => a.status === 'Pending').length;
  const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
  const completed = appointments.filter(a => a.status === 'Completed').length;
  const cancelled = appointments.filter(a => a.status === 'Cancelled').length;

  // 3. Define the Data for the Chart
  const data = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: '# of Appointments',
        data: [pending, confirmed, completed, cancelled],
        backgroundColor: [
          '#F59E0B', // Yellow (Pending)
          '#10B981', // Green (Confirmed)
          '#3B82F6', // Blue (Completed)
          '#EF4444', // Red (Cancelled)
        ],
        borderColor: [
          '#D97706',
          '#059669',
          '#2563EB',
          '#DC2626',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right', // Put labels on the side
      },
      title: {
        display: true,
        text: 'Appointment Status Overview',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center border h-full">
      <div className="w-64"> {/* Controls the size of the chart */}
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default StatusChart;