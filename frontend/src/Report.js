import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const Report = ({ goalieID }) => {
  const [data, setData] = useState([]);
  const [fetchResponse, setFetchResponse] = useState(null);

  // Fetch the report data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/report/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        setFetchResponse(JSON.stringify(data, null, 2));
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
      });
  }, [goalieID]);

  // Fetch the coordinates data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/coordinates/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        console.log('Data:', data);
        if (data) {
          const transformedData = data.map(point => ({
            x: point.xCordAdjusted,
            y: point.yCordAdjusted
          }));
          setData(transformedData);
        } else {
          console.error('No data received');
        }
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
  }, [goalieID]);

  const scatterData = {
    datasets: [
      {
        label: 'NHL Shots',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'X axis',
        },
      },
      y: {
        type: 'linear',
        min: -42.5,
        max: 42.5,
        title: {
          display: true,
          text: 'Y axis',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            if (label) {
              return `${label}: (${context.raw.x}, ${context.raw.y})`;
            }
            return `(${context.raw.x}, ${context.raw.y})`;
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Report Data</h2>
      <p>Goalie ID: {goalieID}</p>
      {fetchResponse && (
        <pre>
          <code>{fetchResponse}</code>
        </pre>
      )}
      <h3>Scatter Plot</h3>
      <div style={{ height: '400px' }}>
        <Scatter data={scatterData} options={options} />
      </div>
    </div>
  );
};

export default Report;
