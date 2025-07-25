import json
import os

class ConfigService:
    def __init__(self):
        self.config = self.load_config()
    
    def load_config(self) -> dict:
        config_path = os.environ.get("CONFIG_PATH")
        print(config_path)
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
        
    def get_config(self):
        return self.load_config()