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
        polygon_points = [(54, 22), (54, -22), (69, -22), (89, -11), (89, 11), (69, 22)]
        self.house = Polygon(polygon_points)
        self.selectedTeam = ''
        self.teamsGoalies = []
        self.conn = sqlite3.connect('NHL.db')
        self.cursor = self.conn.cursor()
        # self.temp_db_stuff()
        # self.update_goalies()
        self.goalie = {}
        self.average_goalie = {}
        self.average_goalie_report()

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
                    df.to_sql(name='goalies', con=self.conn, if_exists='append', index=False)
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

    def is_within_house(self, x, y):
        point = Point(x, y)
        return self.house.contains(point)

    def goalie_report(self, goalieID, season=2022):
        summary = {}
        goals_report = {}
        saves_report = {}
        shots_report = {}
        query = f"SELECT * FROM shots WHERE goalieIdForShot = ? AND season >= {season}"
        df = pd.read_sql_query(query, self.conn, params=(goalieID,))

        # Drop columns with all NaN values
        df = df.dropna(how='all', axis=1)

        value_counts_dict = df['event'].value_counts().to_dict()
        value_counts_dict['EVENTS'] = len(df)
        self.goalie['summary'] = value_counts_dict

        # Apply the function to create the "Home Plate" column
        df['homePlate'] = df.apply(
            lambda row: 'inside' if self.is_within_house(row['xCordAdjusted'], row['yCordAdjusted']) else 'outside', axis=1)

        '''
        DIVIDE DATA BY AREA FOR GOALS SCORED
        '''
        # Filter rows for goals
        goals_df = df[df['event'] == 'GOAL'].copy()

        # Add the 'side' column
        goals_df['side'] = goals_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        # Calculate side distribution
        side_distribution = goals_df['side'].value_counts(normalize=True) * 100
        goals_report['side_dist_goals'] = side_distribution

        plate_distribution = goals_df['homePlate'].value_counts(normalize=True) * 100
        goals_report['plate_dist_goals'] = plate_distribution

        inside_home_plate_df = goals_df[goals_df['homePlate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = goals_df[goals_df['homePlate'] == 'outside']

        side_distribution = inside_home_plate_df['side'].value_counts(normalize=True) * 100
        goals_report['inside_dist_goals'] = side_distribution

        side_distribution = outside_home_plate_df['side'].value_counts(normalize=True) * 100
        goals_report['outside_dist_goals'] = side_distribution
        self.goalie['goals'] = goals_report

        '''
        DIVIDE DATA BY AREA FOR SHOTS SAVED
        '''
        save_df = df[df['event'] == 'SHOT'].copy()

        save_df['side'] = save_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        # Calculate side distribution
        side_distribution = save_df['side'].value_counts(normalize=True) * 100
        saves_report['side_dist_saves'] = side_distribution

        plate_distribution = save_df['homePlate'].value_counts(normalize=True) * 100
        saves_report['plate_dist_saves'] = plate_distribution

        inside_home_plate_df = save_df[save_df['homePlate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = save_df[save_df['homePlate'] == 'outside']

        side_distribution = inside_home_plate_df['side'].value_counts(normalize=True) * 100
        saves_report['inside_dist_saves'] = side_distribution

        side_distribution = outside_home_plate_df['side'].value_counts(normalize=True) * 100
        saves_report['outside_dist_saves'] = side_distribution
        self.goalie['saves'] = saves_report

        '''
        DIVIDE DATA BY AREA FOR SHOTS ON GOAL, SAVES AND GOALS
        '''
        shots_df = df[df['event'] != 'MISS'].copy()

        shots_df['side'] = shots_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        glove_shots = shots_df[shots_df['side'] == 'Glove'].copy()
        stick_shots = shots_df[shots_df['side'] == 'Stick'].copy()
        RR_shots = shots_df[shots_df['side'] == 'Stick'].copy()

        glove_save_percentage = glove_shots['event'].value_counts(normalize=True) * 100
        stick_save_percentage = stick_shots['event'].value_counts(normalize=True) * 100
        RR_save_percentage = RR_shots['event'].value_counts(normalize=True) * 100

        shots_report['glove_save_percent'] = glove_save_percentage
        shots_report['stick_save_percent'] = stick_save_percentage
        shots_report['RR_save_percent'] = RR_save_percentage

        # Create DataFrame for points inside the home plate
        inside_home_plate_df = shots_df[shots_df['homePlate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = shots_df[shots_df['homePlate'] == 'outside']

        inside_save_percentage = inside_home_plate_df['event'].value_counts(normalize=True) * 100
        outside_save_percentage = outside_home_plate_df['event'].value_counts(normalize=True) * 100

        shots_report['inside_save_percent'] = inside_save_percentage
        shots_report['outside_save_percent'] = outside_save_percentage

        outside_glove = outside_home_plate_df[outside_home_plate_df['side'] == 'Glove'].copy()
        inside_glove = inside_home_plate_df[inside_home_plate_df['side'] == 'Glove'].copy()
        outside_stick = outside_home_plate_df[outside_home_plate_df['side'] == 'Stick'].copy()
        inside_stick = inside_home_plate_df[inside_home_plate_df['side'] == 'Stick'].copy()
        outside_RR = outside_home_plate_df[outside_home_plate_df['side'] == 'Head On']
        inside_RR = inside_home_plate_df[inside_home_plate_df['side'] == 'Head On']

        shots_report['outside_glove_save_percent'] = outside_glove['event'].value_counts(normalize=True) * 100
        shots_report['inside_glove_save_percent'] = inside_glove['event'].value_counts(normalize=True) * 100
        shots_report['outside_stick_save_percent'] = outside_stick['event'].value_counts(normalize=True) * 100
        shots_report['inside_stick_save_percent'] = inside_stick['event'].value_counts(normalize=True) * 100
        shots_report['outside_RR_save_percent'] = outside_RR['event'].value_counts(normalize=True) * 100
        shots_report['inside_RR_save_percent'] = inside_RR['event'].value_counts(normalize=True) * 100

        self.goalie['shots'] = shots_report

    def average_goalie_report(self, season=2022):
        summary = {}
        goals_report = {}
        saves_report = {}
        shots_report = {}
        query = f"SELECT * FROM shots WHERE season >= {season}"
        df = pd.read_sql_query(query, self.conn)

        # Drop columns with all NaN values
        df = df.dropna(how='all', axis=1)
        df_filtered = df.groupby('goalieIdForShot').filter(lambda x: len(x) >= 702)
        num_goalies = len(df_filtered['goalieIdForShot'].unique())
        summary['EVENTS'] = len(df_filtered) / num_goalies

        summary['SHOT'] = np.mean(df_filtered[df_filtered['event'] == 'SHOT']['goalieIdForShot'].value_counts())
        summary['MISS'] = np.mean(df_filtered[df_filtered['event'] == 'MISS']['goalieIdForShot'].value_counts())
        summary['GOAL'] = np.mean(df_filtered[df_filtered['event'] == 'GOAL']['goalieIdForShot'].value_counts())

        summary['STD_EVENTS'] = df_filtered['goalieIdForShot'].value_counts().std()
        summary['STD_SHOT'] = np.std(df_filtered[df_filtered['event'] == 'SHOT']['goalieIdForShot'].value_counts())
        summary['STD_MISS'] = np.std(df_filtered[df_filtered['event'] == 'MISS']['goalieIdForShot'].value_counts())
        summary['STD_GOAL'] = np.std(df_filtered[df_filtered['event'] == 'GOAL']['goalieIdForShot'].value_counts())

        self.average_goalie['summary'] = summary


        polygon_points = [(54, 22), (54, -22), (69, -22), (89, -11), (89, 11), (69, 22)]
        polygon = Polygon(polygon_points)

        # Apply the function to create the "homePlate" column
        df['homePlate'] = df.apply(
            lambda row: 'inside' if self.is_within_house(row['xCordAdjusted'], row['yCordAdjusted']) else 'outside', axis=1)

        '''
        DIVIDE DATA BY AREA FOR GOALS SCORED
        '''
        # Filter rows for goals
        goals_df = df[df['event'] == 'GOAL'].copy()

        # Add the 'side' column
        goals_df['side'] = goals_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        # Calculate side distribution
        side_distribution = goals_df['side'].value_counts(normalize=True) * 100
        goals_report['side_dist_goals'] = side_distribution

        plate_distribution = goals_df['homePlate'].value_counts(normalize=True) * 100
        goals_report['plate_dist_goals'] = plate_distribution

        inside_home_plate_df = goals_df[goals_df['homePlate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = goals_df[goals_df['homePlate'] == 'outside']

        side_distribution = inside_home_plate_df['side'].value_counts(normalize=True) * 100
        goals_report['inside_dist_goals'] = side_distribution

        side_distribution = outside_home_plate_df['side'].value_counts(normalize=True) * 100
        goals_report['outside_dist_goals'] = side_distribution
        self.average_goalie['goals'] = goals_report

        '''
        DIVIDE DATA BY AREA FOR SHOTS SAVED
        '''
        save_df = df[df['event'] == 'SHOT'].copy()

        save_df['side'] = save_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        # Calculate side distribution
        side_distribution = save_df['side'].value_counts(normalize=True) * 100
        saves_report['side_dist_saves'] = side_distribution

        plate_distribution = save_df['homePlate'].value_counts(normalize=True) * 100
        saves_report['plate_dist_saves'] = plate_distribution

        inside_home_plate_df = save_df[save_df['homePlate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = save_df[save_df['homePlate'] == 'outside']

        side_distribution = inside_home_plate_df['side'].value_counts(normalize=True) * 100
        saves_report['inside_dist_saves'] = side_distribution

        side_distribution = outside_home_plate_df['side'].value_counts(normalize=True) * 100
        saves_report['outside_dist_saves'] = side_distribution
        self.average_goalie['saves'] = saves_report

        '''
        DIVIDE DATA BY AREA FOR SHOTS ON GOAL, SAVES AND GOALS
        '''
        shots_df = df[df['event'] != 'MISS'].copy()

        shots_df['side'] = shots_df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))

        glove_shots = shots_df[shots_df['side'] == 'Glove'].copy()
        stick_shots = shots_df[shots_df['side'] == 'Stick'].copy()
        RR_shots = shots_df[shots_df['side'] == 'Stick'].copy()

        glove_save_percentage = glove_shots['event'].value_counts(normalize=True) * 100
        stick_save_percentage = stick_shots['event'].value_counts(normalize=True) * 100
        RR_save_percentage = RR_shots['event'].value_counts(normalize=True) * 100

        shots_report['glove_save_percent'] = glove_save_percentage
        shots_report['stick_save_percent'] = stick_save_percentage
        shots_report['RR_save_percent'] = RR_save_percentage

        # Create DataFrame for points inside the home plate
        inside_home_plate_df = shots_df[shots_df['homePlate'] == 'inside']

        # Create DataFrame for points outside the home plate
        outside_home_plate_df = shots_df[shots_df['homePlate'] == 'outside']

        inside_save_percentage = inside_home_plate_df['event'].value_counts(normalize=True) * 100
        outside_save_percentage = outside_home_plate_df['event'].value_counts(normalize=True) * 100

        shots_report['inside_save_percent'] = inside_save_percentage
        shots_report['outside_save_percent'] = outside_save_percentage

        outside_glove = outside_home_plate_df[outside_home_plate_df['side'] == 'Glove'].copy()
        inside_glove = inside_home_plate_df[inside_home_plate_df['side'] == 'Glove'].copy()
        outside_stick = outside_home_plate_df[outside_home_plate_df['side'] == 'Stick'].copy()
        inside_stick = inside_home_plate_df[inside_home_plate_df['side'] == 'Stick'].copy()
        outside_RR = outside_home_plate_df[outside_home_plate_df['side'] == 'Head On']
        inside_RR = inside_home_plate_df[inside_home_plate_df['side'] == 'Head On']

        shots_report['outside_glove_save_percent'] = outside_glove['event'].value_counts(normalize=True) * 100
        shots_report['inside_glove_save_percent'] = inside_glove['event'].value_counts(normalize=True) * 100
        shots_report['outside_stick_save_percent'] = outside_stick['event'].value_counts(normalize=True) * 100
        shots_report['inside_stick_save_percent'] = inside_stick['event'].value_counts(normalize=True) * 100
        shots_report['outside_RR_save_percent'] = outside_RR['event'].value_counts(normalize=True) * 100
        shots_report['inside_RR_save_percent'] = inside_RR['event'].value_counts(normalize=True) * 100

        self.average_goalie['shots'] = shots_report


    def adjust_df(self, df):
        # Apply the function to create the "homePlate" column
        df['homePlate'] = df.apply(
            lambda row: 'inside' if self.is_within_house(row['xCordAdjusted'],
                                                         row['yCordAdjusted']) else 'outside', axis=1)
        df['side'] = df['yCordAdjusted'].apply(
            lambda y: 'Stick' if y > 3 else ('Glove' if y < -3 else 'Head On'))
        return df

    def goal_shot_cords(self, goalieID, season=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted, shooterName, teamCode, season FROM shots WHERE goalieIdForShot = ? AND event = 'GOAL' AND season >= {season};"
        df = pd.read_sql_query(query, self.conn, params=(goalieID,))
        df = df.dropna(how='all', axis=1)
        df = self.adjust_df(df)
        json_df = df.to_dict(orient='records')
        return json_df

    def all_goal_shot_cords(self, season=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted FROM shots WHERE event = 'GOAL' AND season >= {season};"
        df = pd.read_sql_query(query, self.conn)
        df = df.dropna(how='all', axis=1)
        df = self.adjust_df(df)
        json_df = df.to_dict(orient='records')
        return json_df

    def save_shot_cords(self, goalieID, season=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted, shooterName, teamCode, season FROM shots WHERE goalieIdForShot = ? AND event = 'SHOT' AND season >= {season};"
        df = pd.read_sql_query(query, self.conn, params=(goalieID,))
        df = df.dropna(how='all', axis=1)
        df = self.adjust_df(df)
        json_df = df.to_dict(orient='records')
        return json_df

    def all_save_shot_cords(self, season=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted FROM shots WHERE event = 'SHOT' AND season >= {season};"
        df = pd.read_sql_query(query, self.conn)
        df = df.dropna(how='all', axis=1)
        df = self.adjust_df(df)
        json_df = df.to_dict(orient='records')
        return json_df

    def temp_db_stuff(self):
        # Read "NHL_shots.csv" into a pandas DataFrame
        df = pd.read_csv("2014-2022.csv")

        # Drop the "shots" table if it exists
        self.cursor.execute("DROP TABLE IF EXISTS shots")

        # Write the DataFrame to the "shots" table in the SQLite database
        df.to_sql(name='shots', con=self.conn, if_exists='replace', index=False)

        # Commit the transaction to save the changes
        self.conn.commit()