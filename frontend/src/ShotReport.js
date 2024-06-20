import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import './ShotReport.css';

// Initialize the heatmap module
HighchartsHeatmap(Highcharts);

const ShotReport = ({ goalieID }) => {
  const [goalieReport, setGoalieReport] = useState(null);
  const [averageGoalie, setAverageGoalie] = useState(null);
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const canvasRef3 = useRef(null);

  // Fetch the report data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/${goalieID}`)
      .then(response => response.json())
      .then(data => setGoalieReport(data))
      .catch(error => console.error('Error fetching report data:', error));
  }, [goalieID]);

  // Fetch the report data for the average goalie
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/goalreport/all`)
      .then(response => response.json())
      .then(data => setAverageGoalie(data))
      .catch(error => console.error('Error fetching report data:', error));
  }, []);

  const drawPolygon = (canvas, polygonPoints = [], horizontalLines = []) => {
    const ctx = canvas.getContext('2d');

    // Scale and translate coordinates to fit the canvas
    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 85; // Considering y-axis is from -42.5 to 42.5

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

    // Draw polygon if polygonPoints are provided
    if (polygonPoints.length > 0) {
      ctx.beginPath();
      polygonPoints.forEach(([x, y], index) => {
        const canvasX = x * scaleX;
        const canvasY = canvas.height / 2 - y * scaleY;
        if (index === 0) {
          ctx.moveTo(canvasX, canvasY);
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw horizontal lines with a fixed length
    const lineLength = 560;
    horizontalLines.forEach(([y]) => {
      const canvasY = canvas.height / 2 - y * scaleY;

      // Drawing the lines at a fixed length from the center of the canvas
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - lineLength / 2 - 15, canvasY);
      ctx.lineTo(canvas.width / 2 + lineLength / 2 + 103, canvasY);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // Drawing horizontal lines on the first canvas
  useEffect(() => {
    const horizontalLines1 = [
      [0, 0],
      [5, 5]
    ];
    if (canvasRef1.current) {
      drawPolygon(canvasRef1.current, [], horizontalLines1);
    }
  }, []);

  // Drawing polygons on the second and third canvases
  useEffect(() => {
    if (canvasRef2.current) {
      const polygonPoints2 = [
        [58, 21],
        [58, -17],
        [71, -17],
        [88, -7],
        [88, 12],
        [71, 21]
      ];
      drawPolygon(canvasRef2.current, polygonPoints2);
    }
  }, []);

  useEffect(() => {
    const horizontalLines1 = [
      [0, 0],
      [5, 5]
    ];
    const polygonPoints3 = [
      [58, 21],
      [58, -17],
      [71, -17],
      [88, -7],
      [88, 12],
      [71, 21]
    ];
    if (canvasRef3.current) {
      drawPolygon(canvasRef3.current, polygonPoints3, horizontalLines1);
    }
  }, []);


  const createPieOptions = (percent) => ({
    chart: {
      type: 'pie',
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    series: [{
      data: [
        { name: 'Not Saved', y: 100 - percent },
        { name: 'Saved', y: percent }
      ],
      dataLabels: {
        enabled: true,
        formatter: function () {
          if (this.point.name === 'Saved') {
            return `${this.y.toFixed(2)}%`;
          }
          return null;
        },
        distance: -30, // Positioning the label inside the slice
        style: {
          color: 'white',
          textOutline: 'black',
          fontSize: '14px'
        }
      }
    }],
    plotOptions: {
      pie: {
        dataLabels: {
          allowOverlap: false,
          connectorShape: 'crookedLine',
          crookDistance: '70%',
        },
      },
    },
    credits: {
      enabled: false
    },
    tooltip: {
      enabled: false
    }
  });

  // Comment
  const Glove = createPieOptions(goalieReport?.shots?.glove_save_percent?.['SHOT'] || 0);
  const Stick = createPieOptions(goalieReport?.shots?.stick_save_percent?.['SHOT'] || 0);
  const RR = createPieOptions(goalieReport?.shots?.RR_save_percent?.['SHOT'] || 0);

  // Comment
  const inside = createPieOptions(goalieReport?.shots?.inside_save_percent?.['SHOT'] || 0);
  const outside = createPieOptions(goalieReport?.shots?.outside_save_percent?.['SHOT'] || 0);

  // Create pie chart options for each area using the goalieReport data
  const outsideGlove = createPieOptions(goalieReport?.shots?.outside_glove_save_percent?.['SHOT'] || 0);
  const insideGlove = createPieOptions(goalieReport?.shots?.inside_glove_save_percent?.['SHOT'] || 0);
  const outsideStick = createPieOptions(goalieReport?.shots?.outside_stick_save_percent?.['SHOT'] || 0);
  const insideStick = createPieOptions(goalieReport?.shots?.inside_stick_save_percent?.['SHOT'] || 0);
  const outsideRR = createPieOptions(goalieReport?.shots?.outside_RR_save_percent?.['SHOT'] || 0);
  const insideRR = createPieOptions(goalieReport?.shots?.inside_RR_save_percent?.['SHOT'] || 0);


  return (
    <div className="shot-report">
      <h2>Save Percentages by Area</h2>
      <h3>Shot Charts</h3>
      <div className="grid-container">
        <div className="grid-item" style={{ position: 'relative'}}>
          <img
            src="moneypuckrink half.jpg"
            alt="Background"
            style={{ width: '90%', height: '90%', marginLeft: '10%', zIndex: -1 }}
          />
          <canvas
            ref={canvasRef1}
            width="775"
            height="775"
            style={{ position: 'absolute', top: -10, left: 0, zIndex: 0,
            width: '100%', height: '100%'}}
          />
          <div style={{ position: 'absolute', top: '-10%', left: '40%', width: '23%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={Glove} />
            <div style={{ textAlign: 'center', marginTop: '-70%', zIndex: 1 }}>Glove</div>
          </div>
          <div style={{ position: 'absolute', top: '35%', left: '40%', width: '23%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={Stick} />
            <div style={{ textAlign: 'center', marginTop: '-70%', zIndex: 1 }}>Stick</div>
          </div>
          <div style={{ position: 'absolute', top: '15%', left: '60%', width: '23%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={RR} />
            <div style={{ textAlign: 'center', marginTop: '-70%', zIndex: 1 }}>Royal Road</div>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <p>Glove Side: {goalieReport?.shots?.glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Stick Side: {goalieReport?.shots?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Royal Road: {goalieReport?.shots?.RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>GLove Side: {averageGoalie?.shots?.glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Stick Side: {averageGoalie?.shots?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Royal Road: {averageGoalie?.shots?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                Save percentages by side of the ice
              </p>
            </div>
            <div className="data-section">
              <p>
                Save percentage is percentage of shots out of all shots and goals
              </p>
            </div>
            <div className={"data-section"}>
              <p>
                Higher percentage than the average goalie is better as the selected goalie
                is saving shots more often in that area
              </p>
            </div>
          </div>
        </div>
        <div className="grid-item" style={{ position: 'relative'}}>
          <img
            src="moneypuckrink half.jpg"
            alt="Background"
            style={{ width: '90%', height: '90%', marginLeft: '10%', zIndex: -1 }}
          />
          <canvas
            ref={canvasRef2}
            width="775"
            height="775"
            style={{ position: 'absolute', top: -10, left: 0, zIndex: 0,
            width: '100%', height: '100%'}}
          />
          <div style={{ position: 'absolute', top: '15%', left: '60%', width: '25%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={inside} />
            <div style={{ textAlign: 'center', marginTop: '-60%', zIndex: 1 }}>Inside</div>
          </div>
          <div style={{ position: 'absolute', top: '15%', left: '35%', width: '25%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outside} />
            <div style={{ textAlign: 'center', marginTop: '-60%', zIndex: 1 }}>Outside</div>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <p>Inside of the Plate: {goalieReport?.shots?.inside_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside of the Plate: {goalieReport?.shots?.outside_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Inside of the Plate: {averageGoalie?.shots?.inside_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside of the Plate: {averageGoalie?.shots?.outside_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                Save percentages by the inside or outside of the home plate
              </p>
            </div>
          </div>
        </div>
        <div className="grid-item" style={{ position: 'relative'}}>
          <img
            src="moneypuckrink half.jpg"
            alt="Background"
            style={{ width: '90%', height: '90%', marginLeft: '10%', zIndex: -1 }}
          />
          <canvas
            ref={canvasRef3}
            width="775"
            height="775"
            style={{ position: 'absolute', top: -10, left: 0, zIndex: 0,
            width: '100%', height: '100%'}}
          />
          <div style={{ position: 'absolute', top: '-16%', left: '32%', width: '23%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outsideStick} />
            <div style={{ textAlign: 'center', marginTop: '-70%', zIndex: 1 }}>Outside Stick</div>
          </div>
          <div style={{ position: 'absolute', top: '45%', left: '32%', width: '23%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outsideGlove} />
            <div style={{ textAlign: 'center', marginTop: '-70%', zIndex: 1 }}>Outside Glove</div>
          </div>
          <div style={{ position: 'absolute', top: '27%', left: '60%', width: '20%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={insideGlove} />
            <div style={{ textAlign: 'center', marginTop: '-90%', zIndex: 1 }}>Inside Glove</div>
          </div>
          <div style={{ position: 'absolute', top: '3%', left: '60%', width: '20%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={insideStick} />
            <div style={{ textAlign: 'center', marginTop: '-90%', zIndex: 1 }}>Inside Stick</div>
          </div>
          <div style={{ position: 'absolute', top: '13%', left: '75%', width: '20%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={insideRR} />
            <div style={{ textAlign: 'center', marginTop: '-90%', zIndex: 1 }}>Inside RR</div>
          </div>
          <div style={{ position: 'absolute', top: '13%', left: '32%', width: '23%', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outsideRR} />
            <div style={{ textAlign: 'center', marginTop: '-70%', zIndex: 1 }}>Outside RR</div>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-inner">
            <div className="data-section">
              <h4>Selected Goalie</h4>
              <p>Inside Stick Side: {goalieReport?.shots?.inside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Stick Side: {goalieReport?.shots?.outside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Glove Side: {goalieReport?.shots?.inside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Glove Side Side: {goalieReport?.shots?.outside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Royal Road: {goalieReport?.shots?.outside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Royal Road: {goalieReport?.shots?.inside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <h4>Average Goalie</h4>
              <p>Inside Stick Side: {averageGoalie?.shots?.inside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Stick Side: {averageGoalie?.shots?.outside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Glove Side: {averageGoalie?.shots?.inside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Glove Side Side: {averageGoalie?.shots?.outside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Royal Road: {averageGoalie?.shots?.outside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Royal Road: {averageGoalie?.shots?.inside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
            <div className="data-section">
              <p>
                Save percentages by the six areas defined in the report
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotReport;
