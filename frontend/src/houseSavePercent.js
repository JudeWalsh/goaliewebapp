import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";

const HouseSavePercent = ({ goalieReport }) => {
  const canvasRef = useRef(null);

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

  // Drawing polygons on the second and third canvases
  useEffect(() => {
    if (canvasRef.current) {
      const polygonPoints = [
        [58, 13],
        [58, -25],
        [71, -25],
        [88, -15],
        [88, 4],
        [71, 13]
      ];
      drawPolygon(canvasRef.current, polygonPoints);
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

  const inside = createPieOptions(goalieReport?.inside_save_percent?.['SHOT'] || 0);
  const outside = createPieOptions(goalieReport?.outside_save_percent?.['SHOT'] || 0);

  return (
      <div className="side-save-percent">
          <img
              src="moneypuckrink half.jpg"
              alt="Background"
              style={{width: '90%', height: '90%', marginLeft: '10%', zIndex: -1}}
          />
          <canvas
              ref={canvasRef}
              width="775"
              height="775"
              style={{
                  position: 'absolute', top: -10, left: 0, zIndex: 0,
                  width: '100%', height: '100%'
              }}
          />
          <div style={{position: 'absolute', top: '15%', left: '60%', width: '25%', zIndex: 1}}>
              <HighchartsReact highcharts={Highcharts} options={inside}/>
              <div style={{textAlign: 'center', marginTop: '-60%', zIndex: 1}}>Inside</div>
          </div>
          <div style={{position: 'absolute', top: '15%', left: '35%', width: '25%', zIndex: 1}}>
              <HighchartsReact highcharts={Highcharts} options={outside}/>
              <div style={{textAlign: 'center', marginTop: '-60%', zIndex: 1}}>Outside</div>
          </div>
      </div>
  );
};

export default HouseSavePercent;
