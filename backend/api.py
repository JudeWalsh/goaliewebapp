from fastapi import FastAPI
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

@app.get("/report/{goalieID}")
async def goalie_report(goalieID):
    db.goalie_report(goalieID)
    return db.goalie

@app.get("/coordinates/{goalieID}")
async def goalie_coordinates(goalieID):
    return db.goalie_shot_cords(goalieID)