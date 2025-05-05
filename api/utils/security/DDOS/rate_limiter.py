from flask import request, jsonify, make_response
from functools import wraps
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time
from flask import current_app
import threading
from .cookie_manager import cookie_manager, TrustScores, RateLimits

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, Dict[str, List[float]]] = {}  # ip -> {client_id -> [timestamps]}
        self.blocked_ips: Dict[str, datetime] = {}
        self.trust_scores: Dict[str, float] = {}
        self._lock = threading.Lock()

    def calculate_trust_score(self, ip: str, client_id: str, is_new_cookie: bool) -> float:
        """Calculate trust score based on IP and cookie history"""
        base_score = self.trust_scores.get(client_id, TrustScores.LOW)
        
        if is_new_cookie:
            return TrustScores.LOW
        
        # Increase score based on history
        if client_id in self.requests.get(ip, {}):
            base_score += 0.1
        
        return min(base_score, TrustScores.HIGH)

    def get_rate_limit(self, trust_score: float) -> int:
        """Get rate limit based on trust score"""
        if trust_score >= TrustScores.HIGH:
            return RateLimits.HIGH_TRUST
        elif trust_score >= TrustScores.MEDIUM:
            return RateLimits.MEDIUM_TRUST
        return RateLimits.LOW_TRUST

    def clean_old_requests(self, ip: str, window: int):
        """Remove requests older than the window"""
        current_time = time.time()
        with self._lock:
            if ip in self.requests:
                self.requests[ip] = [
                    req_time for req_time in self.requests[ip]
                    if current_time - req_time <= window
                ]

    def is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked"""
        with self._lock:
            if ip in self.blocked_ips:
                if datetime.now() >= self.blocked_ips[ip]:
                    del self.blocked_ips[ip]
                    return False
                return True
            return False

    def block_ip(self, ip: str, duration: int = 300):
        """Block IP for specified duration (default 5 minutes)"""
        with self._lock:
            self.blocked_ips[ip] = datetime.now() + timedelta(seconds=duration)
            current_app.logger.warning(f"IP {ip} blocked for {duration} seconds due to rate limit violation")

    def add_request(self, ip: str, client_id: str):
        """Add new request for IP"""
        current_time = time.time()
        with self._lock:
            if ip not in self.requests:
                self.requests[ip] = {}
            if client_id not in self.requests[ip]:
                self.requests[ip][client_id] = []
            self.requests[ip][client_id].append(current_time)

    def check_rate_limit(self, ip: str, client_id: str, max_requests: int, window: int = 1) -> bool:
        """Check if IP has exceeded rate limit"""
        self.clean_old_requests(ip, window)
        with self._lock:
            return ip in self.requests and client_id in self.requests[ip] and len(self.requests[ip][client_id]) > max_requests

# Global rate limiter instance
rate_limiter = RateLimiter()

def ddos_protection(max_requests: int = None, window: int = None, block_duration: int = 300):
    """
    Decorator for DDoS protection
    
    Args:
        max_requests (int): Maximum number of requests allowed per window
        window (int): Time window in seconds (default 1 second)
        block_duration (int): How long to block violating IPs in seconds (default 300 seconds / 5 minutes)
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr
            client_id, is_new = cookie_manager.validate_cookie()
            
            if rate_limiter.is_ip_blocked(ip):
                return jsonify({
                    "error": "Too many requests",
                    "message": "Your IP has been temporarily blocked"
                }), 429

            trust_score = rate_limiter.calculate_trust_score(ip, client_id, is_new)
            actual_max_requests = max_requests or rate_limiter.get_rate_limit(trust_score)
            actual_window = window or RateLimits.WINDOW

            response = make_response()
            if is_new:
                client_id = cookie_manager.create_cookie(response)

            rate_limiter.add_request(ip, client_id)
            if rate_limiter.check_rate_limit(ip, client_id, actual_max_requests, actual_window):
                rate_limiter.block_ip(ip, block_duration)
                return jsonify({
                    "error": "Too many requests",
                    "message": f"Rate limit exceeded"
                }), 429

            return response
        return wrapper
    return decorator