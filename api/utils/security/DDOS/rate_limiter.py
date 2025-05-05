from flask import request, jsonify, make_response
from functools import wraps
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time
from flask import current_app
import threading
from .cookie_manager import cookie_manager
import logging
import os

# Configuração de logging simplificada
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]  # Log direto no console para debug
)
logger = logging.getLogger(__name__)

class TrustScores:
    HIGH = 0.8
    MEDIUM = 0.5
    LOW = 0.2

class RateLimits:
    HIGH_TRUST = 100
    MEDIUM_TRUST = 50
    LOW_TRUST = 10
    WINDOW = 60

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, Dict[str, List[float]]] = {}
        self.blocked_ips: Dict[str, datetime] = {}
        self.trust_scores: Dict[str, float] = {}
        self._lock = threading.Lock()
        logger.info("Rate Limiter initialized")

    def calculate_trust_score(self, ip: str, client_id: str, is_new_cookie: bool) -> float:
        base_score = self.trust_scores.get(client_id, TrustScores.LOW)
        logger.debug(f"Calculating trust score - IP: {ip}, Client: {client_id}, Is new: {is_new_cookie}")
        
        if is_new_cookie:
            logger.debug(f"New cookie detected, using low trust score for {ip}")
            return TrustScores.LOW
        
        if client_id in self.requests.get(ip, {}):
            base_score += 0.1
            
        final_score = min(base_score, TrustScores.HIGH)
        logger.debug(f"Final trust score for {ip}: {final_score}")
        return final_score

    def get_rate_limit(self, trust_score: float) -> int:
        if trust_score >= TrustScores.HIGH:
            limit = RateLimits.HIGH_TRUST
        elif trust_score >= TrustScores.MEDIUM:
            limit = RateLimits.MEDIUM_TRUST
        else:
            limit = RateLimits.LOW_TRUST
            
        logger.debug(f"Rate limit determined: {limit} for trust score: {trust_score}")
        return limit

    def clean_old_requests(self, ip: str, window: int):
        current_time = time.time()
        with self._lock:
            if ip in self.requests:
                before_count = sum(len(times) for times in self.requests[ip].values())
                
                self.requests[ip] = {
                    client_id: [
                        req_time for req_time in timestamps
                        if current_time - req_time <= window
                    ]
                    for client_id, timestamps in self.requests[ip].items()
                }
                
                after_count = sum(len(times) for times in self.requests[ip].values())
                logger.debug(f"Cleaned requests for {ip}: {before_count} -> {after_count}")

    def check_rate_limit(self, ip: str, client_id: str, max_requests: int, window: int) -> bool:
        current_time = time.time()
        logger.debug(f"Checking rate limit - IP: {ip}, Max: {max_requests}, Window: {window}s")
        
        with self._lock:
            if ip not in self.requests or client_id not in self.requests[ip]:
                logger.debug(f"First request for IP: {ip}")
                return False
            
            # Limpar requisições antigas
            recent_requests = [
                req_time for req_time in self.requests[ip][client_id]
                if (current_time - req_time) <= window
            ]
            
            # Atualizar lista de requisições
            self.requests[ip][client_id] = recent_requests
            
            # Verificar limite
            request_count = len(recent_requests)
            is_exceeded = request_count >= max_requests
            
            logger.debug(f"Requests in window: {request_count}/{max_requests}")
            logger.debug(f"Time window: {window}s")
            logger.debug(f"Rate limit exceeded: {is_exceeded}")
            
            return is_exceeded

    def add_request(self, ip: str, client_id: str):
        current_time = time.time()
        logger.debug(f"Adding request - IP: {ip}, Time: {current_time}")
        
        with self._lock:
            if ip not in self.requests:
                self.requests[ip] = {}
            if client_id not in self.requests[ip]:
                self.requests[ip][client_id] = []
            
            self.requests[ip][client_id].append(current_time)
            logger.debug(f"Total requests for IP {ip}: {len(self.requests[ip][client_id])}")

    def is_ip_blocked(self, ip: str) -> bool:
        with self._lock:
            if ip in self.blocked_ips:
                if datetime.now() >= self.blocked_ips[ip]:
                    logger.info(f"Block expired for IP: {ip}")
                    del self.blocked_ips[ip]
                    return False
                logger.debug(f"IP {ip} is currently blocked")
                return True
            return False

    def block_ip(self, ip: str, duration: int = 300):
        with self._lock:
            block_until = datetime.now() + timedelta(seconds=duration)
            self.blocked_ips[ip] = block_until
            logger.warning(f"IP {ip} blocked until {block_until}")

# Instância global
rate_limiter = RateLimiter()

def ddos_protection(max_requests: int = None, window: int = None, block_duration: int = 300):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr
            logger.debug(f"New request from IP: {ip}")
            
            # Verificar bloqueio primeiro
            if rate_limiter.is_ip_blocked(ip):
                logger.warning(f"IP {ip} is blocked")
                return jsonify({
                    "error": "Too many requests",
                    "message": "Your IP has been temporarily blocked"
                }), 429

            # Validar cookie
            client_id, is_new = cookie_manager.validate_cookie()
            logger.debug(f"Cookie validation - Client ID: {client_id}, Is new: {is_new}")
            
            # Adicionar request antes de verificar
            rate_limiter.add_request(ip, client_id)
            
            # Calcular limites
            trust_score = rate_limiter.calculate_trust_score(ip, client_id, is_new)
            actual_max_requests = max_requests or rate_limiter.get_rate_limit(trust_score)
            actual_window = window or RateLimits.WINDOW
            
            # Verificar limite após adicionar
            if rate_limiter.check_rate_limit(ip, client_id, actual_max_requests, actual_window):
                rate_limiter.block_ip(ip, block_duration)
                logger.warning(f"Rate limit exceeded for IP: {ip}")
                return jsonify({
                    "error": "Too many requests",
                    "message": f"Rate limit exceeded: {actual_max_requests} requests per {actual_window} second(s)"
                }), 429

            try:
                response = f(*args, **kwargs)
                logger.debug(f"Request completed for IP: {ip}")
                return response
            except Exception as e:
                logger.error(f"Error processing request: {str(e)}")
                raise
            
        return wrapper
    return decorator