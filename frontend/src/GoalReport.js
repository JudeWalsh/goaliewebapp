import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsAnnotations from 'highcharts/modules/annotations';
import HighchartsReact from 'highcharts-react-official';
import './GoalReport.css';

// Initialize the modules
HighchartsHeatmap(Highcharts);
HighchartsAnnotations(Highcharts);

const GoalReport = ({ goalieID, startYear, endYear }) => {
  const [data1, setData1] = useState([]);
  const [goalieReport, setGoalieReport] = useState(null);
  const [averageGoalie, setAverageGoalie] = useState(null);
  const polygon_points = [
    [54, 22],
    [54, -22],
    [69, -22],
    [89, -11],
    [89, 11],
    [69, 22]
  ];

  // Fetch the report data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/${goalieID}?startYear=${startYear}&endYear=${endYear}`)
      .then(response => response.json())
      .then(data => {
        setGoalieReport(data);
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
      });
  }, [goalieID, startYear, endYear]);

  // Fetch the report data for the average goalie
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/all?startYear=${startYear}&endYear=${endYear}`)
      .then(response => response.json())
      .then(data => {
        setAverageGoalie(data);
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
      });
  }, [startYear, endYear]);

  // Fetch the coordinates data for the first scatter plot
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/coordinates/goals/${goalieID}?startYear=${startYear}&endYear=${endYear}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const transformedData1 = data.map(point => ({
            x: point.xCordAdjusted,
            y: point.yCordAdjusted,
            shooterName: point.shooterName,
            teamCode: point.teamCode,
            season: point.season,
            side: point.side,
            homePlate: point.homePlate,
          }));
          setData1(transformedData1);
        } else {
          console.error('No data received');
        }
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
  }, [goalieID, startYear, endYear]);

  const plainScatter = {
     chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg', // Ensure the path is correct
      plotBackgroundSize: '100% 100%', // Adjust size to fit within the chart area
      backgroundColor: null,
      width: 500,  // Set the desired width of the chart
      height: 500, // Set the desired height of the chart
    },
    title: {
      text: 'Goals Scored by Stick or Glove Side'
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
    series: [
      {
        name: 'Goal',
        data: data1.map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          side: point.side,
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(54, 162, 235, 0.6)',
          lineColor: 'rgba(54, 162, 235, 1)',
          lineWidth: 1,
        },
      }
    ],
    tooltip: {
      formatter: function () {
        return `${this.point.shooterName} for ${this.point.teamCode} in ${this.point.season}`;
      }
    },
  };

  const sideScatter = {
    chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg', // Ensure the path is correct
      plotBackgroundSize: '100% 100%', // Adjust size to fit within the chart area
      backgroundColor: null,
      width: 500,  // Set the desired width of the chart
      height: 500, // Set the desired height of the chart
    },
    title: {
      text: 'Goals Scored by Stick or Glove Side'
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
    series: [
      {
        name: 'Stick',
        data: data1.filter(point => point.side === 'Stick').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          side: point.side,
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(54, 162, 235, 0.6)',
          lineColor: 'rgba(54, 162, 235, 1)',
          lineWidth: 1,
        },
      },
      {
        name: 'Glove',
        data: data1.filter(point => point.side === 'Glove').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          side: point.side,
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(75, 192, 192, 0.6)',
          lineColor: 'rgba(75, 192, 192, 1)',
          lineWidth: 1,
        },
      },
      {
        name: 'Head On',
        data: data1.filter(point => point.side === 'Head On').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          side: point.side,
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(255, 99, 132, 0.6)',
          lineColor: 'rgba(255, 99, 132, 1)',
          lineWidth: 1,
        },
      },
      {
        type: 'line',
        name: 'Polygon Lines',
        data: [
          { x: 0, y: -3 },
          { x: 100, y: -3 },
          null, // To create a gap in the line
          { x: 100, y: 3 },
          { x: 0, y: 3 },
          null // To create a gap in the line
        ],
        enableMouseTracking: false,
        lineWidth: 1,
        color: '#000000',
        showInLegend: false
      }
    ],
    tooltip: {
      formatter: function () {
        return `${this.point.shooterName} for ${this.point.teamCode} in ${this.point.season}\nSide: ${this.point.side}`;
      }
    },
  };

  const homePlateScatter = {
    chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg',
      plotBackgroundSize: '100% 100%',
      backgroundColor: null,
      width: 500,
      height: 500
    },
    title: {
      text: 'Goals Scored by the Home Plate'
    },
    xAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'X axis'
      },
      tickPositions: Array.from({ length: 11 }, (_, i) => i * 10)
    },
    yAxis: {
      min: -42.5,
      max: 42.5,
      title: {
        text: 'Y axis'
      },
      tickPositions: [-42.5, -30, -20, -10, 0, 10, 20, 30, 42.5]
    },
    series: [
      {
        type: 'scatter',
        name: 'Polygon',
        data: polygon_points.map(([x, y]) => ({ x, y })),
        marker: {
          enabled: false
        },
        enableMouseTracking: false,
        showInLegend: false,
        draggable: false
      },
      {
        name: 'Outside',
        data: data1.filter(point => point.homePlate === 'outside').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(54, 162, 235, 0.6)',
          lineColor: 'rgba(54, 162, 235, 1)',
          lineWidth: 1
        }
      },
      {
        name: 'Inside',
        data: data1.filter(point => point.homePlate === 'inside').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(75, 192, 192, 0.6)',
          lineColor: 'rgba(75, 192, 192, 1)',
          lineWidth: 1
        }
      },
      {
        type: 'line',
        name: 'Polygon Lines',
        data: [...polygon_points, polygon_points[0]],
        enableMouseTracking: false,
        lineWidth: 1,
        color: '#000000',
        showInLegend: false
      }
    ],
    tooltip: {
      formatter: function() {
        return `${this.point.shooterName} for ${this.point.teamCode} in ${this.point.season} from ${this.point.homePlate}`;
      }
    }
  };

  const allScatter = {
    chart: {
      type: 'scatter',
      plotBackgroundImage: 'moneypuckrink half.jpg',
      plotBackgroundSize: '100% 100%',
      backgroundColor: null,
      width: 500,
      height: 500
    },
    title: {
      text: 'Goals by the Six Areas'
    },
    xAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'X axis'
      },
      tickPositions: Array.from({ length: 11 }, (_, i) => i * 10)
    },
    yAxis: {
      min: -42.5,
      max: 42.5,
      title: {
        text: 'Y axis'
      },
      tickPositions: [-42.5, -30, -20, -10, 0, 10, 20, 30, 42.5]
    },
    series: [
      {
        type: 'scatter',
        name: 'Polygon',
        data: polygon_points.map(([x, y]) => ({ x, y })),
        marker: {
          enabled: false
        },
        enableMouseTracking: false,
        showInLegend: false,
        draggable: false
      },
      {
        name: 'Outside Glove',
        data: data1.filter(point => point.homePlate === 'outside' && point.side === 'Glove').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(128, 0, 128, 0.6)',
          lineColor: 'rgba(54, 162, 235, 1)',
          lineWidth: 1
        }
      },
      {
        name: 'Outside RR',
        data: data1.filter(point => point.homePlate === 'outside' && point.side === 'Head On').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(255, 165, 0, 0.6)',
          lineColor: 'rgba(75, 192, 192, 1)',
          lineWidth: 1
        }
      },
      {
        name: 'Outside Stick',
        data: data1.filter(point => point.homePlate === 'outside' && point.side === 'Stick').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(0, 128, 128, 0.6)',
          lineColor: 'rgba(75, 192, 192, 1)',
          lineWidth: 1
        }
      },
      {
        name: 'Inside Glove',
        data: data1.filter(point => point.homePlate === 'inside' && point.side === 'Glove').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(0, 0, 255, 0.6)',
          lineColor: 'rgba(54, 162, 235, 1)',
          lineWidth: 1
        }
      },
      {
        name: 'Inside RR',
        data: data1.filter(point => point.homePlate === 'inside' && point.side === 'Head On').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(255, 0, 0, 0.6)',
          lineColor: 'rgba(75, 192, 192, 1)',
          lineWidth: 1
        }
      },
      {
        name: 'Inside Stick',
        data: data1.filter(point => point.homePlate === 'inside' && point.side === 'Stick').map(point => ({
          x: point.x,
          y: point.y,
          shooterName: point.shooterName,
          teamCode: point.teamCode,
          season: point.season,
          homePlate: point.homePlate
        })),
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: 'rgba(0, 128, 0, 0.6)',
          lineColor: 'rgba(75, 192, 192, 1)',
          lineWidth: 1
        }
      },
      {
        type: 'line',
        name: 'Polygon Lines',
        data: [...polygon_points, polygon_points[0]],
        enableMouseTracking: false,
        lineWidth: 1,
        color: '#000000',
        showInLegend: false
      },
      {
        type: 'line',
        name: 'Polygon Lines',
        data: [
          { x: 0, y: -3 },
          { x: 100, y: -3 },
          null, // To create a gap in the line
          { x: 100, y: 3 },
          { x: 0, y: 3 },
          null // To create a gap in the line
        ],
        enableMouseTracking: false,
        lineWidth: 1,
        color: '#000000',
        showInLegend: false
      }
    ],
    tooltip: {
      formatter: function() {
        return `${this.point.shooterName} for ${this.point.teamCode} in ${this.point.season} from ${this.point.homePlate}`;
      }
    }
  };

   return (
    <div className="goal-report">
      <h2>Goals Scored on Selected Goalie</h2>
      <h3>Shot Charts</h3>
      <div className="grid-container">
        <div className="grid-item">
          <HighchartsReact
            highcharts={Highcharts}
            options={plainScatter}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <p>Events: {goalieReport?.summary?.['EVENTS']?.toFixed(2)}</p>
              <p>Shots Missed: {goalieReport?.summary?.['MISS']?.toFixed(2)}</p>
              <p>Saves: {goalieReport?.summary?.['SHOT']?.toFixed(2)}</p>
              <p>Goals: {goalieReport?.summary?.['GOAL']?.toFixed(2)}</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Events: {averageGoalie?.summary?.['EVENTS']?.toFixed(2)}</p>
              <p>Shots Missed: {averageGoalie?.summary?.['MISS']?.toFixed(2)}</p>
              <p>Saves: {averageGoalie?.summary?.['SHOT']?.toFixed(2)}</p>
              <p>Goals: {averageGoalie?.summary?.['GOAL']?.toFixed(2)}</p>
            </div>
            <div className="data-section">
              <p>An "event" is any play by play event that has to do with the goalie</p>
              <p>A "miss" is a shot taken that was not put on net</p>
              <p>A "save" is a shot on Goal</p>
            </div>
            <div className="data-section">
              <p>
                The "average goalie's" numbers are summary statistics on
                every goalie with an amount of events within one standard
                deviation of the selected goalie's
              </p>
            </div>
            <div className="data-section">
              <p>
                Shot chart to the left shows all goals scored on selected goalie in 2022
              </p>
            </div>
            <div className="data-section">
              <p>
                Hover mouse over any point for additional information
              </p>
            </div>
          </div>
        </div>
        <div className="grid-item">
          <HighchartsReact
            highcharts={Highcharts}
            options={sideScatter}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <p>Head On: {goalieReport?.side_dist_goals?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {goalieReport?.side_dist_goals?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {goalieReport?.side_dist_goals?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Head On: {averageGoalie?.side_dist_goals?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {averageGoalie?.side_dist_goals?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {averageGoalie?.side_dist_goals?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                Distribution of all goals scored on the selected goalie
              </p>
              <p>
                Separated by where the goal was shot from:<br/>
                - The Goalie's Stick Side<br/>
                - The Goalie's Glove Side<br/>
                - The Royal Road (Head On)
              </p>
            </div>
            <div className="data-section">
              <p>
                Represents 100% of the goals scored on the selected goalie and the average goalie<br/>
                <br/>A higher Percentage than the average goalie represents a potential weakness as
                more goals are given up from that side
              </p>
              <p>

              </p>
            </div>
            <div className="data-section">
              <p>
                Shots taken from the Royal Road are defined as taken from inside the goal posts
                (Lines depicted on the graph)
              </p>
            </div>
            <div className="data-section">
              <p>
                Glove side or stick side shots are taken from either side of the Royal Road
              </p>
            </div>
          </div>
        </div>
        <div className="grid-item">
          <HighchartsReact
            highcharts={Highcharts}
            options={homePlateScatter}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <p>Inside: {goalieReport?.plate_dist_goals?.['inside']?.toFixed(2)}%</p>
              <p>Outside: {goalieReport?.plate_dist_goals?.['outside']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Inside: {averageGoalie?.plate_dist_goals?.['inside']?.toFixed(2)}%</p>
              <p>Outside: {averageGoalie?.plate_dist_goals?.['outside']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                Distribution of goals scored by whether they were shot within the home plate>
              </p>
            </div>
            <div className="data-section">
              <p>
                Represents 100% of goals scored on the selected goalie and the average goalie
              </p>
            </div>
            <div className="data-section">
              <p>Home plate lines are defined on the chart to the left</p>
            </div>
          </div>
        </div>
        <div className="grid-item">
          <HighchartsReact
            highcharts={Highcharts}
            options={allScatter}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <h5>Inside the home plate</h5>
              <p>Head On: {goalieReport?.inside_dist_goals?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {goalieReport?.inside_dist_goals?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {goalieReport?.inside_dist_goals?.['Glove']?.toFixed(2)}%</p>
              <h5>Outside of the home plate</h5>
              <p>Head On: {goalieReport?.outside_dist_goals?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {goalieReport?.outside_dist_goals?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {goalieReport?.outside_dist_goals?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <h5>Inside the home plate</h5>
              <p>Head On: {averageGoalie?.inside_dist_goals?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {averageGoalie?.inside_dist_goals?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {averageGoalie?.inside_dist_goals?.['Glove']?.toFixed(2)}%</p>
              <h5>Outside of the home plate</h5>
              <p>Head On: {averageGoalie?.outside_dist_goals?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {averageGoalie?.outside_dist_goals?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {averageGoalie?.outside_dist_goals?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                Six areas now defined:<br/>
                <br/>Glove side, stick side, or head on. All from either within or outside of the home plate area
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalReport;
