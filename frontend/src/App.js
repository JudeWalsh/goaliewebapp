import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [dropdown1Options, setDropdown1Options] = useState([]);
  const [dropdown2Options, setDropdown2Options] = useState([]);
  const [dropdown1Value, setDropdown1Value] = useState('');
  const [dropdown2Value, setDropdown2Value] = useState('');

  useEffect(() => {
    // Fetch data for dropdown 1 from the local server
    fetch('http://http://127.0.0.1:8000/teams')
      .then(response => response.json())
      .then(data => {
        setDropdown1Options(data);
      })
      .catch(error => {
        console.error('Error fetching dropdown 1 data:', error);
      });

    // Fetch data for dropdown 2 from the local server
    fetch('http://http://127.0.0.1:8000/teams')
      .then(response => response.json())
      .then(data => {
        setDropdown2Options(data);
      })
      .catch(error => {
        console.error('Error fetching dropdown 2 data:', error);
      });
  }, []); // Run only once when the component mounts

  const handleDropdown1Change = (event) => {
    setDropdown1Value(event.target.value);
  };

  const handleDropdown2Change = (event) => {
    setDropdown2Value(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Selected value from dropdown 1:', dropdown1Value);
    console.log('Selected value from dropdown 2:', dropdown2Value);
  };

  return (
    <div className="App">
      <h1>Dropdown Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="dropdown1">Dropdown 1:</label>
          <select id="dropdown1" value={dropdown1Value} onChange={handleDropdown1Change}>
            <option value="">Select Option 1</option>
            {dropdown1Options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dropdown2">Dropdown 2:</label>
          <select id="dropdown2" value={dropdown2Value} onChange={handleDropdown2Change}>
            <option value="">Select Option 2</option>
            {dropdown2Options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
