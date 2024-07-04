# Getting Started with Goalie Web App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# About the project

This project was created by Jude Walsh under Spartan Analytics LLC

It is a React based Web App that uses a fastAPI backend to retrieve statistics from the NHL API and data supplied by moneypuck.com

Use this web application to compare a selected active goalie in the league with the leagues average goalie.

The web app will divide all goals and saves by which side of the goalie they were shot from as well as if they were taken from inside the house or home plate.

Compare how your selected goalie fairs in certain areas of the ice compared to the average goalie. 

Change the year range to see how your selected goalie does in the same time frame as the average goalie. 

# Running the project

## To start up the backend server

### Navigate to the 'backend' directory
`cd backend`

### Create Virtual environment
`python -m venv venv`

### Activate Virtual Environment
On Mac: `source venv/bin/activate`

On Windows: `venv/scripts/activate`

### Install required libraries

`pip install -r requirements.txt`

### Start the Server

Method 1: `uvicorn api:app --reload`

Method 2: `python main.py`

## Start the React Frontend

### Open a new Terminal and navigate to 'Frontend' directory

`cd frontend`

## Start the project

`npm start`

# Backend Components

## 2014-2022.csv
This CSV file is a dataset provided by moneypuck.com (https://moneypuck.com/data.htm) 

It contains every shot taken in the NHL from 2014 to 2022 which becomes the database for the remainder of the prject

The data is the same as could be collected from the NHL's api, with some expected values and adjusted coordinates for half ice plotting

## api.py
Contains the routes for the FastAPI backend

Serves as a connection between the backend and frontend

## database.py
Queries the database for data as requested by the front end

Also runs summary calculations for the 'average goalie'

## main.py
Runs the uvicorn script 

## NHL.db
Database file that contains all shots from the 2014-2022.csv file

This file won't exist when you first clone the repo but the starting the backend will create it

## requirements.txt
Contains all required libraries to run the backend server

Install by running 

`pip install -r requirements.txt`

# Frontend Components

## App.js
Contains the dropdowns for selecting goalie

Also contains and creates the report components when goalie is selected

## GoalReport.js
The first report created and shown

Displays the goals scored on the selected goalie in the selected time frame

First splits them into three sections:
1. The goalies glove side
2. The goalies stick side
3. The royal road (Head on)

Then splits all goals scored into inside and outside of the house, or home plate (Drawn on the chart)

Finally splits all goals into "the six sections":
1. inside glove side
2. outside glove side
3. inside stick side
4. outside stick side
5. inside royal road
6. outside royal road

All of these are displayed for the selected goalie in the form of scatter plots while showing percentage distributions compared to the average goalie

Accounts for if the goalie is a lefty by indicating the "glove side" is on the goalies respective right

## SaveReport.js
The second report created and shown

Accomplishes the same as the goal report only instead of goals, this report shows saves.

'Saves' are the same as shots on goal, as determined by the NHL API as well as moneypuck.com
## ShotReport.js
Third and final report

The shot report shows the save percentages by each separation defined earlier (inside or outside; glove or stick side)

The right side of the report has a small toggle switch to switch between the text report comparison and the graphical comparison of save percentages between the selected goalie and the average
## sideSavePercent.js / houseSavePercent.js / sixSavePercent.js
Components for creating the save percentage charts, for both the selected goalie and the average goalie
