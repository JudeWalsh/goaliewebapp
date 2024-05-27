import React, { useState, useEffect } from 'react';
import { ScatterPlot } from '@nivo/scatterplot';
import rinkImage from './moneypuckrink half.jpg';

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
      <div style={{ height: '400px', position: 'relative' }}>
        <img
          src={rinkImage}
          alt="Rink"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 0
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          <ScatterPlot
            width={400}
            height={400}
            data={[{ id: 'scatter', data: data }]}
            xScale={{ type: 'linear', min: 0, max: 100 }}
            yScale={{ type: 'linear', min: -42.5, max: 42.5 }}
            margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
            axisBottom={{ legend: 'X axis', legendPosition: 'middle', legendOffset: 40 }}
            axisLeft={{ legend: 'Y axis', legendPosition: 'middle', legendOffset: -60 }}
            renderNode={({ node, x, y, size, color }) => (
              <circle
                cx={x}
                cy={y}
                r={size / 2}
                fill={color}
                strokeWidth="2"
                stroke="#fff"
              />
            )}
            colors={{ scheme: 'category10' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Report;
