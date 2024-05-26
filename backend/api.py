from fastapi import FastAPI
from database import Database
# Create an instance of FastAPI
app = FastAPI()
db = Database()

# Define a route
@app.get("/")
async def read_root():
    return {'API': 'UP'}

@app.get("/teams")
async def NHL_teams():
    return db.teams
