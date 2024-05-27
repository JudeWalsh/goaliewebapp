import requests
import pandas as pd
import sqlite3
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import numpy as np
from shapely.geometry import Point, Polygon

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
        self.conn = sqlite3.connect('NHL.db')
        self.cursor = self.conn.cursor()
        self.goalie = {}

    def get_Goalies(self):
        self.teamsGoalies = []
        url = f"https://api-web.nhle.com/v1/roster/{self.selectedTeam}/current"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            self.teamsGoalies = data['goalies']

    def update_goalies(self):
        column_data_types = {
            "id": "INTEGER PRIMARY KEY",
            "team": "TEXT",
            "headshot": "TEXT",
            "firstName": "TEXT",
            "lastName": "TEXT",
            "sweaterNumber": "INTEGER",
            "positionCode": "TEXT",
            "shootsCatches": "TEXT",
            "heightInInches": "INTEGER",
            "weightInPounds": "INTEGER",
            "heightInCentimeters": "INTEGER",
            "weightInKilograms": "INTEGER",
            "birthDate": "TEXT",
            "birthCountry": "TEXT"
        }

        columns = column_data_types.keys()

        # Create a table if not exists
        self.cursor.execute("DROP TABLE IF EXISTS goalies")
        create_table_sql = f'CREATE TABLE IF NOT EXISTS goalies ({", ".join([f"{column} {column_data_types[column]}" for column in columns])})'
        self.cursor.execute(create_table_sql)

        for team in self.teams:  # assuming self.teams is defined somewhere
            url = f"https://api-web.nhle.com/v1/roster/{team}/20232024"
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                goalies = data['goalies']
                for goalie in goalies:
                    # Flatten the nested dictionaries and convert to DataFrame
                    df = pd.json_normalize(goalie)
                    df['team'] = team
                    df.rename(columns={"firstName.default": "firstName",
                                       "lastName.default": "lastName"}, inplace=True)
                    df = df[[col for col in columns if col in df.columns]]
                    # Insert DataFrame into SQLite table
                    df.to_sql(name='goalies', con=conn, if_exists='append', index=False)
        # Commit the transaction and close the connection
        self.conn.commit()

    def team_goalies(self, team_code):
        # Execute the SELECT query
        self.cursor.execute(f"SELECT * FROM goalies WHERE team = '{team_code}'")

        # Fetch all rows from the result into a DataFrame
        df = pd.DataFrame(self.cursor.fetchall(), columns=[col[0] for col in self.cursor.description])

        # Convert DataFrame to a list of dictionaries
        result = df.to_dict(orient='records')

        # Return the list of dictionaries
        return result

    def goalie_report(self, goalieID):
        query = "SELECT * FROM shots WHERE goalieIdForShot = ?"
        df = pd.read_sql_query(query, self.conn, params=(goalieID,))

        # Drop columns with all NaN values
        df = df.dropna(how='all', axis=1)

        polygon_points = [(54, 22), (54, -22), (69, -22), (89, -11), (89, 11), (69, 22)]
        polygon = Polygon(polygon_points)

        # Function to check if a point is within the polygon
        def is_within_polygon(x, y, polygon):
            point = Point(x, y)
            return polygon.contains(point)

        # Apply the function to create the "Home Plate" column
        df['Home Plate'] = df.apply(
            lambda row: 'inside' if is_within_polygon(row['xCordAdjusted'], row['yCordAdjusted'],
                                                      polygon) else 'outside', axis=1)

        # Filter rows for goals
        goals_df = df[df['event'] == 'GOAL'].copy()
        shots_df = df[df['event'] == 'SHOT'].copy()

        # Add the 'side' column
        goals_df['side'] = goals_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        # Calculate side distribution
        side_distribution = goals_df['side'].value_counts(normalize=True) * 100
        self.goalie['side_dist_goals'] = side_distribution

        polygon_points = [(54, 22), (54, -22), (69, -22), (89, -11), (89, 11), (69, 22)]
        polygon = Polygon(polygon_points)

        # Function to check if a point is within the polygon
        def is_within_polygon(x, y, polygon):
            point = Point(x, y)
            return polygon.contains(point)

        plate_distribution = goals_df['Home Plate'].value_counts(normalize=True) * 100
        self.goalie['plate_dist_goals'] = plate_distribution

        inside_home_plate_df = goals_df[goals_df['Home Plate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = goals_df[goals_df['Home Plate'] == 'outside']

        side_distribution = inside_home_plate_df['side'].value_counts(normalize=True) * 100
        self.goalie['inside_dist_goals'] = side_distribution

        side_distribution = outside_home_plate_df['side'].value_counts(normalize=True) * 100
        self.goalie['outside_dist_goals'] = side_distribution

    def goalie_shot_cords(self, goalieID):
        query = "SELECT xCordAdjusted, yCordAdjusted FROM shots WHERE goalieIdForShot = ? AND event = 'GOAL';"
        df = pd.read_sql_query(query, self.conn, params=(goalieID,))
        df = df.dropna(how='all', axis=1)
        json_df = df.to_dict(orient='records')
        return json_df