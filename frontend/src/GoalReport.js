import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const GoalReport = ({ goalieID }) => {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [goalieReport, setGoalieReport] = useState(null);
  const [averageGoalie, setAverageGoalie] = useState(null);

  // Fetch the report data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        setGoalieReport(JSON.stringify(data, null, 2));
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
      });
  }, [goalieID]);

  // Fetch the report data for the average goalie
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/all`)
      .then(response => response.json())
      .then(data => {
        setAverageGoalie(JSON.stringify(data, null, 2));
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
      });
  }, []);

  // Fetch the coordinates data for the first scatter plot
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/coordinates/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const transformedData1 = data.map(point => ({
            x: point.xCordAdjusted,
            y: point.yCordAdjusted
          }));
          setData1(transformedData1);
        } else {
          console.error('No data received');
        }
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
  }, [goalieID]);

  // Fetch the coordinates data for the second scatter plot
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/coordinates/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const transformedData2 = data.map(point => ({
            x: point.xCordAdjusted,
            y: point.yCordAdjusted
          }));
          setData2(transformedData2);
        } else {
          console.error('No data received');
        }
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
  }, [goalieID]);

  const options1 = {
    chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg', // Ensure the path is correct
      backgroundColor: null,
      width: 500,  // Set the desired width of the chart
      height: 500, // Set the desired height of the chart
    },
    title: {
      text: 'Goals Scored on Selected Goalie'
    },
    xAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'X axis',
      },
    },
    yAxis: {
      min: -42.5,
      max: 42.5,
      title: {
        text: 'Y axis',
      },
    },
    series: [{
      name: 'NHL Shots 1',
      data: data1.map(point => [point.x, point.y]),
      marker: {
        radius: 5,
        fillColor: 'rgba(54, 162, 235, 0.6)',
        lineColor: 'rgba(54, 162, 235, 1)',
        lineWidth: 1,
      },
    }],
    tooltip: {
      formatter: function () {
        return `(${this.x}, ${this.y})`;
      }
    },
  };

  const options2 = {
    chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg', // Ensure the path is correct
      backgroundColor: null,
      width: 500,  // Set the desired width of the chart
      height: 500, // Set the desired height of the chart
    },
    title: {
      text: 'Goals Scored on Every Goalie'
    },
    xAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'X axis',
      },
    },
    yAxis: {
      min: -42.5,
      max: 42.5,
      title: {
        text: 'Y axis',
      },
    },
    series: [{
      name: 'NHL Shots 2',
      data: data2.map(point => [point.x, point.y]),
      marker: {
        radius: 5,
        fillColor: 'rgba(54, 162, 235, 0.6)',
        lineColor: 'rgba(54, 162, 235, 1)',
        lineWidth: 1,
      },
    }],
    tooltip: {
      formatter: function () {
        return `(${this.x}, ${this.y})`;
      }
    },
  };

  return (
    <div>
      <h2>Goals Scored on Selected Goalie</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <h3>Selected Goalie</h3>
          <pre>
            <code>{goalieReport}</code>
          </pre>
        </div>
        <div>
          <h3>Average Goalie</h3>
          <pre>
            <code>{averageGoalie}</code>
          </pre>
        </div>
      </div>
      <h3>Scatter Plots</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options1}
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
        <HighchartsReact
          highcharts={Highcharts}
          options={options2}
          containerProps={{ style: { width: '100%', height: '100%'} }}
        />
      </div>
    </div>
  );
};

export default GoalReport;
