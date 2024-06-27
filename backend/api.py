from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from database import Database
# Create an instance of FastAPI
app = FastAPI()
db = Database()

origins = [
    "http://localhost",
    "http://localhost:3000"
]

# Add CORS middleware with allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Define a route
@app.get("/")
async def read_root():
    return {'API': 'UP'}

@app.get("/teams")
async def NHL_teams():
    return db.teams

@app.get("/{team_code}/goalies")
async def team_goalies(team_code):
    return db.team_goalies(team_code)

@app.get("/goalreport/{goalieID}")
async def goal_report(goalieID: str, startYear: int = Query(None), endYear: int = Query(None)):
    try:
        if goalieID == 'all':
            return db.average_goal_report(start_year=startYear, end_year=endYear)
        else:
            return db.goal_report(goalieID=goalieID, start_year=startYear, end_year=endYear)
    except Exception as e:
        return {'error': str(e)}

@app.get("/savereport/{goalieID}")
async def save_report(goalieID: str, startYear: int = Query(None), endYear: int = Query(None)):
    if goalieID == 'all':
        return db.average_save_report(start_year=startYear, end_year=endYear)
    else:
        return db.save_report(goalieID=goalieID, start_year=startYear, end_year=endYear)

@app.get("/shotreport/{goalieID}")
async def shot_report(goalieID: str, startYear: int = Query(None), endYear: int = Query(None)):
    if goalieID == 'all':
        return db.average_shot_report(start_year=startYear, end_year=endYear)
    else:
        return db.shot_report(goalieID=goalieID, start_year=startYear, end_year=endYear)

@app.get("/coordinates/goals/{goalieID}")
async def goal_coordinates(goalieID: str, startYear: int = Query(None), endYear: int = Query(None)):
    if goalieID == 'all':
        return db.all_goal_shot_cords(start_year=startYear, end_year=endYear)
    else:
        return db.goal_shot_cords(goalieID, start_year=startYear, end_year=endYear)

@app.get("/coordinates/saves/{goalieID}")
async def save_coordinates(goalieID: str, startYear: int = Query(None), endYear: int = Query(None)):
    if goalieID == 'all':
        return db.all_save_shot_cords(start_year=startYear, end_year=endYear)
    else:
        return db.save_shot_cords(goalieID, start_year=startYear, end_year=endYear)
