import os
from flask import abort

def database_uri():
    required_vars = ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", 
                     "MYSQL_USER", "MYSQL_PASSWORD"]
    
    # Verificar se todas as variáveis necessárias estão definidas
    for var in required_vars:
        if not os.getenv(var):
            raise ValueError(f"Missing required environment variable: {var}")
            
    db_host = os.getenv("MYSQL_HOST")
    db_port = os.getenv("MYSQL_PORT")
    db_database = os.getenv("MYSQL_DATABASE")
    db_username = os.getenv("MYSQL_USER")
    db_password = os.getenv("MYSQL_PASSWORD")

    return f'mysql+mysqlconnector://{db_username}:{db_password}@{db_host}:{db_port}/{db_database}'