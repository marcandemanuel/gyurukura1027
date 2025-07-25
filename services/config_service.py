import json

class ConfigService:
    def __init__(self):
        self.config = self.load_config()
    
    def load_config(self) -> dict:
        import os
        config_path = os.environ.get("CONFIG_PATH", "config.json")
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
        
    def get_config(self):
        return self.load_config()