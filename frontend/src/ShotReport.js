import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsHeatmap from 'highcharts/modules/heatmap';

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

    // Draw horizontal lines
    horizontalLines.forEach(([yStart, yEnd]) => {
      const canvasYStart = canvas.height / 2 - yStart * scaleY;
      const canvasYEnd = canvas.height / 2 - yEnd * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, canvasYStart);
      ctx.lineTo(canvas.width, canvasYStart);
      ctx.moveTo(0, canvasYEnd);
      ctx.lineTo(canvas.width, canvasYEnd);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // Define horizontal lines for the first canvas
  const horizontalLines1 = [
    [13.5, 13.5], // First horizontal line (y = -10)
    [7, 7]   // Second horizontal line (y = 10)
  ];

  // Define different sets of polygon points for other canvases
  const polygonPoints2 = [
      [58.5, 27],
      [58.5, -7],
      [72, -7],
      [90, 1.5],
      [90, 18.5],
      [72, 27]
    ];

  const polygonPoints3 = [
      [58.5, 27],
      [58.5, -7],
      [72, -7],
      [90, 1.5],
      [90, 18.5],
      [72, 27]
    ];

  // Drawing horizontal lines on the first canvas
  useEffect(() => {
    if (canvasRef1.current) {
      drawPolygon(canvasRef1.current, [], horizontalLines1);
    }
  }, []);

  // Drawing polygons on the second and third canvases
  useEffect(() => {
    if (canvasRef2.current) {
      drawPolygon(canvasRef2.current, polygonPoints2);
    }
  }, [polygonPoints2]);

  useEffect(() => {
    if (canvasRef3.current) {
      drawPolygon(canvasRef3.current, polygonPoints3);
    }
  }, [polygonPoints3]);


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
          textOutline: 'none'
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ position: 'relative', width: '500px', height: '500px' }}>
        <div style={{ position: 'relative'}}>
          <img
            src="moneypuckrink half.jpg"
            alt="Background"
            style={{ width: '90%', height: '90%', marginLeft: '10%', zIndex: -1 }}
          />
          <canvas
            ref={canvasRef1}
            width="500"
            height="500"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          />
          <div style={{ position: 'absolute', top: '-130px', left: '150px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={Glove} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Glove</div>
          </div>
          <div style={{ position: 'absolute', top: '100px', left: '150px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={Stick} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Stick</div>
          </div>
          <div style={{ position: 'absolute', top: '0px', left: '290px', width: '130px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={RR} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Royal Road</div>
          </div>
        </div>
        <div style={{ position: 'relative'}}>
          <img
            src="moneypuckrink half.jpg"
            alt="Background"
            style={{ width: '90%', height: '90%', marginLeft: '10%', zIndex: -1 }}
          />
          <canvas
            ref={canvasRef2}
            width="500"
            height="500"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          />
          <div style={{ position: 'absolute', top: '0px', left: '290px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={inside} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Inside</div>
          </div>
          <div style={{ position: 'absolute', top: '0px', left: '150px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outside} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Outside</div>
          </div>
        </div>
        <div style={{ position: 'relative'}}>
          <img
            src="moneypuckrink half.jpg"
            alt="Background"
            style={{ width: '90%', height: '90%', marginLeft: '10%', zIndex: -1 }}
          />
          <canvas
            ref={canvasRef3}
            width="500"
            height="500"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          />
          <div style={{ position: 'absolute', top: '-130px', left: '150px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outsideStick} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Outside Stick</div>
          </div>
          <div style={{ position: 'absolute', top: '130px', left: '150px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outsideGlove} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Outside Glove</div>
          </div>
          <div style={{ position: 'absolute', top: '60px', left: '290px', width: '130px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={insideGlove} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Inside Glove</div>
          </div>
          <div style={{ position: 'absolute', top: '-60px', left: '290px', width: '130px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={insideStick} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Inside Stick</div>
          </div>
          <div style={{ position: 'absolute', top: '0px', left: '375px', width: '120px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={insideRR} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Inside RR</div>
          </div>
          <div style={{ position: 'absolute', top: '0px', left: '150px', width: '150px', height: '150px', zIndex: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={outsideRR} />
            <div style={{ textAlign: 'center', marginTop: '-150px', zIndex: 1 }}>Outside RR</div>
          </div>
        </div>
      </div>
      <div>
        <h2>Save Percentages by Area</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <h3>Selected Goalie</h3>
            <div>
              <h4>By Goalie's Side</h4>
              <p>Head On: {goalieReport?.shots?.glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Head On: {goalieReport?.shots?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Head On: {goalieReport?.shots?.RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <h4>By Home Plate</h4>
              <p>Inside: {goalieReport?.shots?.inside_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside: {goalieReport?.shots?.outside_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <h4>By the Six Areas</h4>
              <p>Outside Glove: {goalieReport?.shots?.outside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Glove: {goalieReport?.shots?.inside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Stick: {goalieReport?.shots?.outside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Stick: {goalieReport?.shots?.inside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Royal Road: {goalieReport?.shots?.outside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Royal Road: {goalieReport?.shots?.inside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
          </div>
          <div>
            <h3>Average Goalie</h3>
            <div>
              <h4>By Goalie's Side</h4>
              <p>Head On: {averageGoalie?.shots?.glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Head On: {averageGoalie?.shots?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Head On: {averageGoalie?.shots?.RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <h4>By Home Plate</h4>
              <p>Inside: {averageGoalie?.shots?.inside_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside: {averageGoalie?.shots?.outside_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <h4>By the Six Areas</h4>
              <p>Outside Glove: {averageGoalie?.shots?.outside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Glove: {averageGoalie?.shots?.inside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Stick: {averageGoalie?.shots?.outside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Stick: {averageGoalie?.shots?.inside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Outside Royal Road: {averageGoalie?.shots?.outside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
              <p>Inside Royal Road: {averageGoalie?.shots?.inside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotReport;
