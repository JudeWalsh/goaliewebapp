import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsReact from 'highcharts-react-official';

// Initialize the heatmap module
HighchartsHeatmap(Highcharts);

const GoalReport = ({ goalieID }) => {
  const [data1, setData1] = useState([]);
  const [goalieReport, setGoalieReport] = useState(null);
  const [averageGoalie, setAverageGoalie] = useState(null);

  // Fetch the report data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        setGoalieReport(data);
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
        setAverageGoalie(data);
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
      });
  }, []);

  // Fetch the coordinates data for the first scatter plot
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/coordinates/goals/${goalieID}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const transformedData1 = data.map(point => ({
            x: point.xCordAdjusted,
            y: point.yCordAdjusted,
            shooterName: point.shooterName,
            teamCode: point.teamCode,
            season: point.season,
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

  const options1 = {
    chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg', // Ensure the path is correct
      plotBackgroundSize: '100% 100%', // Adjust size to fit within the chart area
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
      tickPositions: Array.from({ length: 11 }, (_, i) => i * 10) // Setting tick positions at intervals of 10
    },
    yAxis: {
      min: -42.5,
      max: 42.5,
      title: {
        text: 'Y axis',
      },
      tickPositions: [-42.5, -30, -20, -10, 0, 10, 20, 30, 42.5], // Explicitly setting tick positions
    },
    series: [{
      name: 'NHL Shots 1',
      data: data1.map(point => ({
        x: point.x,
        y: point.y,
        shooterName: point.shooterName,
        teamCode: point.teamCode,
        season: point.season,
      })),
      marker: {
        radius: 5,
        fillColor: 'rgba(54, 162, 235, 0.6)',
        lineColor: 'rgba(54, 162, 235, 1)',
        lineWidth: 1,
      },
    }],
    tooltip: {
      formatter: function () {
        return `${this.point.shooterName} for ${this.point.teamCode} in ${this.point.season} `;
      }
    },
  };

  return (
    <div>
     <h2>Goals Scored on Selected Goalie</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <h3>Selected Goalie</h3>
          <div>
            <p>Head On: {goalieReport && goalieReport.goals && goalieReport.goals.side_dist_goals && goalieReport.goals.side_dist_goals['Head On'].toFixed(2)}%</p>
            <p>Stick: {goalieReport && goalieReport.goals && goalieReport.goals.side_dist_goals && goalieReport.goals.side_dist_goals['Stick'].toFixed(2)}%</p>
            <p>Glove: {goalieReport && goalieReport.goals && goalieReport.goals.side_dist_goals && goalieReport.goals.side_dist_goals['Glove'].toFixed(2)}%</p>
          </div>
        </div>
        <div>
          <h3>Average Goalie</h3>
          <div>
            <p>Head On: {averageGoalie && averageGoalie.goals && averageGoalie.goals.side_dist_goals && averageGoalie.goals.side_dist_goals['Head On'].toFixed(2)}%</p>
            <p>Stick: {averageGoalie && averageGoalie.goals && averageGoalie.goals.side_dist_goals && averageGoalie.goals.side_dist_goals['Stick'].toFixed(2)}%</p>
            <p>Glove: {averageGoalie && averageGoalie.goals && averageGoalie.goals.side_dist_goals && averageGoalie.goals.side_dist_goals['Glove'].toFixed(2)}%</p>
          </div>
        </div>
      </div>
      <h3>Scatter Plots</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options1}
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
    </div>
  );
};

export default GoalReport;
