import React, { useState, useEffect } from 'react';
import Switch from 'react-switch';
import SideSavePercent from "./sideSavePercent";
import HouseSavePercent from "./houseSavePercent";
import SixSavePercent from "./sixSavePercent";
import './ShotReport.css';

const ShotReport = ({ goalieID, goalieName, startYear, endYear }) => {
  const [goalieReport, setGoalieReport] = useState(null);
  const [averageGoalie, setAverageGoalie] = useState(null);
  const [visualizeSide, setVisualizeSide] = useState(false);
  const [visualizeHouse, setVisualizeHouse] = useState(false);
  const [visualizeSix, setVisualizeSix] = useState(false);

  // Fetch the report data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/shotreport/${goalieID}?startYear=${startYear}&endYear=${endYear}`)
      .then(response => response.json())
      .then(data => setGoalieReport(data))
      .catch(error => console.error('Error fetching report data:', error));
  }, [goalieID, startYear, endYear]);

  // Fetch the report data for the average goalie
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/shotreport/all?startYear=${startYear}&endYear=${endYear}`)
      .then(response => response.json())
      .then(data => setAverageGoalie(data))
      .catch(error => console.error('Error fetching report data:', error));
  }, [startYear, endYear]);

  const handleSideToggle = () => {
    setVisualizeSide(!visualizeSide);
  };

  const handleHouseToggle = () => {
    setVisualizeHouse(!visualizeHouse);
  };

  const handleSixToggle = () => {
    setVisualizeSix(!visualizeSix);
  };

  return (
    <div className="shot-report">
      <h2>Save Percentages by Area</h2>
      <h3>Shot Charts</h3>
      <div className="grid-container">
        <div className="grid-item" style={{ position: 'relative'}}>
          <h2 style={{textAlign: 'center'}}>{goalieName}</h2>
          <SideSavePercent goalieReport={goalieReport}/>
        </div>
        <div className="grid-item" style={{ position: 'relative'}}>
          { !visualizeSide ? (
            <div className="grid-inner">
              <React.Fragment>
                <div className="data-section">
                  <h4>{goalieName}</h4>
                  <p>Glove Side: {goalieReport?.glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Stick Side: {goalieReport?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Royal Road: {goalieReport?.RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
                </div>
                <div className="data-section">
                  <h4>Average Goalie</h4>
                  <p>Glove Side: {averageGoalie?.glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Stick Side: {averageGoalie?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Royal Road: {averageGoalie?.stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
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
              </React.Fragment>
              </div>
            ) : (
              <React.Fragment>
                <h2 style={{textAlign: 'center'}}>Average Goalie</h2>
                <SideSavePercent goalieReport={averageGoalie}/>
              </React.Fragment>
            )}
          <div className="switch-container">
            <Switch
              onChange={handleSideToggle}
              checked={visualizeSide}
              offColor="#888"
              onColor="#0f0"
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
        </div>
        <div className="grid-item" style={{ position: 'relative'}}>
          <h2 style={{textAlign: 'center'}}>{goalieName}</h2>
          <HouseSavePercent goalieReport={goalieReport}/>
        </div>
        <div className="grid-item" style={{ position: 'relative'}}>
          {!visualizeHouse ? (
            <div className="grid-inner">
              <React.Fragment>
                <div className="data-section">
                  <h4>{goalieName}</h4>
                  <p>Inside of the Plate: {goalieReport?.inside_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside of the Plate: {goalieReport?.outside_save_percent?.['SHOT']?.toFixed(2)}%</p>
                </div>
                <div className="data-section">
                  <h4>Average Goalie</h4>
                  <p>Inside of the Plate: {averageGoalie?.inside_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside of the Plate: {averageGoalie?.outside_save_percent?.['SHOT']?.toFixed(2)}%</p>
                </div>
                <div className="data-section">
                  <p>
                    Save percentages by the inside or outside of the home plate
                  </p>
                </div>
              </React.Fragment>
              </div>
            ) : (
              <React.Fragment>
                <h2 style={{textAlign: 'center'}}>Average Goalie</h2>
                <HouseSavePercent goalieReport={averageGoalie}/>
              </React.Fragment>
            )}
          <div className="switch-container">
            <Switch
              onChange={handleHouseToggle}
              checked={visualizeHouse}
              offColor="#888"
              onColor="#0f0"
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
        </div>
        <div className="grid-item" style={{position: 'relative'}}>
          <h2 style={{textAlign: 'center'}}>{goalieName}</h2>
          <SixSavePercent goalieReport={goalieReport}/>
        </div>
        <div className="grid-item" style={{position: 'relative'}}>
          {!visualizeSix ? (
            <div className="grid-inner">
              <React.Fragment>
                <div className="data-section">
                  <h4>{goalieName}</h4>
                  <p>Inside Stick Side: {goalieReport?.inside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside Stick Side: {goalieReport?.outside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Inside Glove Side: {goalieReport?.inside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside Glove Side Side: {goalieReport?.outside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside Royal Road: {goalieReport?.outside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Inside Royal Road: {goalieReport?.inside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
                </div>
                <div className="data-section">
                  <h4>Average Goalie</h4>
                  <p>Inside Stick Side: {averageGoalie?.inside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside Stick Side: {averageGoalie?.outside_stick_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Inside Glove Side: {averageGoalie?.inside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside Glove Side Side: {averageGoalie?.outside_glove_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Outside Royal Road: {averageGoalie?.outside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
                  <p>Inside Royal Road: {averageGoalie?.inside_RR_save_percent?.['SHOT']?.toFixed(2)}%</p>
                </div>
                <div className="data-section">
                  <p>
                    Save percentages by the six areas defined in the report
                  </p>
                </div>
              </React.Fragment>
            </div>
              ) : (
              <React.Fragment>
                <h2 style={{textAlign: 'center'}}>Average Goalie</h2>
                <SixSavePercent goalieReport={averageGoalie}/>
              </React.Fragment>
              )}
          <div className="switch-container">
            <Switch
            onChange={handleSixToggle}
            checked={visualizeSix}
            offColor="#888"
            onColor="#0f0"
            uncheckedIcon={false}
            checkedIcon={false}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotReport;
