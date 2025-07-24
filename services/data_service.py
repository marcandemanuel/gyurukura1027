import json
import threading
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

class DataService:
    def __init__(self):
        self.lock = threading.Lock()
        self.data_file = 'static/data.json'
        self.options_file = 'static/options.json'
        
        # Ensure directories exist
        os.makedirs('static', exist_ok=True)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📁 DataService initialized with data_file: {self.data_file}")
    
    def _load_profiles_internal(self, with_pin: bool = False) -> List[Dict[str, Any]]:
        """Internal method that doesn't acquire lock - assumes lock is already held"""
        
        try:            
            with open(self.data_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Parse JSON
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔄 Parsing JSON...")
                profiles = json.loads(content)
            
            if not with_pin:
                for i, profile in enumerate(profiles):
                    if 'pin' in profile:
                        profile['hasPin'] = True
                        del profile['pin']
                        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔐 Removed PIN from profile {i}")
            
            return profiles
            
        except json.JSONDecodeError as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ JSON decode error: {e}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📝 File content that failed to parse:")
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📝 Content: {repr(content)}")
            except Exception as read_error:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Could not read file for error display: {read_error}")
            return []
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Unexpected error in _load_profiles_internal: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def load_profiles(self, with_pin: bool = False) -> List[Dict[str, Any]]:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📂 load_profiles called with with_pin={with_pin}")
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 Attempting to acquire lock...")
        
        # Try to acquire lock with timeout
        lock_acquired = self.lock.acquire(timeout=10)  # 10 second timeout
        
        if not lock_acquired:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Failed to acquire lock within 10 seconds - possible deadlock!")
            return []
        
        try:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 Lock acquired successfully")
            return self._load_profiles_internal(with_pin)
        finally:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 Releasing lock...")
            self.lock.release()
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 Lock released")
    
    def load_options(self) -> Dict[str, Any]:
        try:
            with open(self.options_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Create default options file if it doesn't exist
            default_options = {
                "drink": [
                    {"name": "Coca Cola", "amounts": [0.5, 1.0, 1.5, 2.0]},
                    {"name": "Víz", "amounts": [0.5, 1.0, 1.5, 2.0]}
                ],
                "chips": [
                    {"name": "Lay's Classic", "amounts": [50, 100, 150, 200, 250]},
                    {"name": "Pringles Original", "amounts": [50, 100, 150, 200]}
                ]
            }
            with open(self.options_file, 'w', encoding='utf-8') as f:
                json.dump(default_options, f, ensure_ascii=False, indent=2)
            return default_options
    
    def update_profile(self, profile_id: int, profile_data: Dict[str, Any], updateType: str = '') -> bool:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔧 DataService.update_profile called with profile_id={profile_id} (type: {type(profile_id)})")
        
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 update_profile attempting to acquire lock...")
        lock_acquired = self.lock.acquire(timeout=10)  # 10 second timeout
        
        if not lock_acquired:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ update_profile failed to acquire lock within 10 seconds!")
            return False
        
        try:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 update_profile lock acquired")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📂 Loading profiles...")
            profiles = self._load_profiles_internal(with_pin=True)  # Use internal method to avoid deadlock
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📊 Loaded {len(profiles)} profiles")
            
            # Convert profile_id to int if it's a string
            if isinstance(profile_id, str):
                try:
                    profile_id = int(profile_id)
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔄 Converted profile_id to int: {profile_id}")
                except ValueError:
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Invalid profile_id format: {profile_id}")
                    return False
            
            # Find profile by ID (not by index)
            profile_index = None
            for i, profile in enumerate(profiles):
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔍 Checking profile {i}: ID={profile.get('id')} (type: {type(profile.get('id'))})")
                if int(profile.get('id')) == int(profile_id):
                    profile_index = i
                    break
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔍 Looking for profile with ID {profile_id}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📍 Found profile at index: {profile_index}")
            
            if profile_index is None:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Profile with ID {profile_id} not found")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📋 Available profile IDs: {[p.get('id') for p in profiles]}")
                return False
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 💾 Updating profile at index {profile_index}")
            
            # Preserve PIN if it exists and isn't in the new data
            if 'pin' in profiles[profile_index] and 'pin' not in profile_data:
                profile_data['pin'] = profiles[profile_index]['pin']
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔐 Preserved existing PIN")
            
            # Ensure ID is preserved as integer
            profile_data['id'] = profile_id
            profile_data['checked'] = False
            
            # Update the profile
            profiles[profile_index] = profile_data
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ✅ Profile updated in memory")
            
            # Notify admins if nasi changed
            if updateType == 'nasi_changed':
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔔 Nasi changed, notifying admins...")
                for i, profile in enumerate(profiles):
                    if profile.get('admin') and i != profile_index:
                        profiles[i]['notifications'].append([f"{profile_data['user']} megváltoztatta a nasirendjét.", str(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))])
                        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📢 Notified admin: {profile.get('user', 'Unknown')}")
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 💾 Writing to file: {self.data_file}")
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(profiles, f, ensure_ascii=False, indent=2)
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ✅ File written successfully")
            return True
            
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error in update_profile: {e}")
            import traceback
            traceback.print_exc()
            return False
        finally:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 update_profile releasing lock...")
            self.lock.release()
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 update_profile lock released")
    
    def save_all_profiles(self, profiles: List[Dict[str, Any]]) -> bool:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔧 DataService.save_all_profiles called with {len(profiles)} profiles")
        
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 save_all_profiles attempting to acquire lock...")
        lock_acquired = self.lock.acquire(timeout=10)
        
        if not lock_acquired:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ save_all_profiles failed to acquire lock within 10 seconds!")
            return False
        
        try:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 save_all_profiles lock acquired")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 💾 Writing to file: {self.data_file}")
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(profiles, f, ensure_ascii=False, indent=2)
            
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ✅ All profiles saved successfully")
            return True
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error saving profiles: {e}")
            import traceback
            traceback.print_exc()
            return False
        finally:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 save_all_profiles releasing lock...")
            self.lock.release()
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 save_all_profiles lock released")
    
    def mark_profiles_checked(self, profile_ids: List[str]) -> bool:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 mark_profiles_checked attempting to acquire lock...")
        lock_acquired = self.lock.acquire(timeout=10)
        
        if not lock_acquired:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ mark_profiles_checked failed to acquire lock within 10 seconds!")
            return False
        
        try:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔒 mark_profiles_checked lock acquired")
            profiles = self._load_profiles_internal(with_pin=True)  # Use internal method
            
            for profile in profiles:
                if str(profile['id']) in profile_ids:
                    profile['checked'] = True
            
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(profiles, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error marking profiles checked: {e}")
            return False
        finally:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 mark_profiles_checked releasing lock...")
            self.lock.release()
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 🔓 mark_profiles_checked lock released")
