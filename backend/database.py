import requests
import pandas as pd

class Database:

    def __init__(self):
        self.teams = [
            "ANA",  # Anaheim Ducks
            "ARI",  # Arizona Coyotes
            "BOS",  # Boston Bruins
            "BUF",  # Buffalo Sabres
            "CGY",  # Calgary Flames
            "CAR",  # Carolina Hurricanes
            "CHI",  # Chicago Blackhawks
            "COL",  # Colorado Avalanche
            "CBJ",  # Columbus Blue Jackets
            "DAL",  # Dallas Stars
            "DET",  # Detroit Red Wings
            "EDM",  # Edmonton Oilers
            "FLA",  # Florida Panthers
            "LAK",  # Los Angeles Kings
            "MIN",  # Minnesota Wild
            "MTL",  # Montreal Canadiens
            "NSH",  # Nashville Predators
            "NJD",  # New Jersey Devils
            "NYI",  # New York Islanders
            "NYR",  # New York Rangers
            "OTT",  # Ottawa Senators
            "PHI",  # Philadelphia Flyers
            "PIT",  # Pittsburgh Penguins
            "SJS",  # San Jose Sharks
            "STL",  # St. Louis Blues
            "TBL",  # Tampa Bay Lightning
            "TOR",  # Toronto Maple Leafs
            "VAN",  # Vancouver Canucks
            "VGK",  # Vegas Golden Knights
            "WSH",  # Washington Capitals
            "WPG"  # Winnipeg Jets
        ]
        self.selectedTeam = ''
        self.teamsGoalies = []


    def set_Team(self, team):
        self.selectedTeam = team

    def get_Goalies(self):
        self.teamsGoalies = []
        url = f"https://api-web.nhle.com/v1/roster/{self.selectedTeam}/20232024"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            self.teamsGoalies = data['goalies']
