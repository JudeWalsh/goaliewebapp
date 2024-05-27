import React, { useState, useEffect } from 'react';
import Report from './Report';

function App() {
  const [teamOptions, setTeamOptions] = useState([]);
  const [goalieOptions, setGoalieOptions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedGoalie, setSelectedGoalie] = useState('');
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

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Selected goalie ID:', selectedGoalie);
    if (selectedGoalie) {
        setReportData(selectedGoalie); // Pass the selectedGoalie ID
    } else {
        console.log('No goalie selected');
    }
};

  return (
    <div className="App">
      <h1>Team and Goalie Dropdown</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="team">Select a Team:</label>
          <select id="team" value={selectedTeam} onChange={handleTeamChange}>
            <option value="">Select a Team</option>
            {teamOptions.map((team, index) => (
              <option key={index} value={team}>{team}</option>
            ))}
          </select>
        </div>
        {selectedTeam && (
          <div>
            <label htmlFor="goalie">Select a Goalie:</label>
            <select id="goalie" value={selectedGoalie} onChange={handleGoalieChange}>
              <option value="">Select a Goalie</option>
              {goalieOptions.map((goalie) => (
                <option key={goalie.id} value={goalie.id}>{goalie.firstName} {goalie.lastName}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
      {reportData && <Report goalieID={reportData} />}
    </div>
  );
}

export default App;
