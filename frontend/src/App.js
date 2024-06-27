import React, { useState, useEffect } from 'react';
import GoalReport from './GoalReport';
import SaveReport from "./SaveReport";
import ShotReport from "./ShotReport";
import './App.css';

function App() {
  const [teamOptions, setTeamOptions] = useState([]);
  const [goalieOptions, setGoalieOptions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedGoalie, setSelectedGoalie] = useState('');
  const currentYear = new Date().getFullYear();
  const defaultStartYear = currentYear - 2; // Default start year is 5 years ago
  const defaultEndYear = currentYear; // Default end year is the current year
  const [startYear, setStartYear] = useState(defaultStartYear);
  const [endYear, setEndYear] = useState(defaultEndYear);
  const [reportData, setReportData] = useState(null);

  // Fetch team names from the server
  useEffect(() => {
    fetch('http://127.0.0.1:8000/teams')
      .then(response => response.json())
      .then(data => {
        setTeamOptions(data);
      })
      .catch(error => {
        console.error('Error fetching team data:', error);
      });
  }, []);

  // Fetch goalie names when a team is selected
  useEffect(() => {
    if (selectedTeam !== '') {
      fetch(`http://127.0.0.1:8000/${selectedTeam}/goalies`)
        .then(response => response.json())
        .then(data => {
          setGoalieOptions(data); // Store full data including id and names
        })
        .catch(error => {
          console.error('Error fetching goalie data:', error);
        });
    }
  }, [selectedTeam]);

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
  };

  const handleGoalieChange = (event) => {
    setSelectedGoalie(event.target.value);
  };

  const handleStartYearChange = (event) => {
    setStartYear(event.target.value);
  };

  const handleEndYearChange = (event) => {
    setEndYear(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Selected goalie ID:', selectedGoalie);
    if (selectedGoalie) {
      const reportParams = {
        goalieID: selectedGoalie,
        startYear,
        endYear,
      };
      // Set the new report data
      setReportData(reportParams)
    } else {
      console.log('No goalie selected');
    }
  };

  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i); // last 50 years

  return (
    <div className="App">
      <h1 className="header">Select a Goalie</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="team" className="label">Select a Team:</label>
          <select id="team" className="select" value={selectedTeam} onChange={handleTeamChange}>
            <option value="">Select a Team</option>
            {teamOptions.map((team, index) => (
              <option key={index} value={team} className="option">{team}</option>
            ))}
          </select>
        </div>
        {selectedTeam && (
          <div className="form-group">
            <label htmlFor="goalie" className="label">Select a Goalie:</label>
            <select id="goalie" className="select" value={selectedGoalie} onChange={handleGoalieChange}>
              <option value="">Select a Goalie</option>
              {goalieOptions.map((goalie) => (
                <option key={goalie.id} value={goalie.id} className="option">{goalie.firstName} {goalie.lastName}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group year-selectors">
          <div>
            <label htmlFor="startYear" className="label">Select Start Year:</label>
            <select id="startYear" className="select" value={startYear} onChange={handleStartYearChange}>
              <option value="">Select Start Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year} className="option">{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endYear" className="label">Select End Year:</label>
            <select id="endYear" className="select" value={endYear} onChange={handleEndYearChange}>
              <option value="">Select End Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year} className="option">{year}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="submit-button">Submit</button>
      </form>
      {reportData && <GoalReport goalieID={reportData.goalieID} startYear={reportData.startYear} endYear={reportData.endYear} />}
      {reportData && <SaveReport goalieID={reportData.goalieID} startYear={reportData.startYear} endYear={reportData.endYear} />}
      {reportData && <ShotReport goalieID={reportData.goalieID} startYear={reportData.startYear} endYear={reportData.endYear} />}
    </div>
  );
}

export default App;
