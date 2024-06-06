import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsReact from 'highcharts-react-official';

// Initialize the heatmap module
HighchartsHeatmap(Highcharts);

const ShotReport = ({ goalieID }) => {
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

  return (
    <div>
      <h2>Save Percentages by Area</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <h3>Selected Goalie</h3>
          <div>
            <p>Head On: {goalieReport && goalieReport.shots && goalieReport.shots['RR_save_percent'] && goalieReport.shots['RR_save_percent'].SHOT.toFixed(2)}%</p>
            <p>Stick: {goalieReport && goalieReport.shots && goalieReport.shots['stick_save_percent'] && goalieReport.shots['stick_save_percent'].SHOT.toFixed(2)}%</p>
            <p>Glove: {goalieReport && goalieReport.shots && goalieReport.shots['glove_save_percent'] && goalieReport.shots['glove_save_percent'].SHOT.toFixed(2)}%</p>
          </div>
        </div>
        <div>
          <h3>Average Goalie</h3>
          <div>
            <p>Head On: {averageGoalie && averageGoalie.shots && averageGoalie.shots['RR_save_percent'] && averageGoalie.shots['RR_save_percent'].SHOT.toFixed(2)}%</p>
            <p>Stick: {averageGoalie && averageGoalie.shots && averageGoalie.shots['stick_save_percent'] && averageGoalie.shots['stick_save_percent'].SHOT.toFixed(2)}%</p>
            <p>Glove: {averageGoalie && averageGoalie.shots && averageGoalie.shots['glove_save_percent'] && averageGoalie.shots['glove_save_percent'].SHOT.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotReport;
