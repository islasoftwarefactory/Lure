import os
from dotenv import load_dotenv


load_dotenv()

def database_uri():
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_database = os.getenv("DB_DATABASE")
    db_username = os.getenv("DB_USERNAME")
    db_password = os.getenv("DB_PASSWORD")

    return f'mysql+mysqlconnector://{db_username}:{db_password}@{db_host}:{db_port}/{db_database}'