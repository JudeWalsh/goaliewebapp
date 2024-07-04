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

    def goal_report(self, goalieID, start_year=2022, end_year=2022):
        goals_report = {}
        query = f"SELECT * FROM shots " \
                f"WHERE goalieIdForShot = ? " \
                f"AND season >= ? " \
                f"AND season <= ?"
        df = pd.read_sql_query(query, self.conn, params=(goalieID, start_year, end_year))

        # Drop columns with all NaN values
        df = df.dropna(how='all', axis=1)

        '''
        SUMMARY REPORT
        '''
        value_counts_dict = df['event'].value_counts().to_dict()
        value_counts_dict['EVENTS'] = len(df)
        goals_report['summary'] = value_counts_dict

        '''
        DIVIDE DATA BY AREA FOR GOALS SCORED
        '''
        # Filter rows for goals
        goals_df = df[df['event'] == 'GOAL'].copy()

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
        return goals_report

    def save_report(self, goalieID, start_year=2022, end_year=2022):
        saves_report = {}
        query = f"SELECT * FROM shots " \
                f"WHERE goalieIdForShot = ? " \
                f"AND season >= ? " \
                f"AND season <= ?"
        df = pd.read_sql_query(query, self.conn, params=(goalieID, start_year, end_year))

        # Drop columns with all NaN values
        df = df.dropna(how='all', axis=1)

        '''
        SUMMARY REPORT
        '''
        value_counts_dict = df['event'].value_counts().to_dict()
        value_counts_dict['EVENTS'] = len(df)
        saves_report['summary'] = value_counts_dict

        '''
        DIVIDE DATA BY AREA FOR SHOTS SAVED
        '''
        save_df = df[df['event'] == 'SHOT'].copy()

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
        return saves_report

    def shot_report(self, goalieID, start_year=2022, end_year=2022):
        query = f"SELECT * FROM shots " \
                f"WHERE goalieIdForShot = ? " \
                f"AND season >= ? " \
                f"AND season <= ?"
        df = pd.read_sql_query(query, self.conn, params=(goalieID, start_year, end_year))

        # Drop columns with all NaN values
        df = df.dropna(how='all', axis=1)
        shots_report = {}

        '''
        SUMMARY REPORT
        '''
        value_counts_dict = df['event'].value_counts().to_dict()
        value_counts_dict['EVENTS'] = len(df)
        shots_report['summary'] = value_counts_dict

        '''
        DIVIDE DATA BY AREA FOR SHOTS ON GOAL, SAVES AND GOALS
        '''
        shots_df = df[df['event'] != 'MISS'].copy()

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

        return shots_report

    def average_goal_report(self, start_year=2022, end_year=2022):
        '''
        DIVIDE DATA BY AREA FOR GOALS SCORED
        '''
        query = f"SELECT * FROM shots WHERE season >= {start_year} AND season <= {end_year}"
        df = pd.read_sql_query(query, self.conn)
        goals_report = {}
        summary = {}

        df = df.dropna(how='all', axis=1)
        df_filtered = df.groupby('goalieIdForShot').filter(lambda x: len(x) >= 0)
        num_goalies = len(df_filtered['goalieIdForShot'].unique())
        summary['EVENTS'] = len(df_filtered) / num_goalies

        summary['SHOT'] = np.mean(df_filtered[df_filtered['event'] == 'SHOT']['goalieIdForShot'].value_counts())
        summary['MISS'] = np.mean(df_filtered[df_filtered['event'] == 'MISS']['goalieIdForShot'].value_counts())
        summary['GOAL'] = np.mean(df_filtered[df_filtered['event'] == 'GOAL']['goalieIdForShot'].value_counts())

        summary['STD_EVENTS'] = df_filtered['goalieIdForShot'].value_counts().std()
        summary['STD_SHOT'] = np.std(df_filtered[df_filtered['event'] == 'SHOT']['goalieIdForShot'].value_counts())
        summary['STD_MISS'] = np.std(df_filtered[df_filtered['event'] == 'MISS']['goalieIdForShot'].value_counts())
        summary['STD_GOAL'] = np.std(df_filtered[df_filtered['event'] == 'GOAL']['goalieIdForShot'].value_counts())

        goals_report['summary'] = summary

        # Filter rows for goals
        goals_df = df[df['event'] == 'GOAL'].copy()

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
        return goals_report

    def average_save_report(self, start_year=2022, end_year=2022):
        '''
        DIVIDE DATA BY AREA FOR SHOTS SAVED
        '''

        query = f"SELECT * FROM shots WHERE season >= {start_year} AND season <= {end_year}"
        df = pd.read_sql_query(query, self.conn)

        saves_report = {}
        save_df = df[df['event'] == 'SHOT'].copy()

        '''
        SUMMARY REPORT
        '''
        summary = {}

        df = df.dropna(how='all', axis=1)
        df_filtered = df.groupby('goalieIdForShot').filter(lambda x: len(x) >= 0)
        num_goalies = len(df_filtered['goalieIdForShot'].unique())
        summary['EVENTS'] = len(df_filtered) / num_goalies

        summary['SHOT'] = np.mean(df_filtered[df_filtered['event'] == 'SHOT']['goalieIdForShot'].value_counts())
        summary['MISS'] = np.mean(df_filtered[df_filtered['event'] == 'MISS']['goalieIdForShot'].value_counts())
        summary['GOAL'] = np.mean(df_filtered[df_filtered['event'] == 'GOAL']['goalieIdForShot'].value_counts())

        summary['STD_EVENTS'] = df_filtered['goalieIdForShot'].value_counts().std()
        summary['STD_SHOT'] = np.std(df_filtered[df_filtered['event'] == 'SHOT']['goalieIdForShot'].value_counts())
        summary['STD_MISS'] = np.std(df_filtered[df_filtered['event'] == 'MISS']['goalieIdForShot'].value_counts())
        summary['STD_GOAL'] = np.std(df_filtered[df_filtered['event'] == 'GOAL']['goalieIdForShot'].value_counts())

        saves_report['summary'] = summary

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
        return saves_report

    def average_shot_report(self, start_year=2022, end_year=2022):
        '''
        DIVIDE DATA BY AREA FOR SHOTS ON GOAL, SAVES AND GOALS
        '''

        query = f"SELECT * FROM shots WHERE season >= {start_year} AND season <= {end_year}"
        df = pd.read_sql_query(query, self.conn)

        shots_report = {}
        shots_df = df[df['event'] != 'MISS'].copy()

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

        return shots_report

    def goal_shot_cords(self, goalieID, start_year=2022, end_year=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted, shooterName, teamCode, season, homePlate, side " \
                f"FROM shots " \
                f"WHERE goalieIdForShot = ? " \
                f"AND event = 'GOAL' " \
                f"AND season >= ?" \
                f"AND season <= ?;"
        df = pd.read_sql_query(query, self.conn, params=(goalieID, start_year, end_year))
        df = df.dropna(how='all', axis=1)
        json_df = df.to_dict(orient='records')
        return json_df

    def all_goal_shot_cords(self, start_year=2022, end_year=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted, shooterName, teamCode, season, homePlate, side " \
                f"FROM shots " \
                f"WHERE event = 'GOAL' " \
                f"AND season >= ?" \
                f"AND season <= ?;"
        df = pd.read_sql_query(query, self.conn, params=(start_year, end_year))
        df = df.dropna(how='all', axis=1)
        json_df = df.to_dict(orient='records')
        return json_df

    def save_shot_cords(self, goalieID, start_year=2022, end_year=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted, shooterName, teamCode, season, homePlate, side " \
                f"FROM shots " \
                f"WHERE goalieIdForShot = ? " \
                f"AND event = 'SHOT' " \
                f"AND season >= ? " \
                f"AND season <= ?;"
        df = pd.read_sql_query(query, self.conn, params=(goalieID, start_year, end_year))
        df = df.dropna(how='all', axis=1)
        json_df = df.to_dict(orient='records')
        return json_df

    def all_save_shot_cords(self, start_year=2022, end_year=2022):
        query = f"SELECT xCordAdjusted, yCordAdjusted, shooterName, teamCode, season, homePlate, side " \
                f"FROM shots " \
                f"WHERE event = 'SHOT' " \
                f"AND season >= ?" \
                f"AND season <= ?;"
        df = pd.read_sql_query(query, self.conn, params=(start_year, end_year))
        df = df.dropna(how='all', axis=1)
        json_df = df.to_dict(orient='records')
        return json_df

    def temp_db_stuff(self):
        hand_dict = {}
        # Read "NHL_shots.csv" into a pandas DataFrame
        df = pd.read_csv("2014-2022.csv")

        df['homePlate'] = df.apply(
            lambda row: 'inside' if self.is_within_house(row['xCordAdjusted'], row['yCordAdjusted']) else 'outside',
            axis=1)

        for team in self.teams:
            url = f"https://api-web.nhle.com/v1/roster/{team}/20242025"
            response = requests.get(url)

            if response.status_code == 200:
                data = response.json()
                goalies = data['goalies']
                for goalie in goalies:
                    hand_dict[goalie['id']] = goalie['shootsCatches']

        df['goalieCatches'] = df['goalieIdForShot'].apply(
            lambda id: 'L' if hand_dict.get(id) == 'L' else 'R'
        )

        df['side'] = df.apply(
            lambda row:
            'Glove' if (row['yCordAdjusted'] > 3 and row['goalieCatches'] == 'R') or
                       (row['yCordAdjusted'] < -3 and row['goalieCatches'] == 'L') else
            ('Stick' if (row['yCordAdjusted'] < -3 and row['goalieCatches'] == 'R') or
                        (row['yCordAdjusted'] > 3 and row['goalieCatches'] == 'L') else
             'Head On'),
            axis=1
        )

        # Drop the "shots" table if it exists
        self.cursor.execute("DROP TABLE IF EXISTS shots")

        # Write the DataFrame to the "shots" table in the SQLite database
        df.to_sql(name='shots', con=self.conn, if_exists='replace', index=False)

        # Create an index on the "season" column
        self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_season ON shots (season)")

        # Commit the transaction to save the changes
        self.conn.commit()
