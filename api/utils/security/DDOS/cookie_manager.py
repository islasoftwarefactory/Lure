from flask import request
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import hashlib
import json
from typing import Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded")

class CookieConfig:
    SECRET_KEY = os.getenv('COOKIE_SECRET_KEY')
    NAME = os.getenv('COOKIE_NAME')
    EXPIRATION_DAYS = os.getenv('COOKIE_EXPIRATION_DAYS')
    DOMAIN = os.getenv('COOKIE_DOMAIN')
    PATH = os.getenv('COOKIE_PATH')
    SECURE = os.getenv('COOKIE_SECURE')
    HTTPONLY = os.getenv('COOKIE_HTTPONLY')
    SAMESITE = os.getenv('COOKIE_SAMESITE')

    @classmethod
    def log_config(cls):
        """Log all configuration values"""
        logger.debug("Cookie Configuration:")
        logger.debug(f"SECRET_KEY exists: {bool(cls.SECRET_KEY)}")
        logger.debug(f"NAME: {cls.NAME}")
        logger.debug(f"EXPIRATION_DAYS: {cls.EXPIRATION_DAYS}")
        logger.debug(f"DOMAIN: {cls.DOMAIN}")
        logger.debug(f"PATH: {cls.PATH}")
        logger.debug(f"SECURE: {cls.SECURE}")
        logger.debug(f"HTTPONLY: {cls.HTTPONLY}")
        logger.debug(f"SAMESITE: {cls.SAMESITE}")

class TrustScores:
    HIGH = os.getenv('TRUST_SCORE_HIGH')
    MEDIUM = os.getenv('TRUST_SCORE_MEDIUM')
    LOW = os.getenv('TRUST_SCORE_LOW')

class RateLimits:
    HIGH_TRUST = os.getenv('RATE_LIMIT_HIGH_TRUST')
    MEDIUM_TRUST = os.getenv('RATE_LIMIT_MEDIUM_TRUST')
    LOW_TRUST = os.getenv('RATE_LIMIT_LOW_TRUST')
    WINDOW = os.getenv('RATE_LIMIT_WINDOW')

class CookieManager:
    def __init__(self):
        logger.info("Initializing CookieManager")
        
        # Log all environment variables
        CookieConfig.log_config()
        
        if not CookieConfig.SECRET_KEY:
            logger.error("COOKIE_SECRET_KEY is not set in environment variables")
            raise ValueError("COOKIE_SECRET_KEY must be set in environment variables")
        
        logger.info("CookieManager initialized successfully")

    def _generate_signature(self, client_id: str, timestamp: str) -> str:
        """Generate HMAC signature for cookie data"""
        message = f"{client_id}:{timestamp}"
        return hashlib.sha256(
            f"{message}:{CookieConfig.SECRET_KEY}".encode()
        ).hexdigest()

    def _verify_signature(self, client_id: str, timestamp: str, signature: str) -> bool:
        """Verify cookie signature"""
        expected_signature = self._generate_signature(client_id, timestamp)
        return hmac.compare_digest(signature, expected_signature)

    def create_cookie(self, response, client_id: str = None) -> str:
        """Create a new secure cookie with client_id"""
        if not client_id:
            client_id = str(uuid.uuid4())
        
        timestamp = datetime.utcnow().isoformat()
        signature = self._generate_signature(client_id, timestamp)
        
        cookie_data = {
            'id': client_id,
            'ts': timestamp,
            'sig': signature
        }
        
        response.set_cookie(
            CookieConfig.NAME,
            json.dumps(cookie_data),
            max_age=timedelta(days=CookieConfig.EXPIRATION_DAYS).total_seconds(),
            domain=CookieConfig.DOMAIN,
            path=CookieConfig.PATH,
            secure=CookieConfig.SECURE,
            httponly=CookieConfig.HTTPONLY,
            samesite=CookieConfig.SAMESITE
        )
        
        return client_id

    def validate_cookie(self) -> Tuple[Optional[str], bool]:
        """
        Validate cookie and return client_id if valid
        Returns: (client_id, is_new)
        """
        try:
            cookie = request.cookies.get(CookieConfig.NAME)
            if not cookie:
                return None, True

            cookie_data = json.loads(cookie)
            client_id = cookie_data['id']
            timestamp = cookie_data['ts']
            signature = cookie_data['sig']

            if self._verify_signature(client_id, timestamp, signature):
                return client_id, False
            
            return None, True
            
        except (json.JSONDecodeError, KeyError):
            return None, True

# Global instance
logger.info("Creating global CookieManager instance")
try:
    cookie_manager = CookieManager()
    logger.info("CookieManager global instance created successfully")
except Exception as e:
    logger.error(f"Failed to create CookieManager instance: {str(e)}")
    raise