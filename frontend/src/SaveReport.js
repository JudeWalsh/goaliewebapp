import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsAnnotations from 'highcharts/modules/annotations';
import HighchartsReact from 'highcharts-react-official';
import './SaveReport.css'

// Initialize the modules
HighchartsHeatmap(Highcharts);
HighchartsAnnotations(Highcharts);

const SaveReport = ({ goalieID, startYear, endYear }) => {
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
    fetch(`http://127.0.0.1:8000/savereport/${goalieID}?startYear=${startYear}&endYear=${endYear}`)
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
    fetch(`http://127.0.0.1:8000/savereport/all?startYear=${startYear}&endYear=${endYear}`)
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
    fetch(`http://127.0.0.1:8000/coordinates/saves/${goalieID}?startYear=${startYear}&endYear=${endYear}`)
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
      text: 'Shots Saved'
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
        name: 'Save',
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
      text: 'Shots Saved by Stick or Glove Side'
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
      text: 'Shots Saved by the Home Plate'
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
      text: 'Shots Saved the Six Areas'
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
    <div className="save-report">
      <h2>Shots Saved by Selected Goalie</h2>
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
              <p>
                Shot chart to the left shows all saves made by selected goalie in 2022
              </p>
            </div>
            <div className="data-section">
              <p>A "save" is constituted by a shot on goal as defined by the NHL API's play by play report</p>
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
              <p>Head On: {goalieReport?.side_dist_saves?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {goalieReport?.side_dist_saves?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {goalieReport?.side_dist_saves?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Head On: {averageGoalie?.side_dist_saves?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {averageGoalie?.side_dist_saves?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {averageGoalie?.side_dist_saves?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                A higher percentage than the average goalie is a potential strength as more
                saves are made on that side than the average goalie
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
              <p>Inside: {goalieReport?.plate_dist_saves?.['inside']?.toFixed(2)}%</p>
              <p>Outside: {goalieReport?.plate_dist_saves?.['outside']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Inside: {averageGoalie?.plate_dist_saves?.['inside']?.toFixed(2)}%</p>
              <p>Outside: {averageGoalie?.plate_dist_saves?.['outside']?.toFixed(2)}%</p>
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
              <p>Head On: {goalieReport?.inside_dist_saves?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {goalieReport?.inside_dist_saves?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {goalieReport?.inside_dist_saves?.['Glove']?.toFixed(2)}%</p>
              <h5>Outside of the home plate</h5>
              <p>Head On: {goalieReport?.outside_dist_saves?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {goalieReport?.outside_dist_saves?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {goalieReport?.outside_dist_saves?.['Glove']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <h5>Inside the home plate</h5>
              <p>Head On: {averageGoalie?.inside_dist_saves?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {averageGoalie?.inside_dist_saves?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {averageGoalie?.inside_dist_saves?.['Glove']?.toFixed(2)}%</p>
              <h5>Outside of the home plate</h5>
              <p>Head On: {averageGoalie?.outside_dist_saves?.['Head On']?.toFixed(2)}%</p>
              <p>Stick: {averageGoalie?.outside_dist_saves?.['Stick']?.toFixed(2)}%</p>
              <p>Glove: {averageGoalie?.outside_dist_saves?.['Glove']?.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveReport;
