import json

class ConfigService:
    def __init__(self):
        self.config = self.load_config()
    
    def load_config(self) -> dict:
        with open('config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
        
    def get_config(self):
        return self.load_config()