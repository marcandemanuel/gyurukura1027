import json
import socket
import os
from typing import Optional
from datetime import datetime
import services.config_service as config_service

class AuthService:
    def __init__(self):
        self.ips_file = os.environ.get("IPS_PATH")
        self.hostname = socket.gethostname()
        self.local_ip = socket.gethostbyname(self.hostname)
    
    def load_ips(self) -> dict:
        try:
            with open(self.ips_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Create default IPs file if it doesn't exist
            default_ips = {'ips': [], 'home-ip': ''}
            with open(self.ips_file, 'w', encoding='utf-8') as f:
                json.dump(default_ips, f, ensure_ascii=False, indent=2)
            return default_ips
    
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
    
    def is_known_ip(self, ip: str) -> bool:
        print('\n\n\n\n\nCalled isknownip')
        if ip == self.local_ip:
            self.save_ip(ip)
            return True
        
        ips_data = self.load_ips()
        print(f'\n\n\n\n\nips_data: {ips_data}, {ip}, {self.local_ip}')
        return ip in ips_data.get('ips', [])
    
    def save_ip(self, ip: str) -> bool:
        try:
            ips_data = self.load_ips()
            
            if ip == self.local_ip and ips_data.get('home-ip') != self.local_ip:
                ips_data['ips'] = []
                ips_data['home-ip'] = self.local_ip
            
            if ip not in ips_data.get('ips', []):
                ips_data.setdefault('ips', []).append(ip)
            
            with open(self.ips_file, 'w', encoding='utf-8') as f:
                json.dump(ips_data, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error saving IP: {e}")
            return False