import json
import socket
import os
from typing import Optional
from datetime import datetime
import services.config_service as config_service

import secrets

class AuthService:
    def __init__(self):
        self.device_tokens_file = os.path.join("data", "device_tokens.json")
        self.hostname = socket.gethostname()
        self.local_ip = socket.gethostbyname(self.hostname)

    def load_device_tokens(self) -> dict:
        try:
            with open(self.device_tokens_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Create default device tokens file if it doesn't exist
            default_tokens = {'tokens': []}
            with open(self.device_tokens_file, 'w', encoding='utf-8') as f:
                json.dump(default_tokens, f, ensure_ascii=False, indent=2)
            return default_tokens

    def save_device_token(self, token: str) -> bool:
        try:
            tokens_data = self.load_device_tokens()
            if token not in [t['token'] for t in tokens_data.get('tokens', [])]:
                tokens_data.setdefault('tokens', []).append({
                    'token': token,
                    'created_at': datetime.now().isoformat()
                })
                with open(self.device_tokens_file, 'w', encoding='utf-8') as f:
                    json.dump(tokens_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error saving device token: {e}")
            return False

    def is_valid_device_token(self, token: str) -> bool:
        tokens_data = self.load_device_tokens()
        return any(t['token'] == token for t in tokens_data.get('tokens', []))

    def generate_device_token(self) -> str:
        return secrets.token_urlsafe(32)

    # --- IP-based methods removed ---

    def check_profile_pin(self, profile_id: int, pin: str) -> bool:
        try:
            from services.data_service import DataService
            data_service = DataService()
            profiles = data_service.load_profiles(with_pin=True)
            
            if 0 <= profile_id < len(profiles):
                profile = profiles[profile_id]
                profile_pin = profile.get('pin', '')
                
                # Convert both to strings for comparison to avoid type issues
                profile_pin_str = str(profile_pin) if profile_pin else ''
                input_pin_str = str(pin) if pin else ''
                
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔧 DEBUG: Comparing profile PIN '{profile_pin_str}' with input PIN '{input_pin_str}'")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔧 DEBUG: Profile PIN type: {type(profile_pin)}, Input PIN type: {type(pin)}")
                
                return profile_pin_str == input_pin_str
            return False
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ ERROR in check_profile_pin: {e}")
            return False
    
    def check_admin_pin(self, pin: str) -> bool:
        try:
            config = config_service.ConfigService().get_config()
            config_pin = config.get('pin', '')
            
            # Convert both to strings for comparison
            config_pin_str = str(config_pin) if config_pin else ''
            input_pin_str = str(pin) if pin else ''
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔧 DEBUG: Comparing admin PIN '{config_pin_str}' with input PIN '{input_pin_str}'")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔧 DEBUG: Config PIN type: {type(config_pin)}, Input PIN type: {type(pin)}")
            
            return config_pin_str == input_pin_str
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ ERROR in check_admin_pin: {e}")
            return False
    
    # --- IP-based methods removed ---