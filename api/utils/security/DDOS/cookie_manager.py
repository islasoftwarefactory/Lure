from flask import request, make_response
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import hashlib
import hmac  # Adicionando import necessário
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
    #SECRET_KEY = os.getenv('COOKIE_SECRET_KEY')
    #NAME = os.getenv('COOKIE_NAME')
    #EXPIRATION_DAYS = os.getenv('COOKIE_EXPIRATION_DAYS')
    #DOMAIN = os.getenv('COOKIE_DOMAIN')
    #PATH = os.getenv('COOKIE_PATH')
    #SECURE = os.getenv('COOKIE_SECURE')
    #HTTPONLY = os.getenv('COOKIE_HTTPONLY')
    #SAMESITE = os.getenv('COOKIE_SAMESITE')

    SECRET_KEY = "a45390548021d9dbf5e6eec82f859e514f015bcd23f184f0cc5eb367859984cd"
    NAME = "lure_client_id"
    EXPIRATION_DAYS = 30
    DOMAIN = "localhost"
    PATH="/"
    SECURE=True
    HTTPONLY=True
    SAMESITE="Strict"

class TrustScores:
    #HIGH = os.getenv('TRUST_SCORE_HIGH')
    #MEDIUM = os.getenv('TRUST_SCORE_MEDIUM')
    #LOW = os.getenv('TRUST_SCORE_LOW')

    TRUST_SCORE_HIGH=0.8
    TRUST_SCORE_MEDIUM=0.5
    TRUST_SCORE_LOW=0.2

class RateLimits:
    #HIGH_TRUST = os.getenv('RATE_LIMIT_HIGH_TRUST')
    #MEDIUM_TRUST = os.getenv('RATE_LIMIT_MEDIUM_TRUST')
    #LOW_TRUST = os.getenv('RATE_LIMIT_LOW_TRUST')
    #WINDOW = os.getenv('RATE_LIMIT_WINDOW')

    HIGH_TRUST=100 
    MEDIUM_TRUST=50
    LOW_TRUST=10
    WINDOW=60

class CookieManager:
    def __init__(self):
        logger.info("Initializing CookieManager")
        logger.debug(f"Using cookie name: {CookieConfig.NAME}")
        logger.debug(f"Domain: {CookieConfig.DOMAIN}")
        
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
        """Verify cookie signature using hmac"""
        expected_signature = self._generate_signature(client_id, timestamp)
        return hmac.compare_digest(signature.encode(), expected_signature.encode())

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
        
        logger.debug(f"Creating cookie for client_id: {client_id}")
        
        response.set_cookie(
            CookieConfig.NAME,
            json.dumps(cookie_data),
            max_age=CookieConfig.EXPIRATION_DAYS * 24 * 60 * 60,
            domain=CookieConfig.DOMAIN,
            path=CookieConfig.PATH,
            secure=CookieConfig.SECURE,
            httponly=CookieConfig.HTTPONLY,
            samesite=CookieConfig.SAMESITE
        )
        
        logger.debug("Cookie created successfully")
        return client_id

    def validate_cookie(self) -> Tuple[Optional[str], bool]:
        """Validate cookie and return client_id if valid"""
        try:
            cookie = request.cookies.get(CookieConfig.NAME)
            logger.debug(f"Validating cookie: {cookie}")
            
            if not cookie:
                logger.debug("No cookie found")
                return None, True

            cookie_data = json.loads(cookie)
            client_id = cookie_data['id']
            timestamp = cookie_data['ts']
            signature = cookie_data['sig']

            if self._verify_signature(client_id, timestamp, signature):
                logger.debug(f"Cookie validated successfully for client_id: {client_id}")
                return client_id, False
            
            logger.warning(f"Invalid cookie signature for client_id: {client_id}")
            return None, True
            
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Error validating cookie: {str(e)}")
            return None, True

# Global instance
logger.info("Creating global CookieManager instance")
try:
    cookie_manager = CookieManager()
    logger.info("CookieManager global instance created successfully")
except Exception as e:
    logger.error(f"Failed to create CookieManager instance: {str(e)}")
    raise