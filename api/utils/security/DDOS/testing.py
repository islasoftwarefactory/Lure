from dotenv import load_dotenv
import os
load_dotenv()


SECRET_KEY = os.getenv('COOKIE_SECRET_KEY')
print(f"SECRET_KEY: {SECRET_KEY}")