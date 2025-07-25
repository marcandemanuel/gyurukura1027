from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import json
from datetime import datetime, timedelta
from dateutil import parser
import threading
import socket
import os
from services.email_service import EmailService
from services.data_service import DataService
from services.auth_service import AuthService
from services.config_service import ConfigService
import time

hostname = socket.gethostname()
IPAddr = socket.gethostbyname(hostname)

app = Flask(__name__)
CORS(app, origins=[
    "https://gyurukura1027.com",
    "http://localhost:2006",
    f"http://{IPAddr}:2006",
    "https://gyurukura1027.onrender.com"
])
app.config["STATIC_FOLDER"] = "static"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["PREFERRED_URL_SCHEME"] = "https"

# Services
email_service = EmailService()
data_service = DataService()
auth_service = AuthService()
config_service = ConfigService()

def get_time():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print(f"[{get_time()}] - 🚀 Flask Backend starting...")
print(f"[{get_time()}] - 📍 Local IP: {IPAddr}")
print(f"[{get_time()}] - 🌐 Backend will be available at:")
print(f"{len(f'[{get_time()}] - ')*' '}   - http://localhost:2020")
print(f"{len(f'[{get_time()}] - ')*' '}   - http://{IPAddr}:2020")

EMAILS = {"nv_opened": email_service.send_nv_opened_email, "nv_closes": email_service.send_nv_closes_email, "starts_today": email_service.send_starts_today_email, "started": email_service.send_started_email, "ends_today": email_service.send_ends_today_email, "birthday": email_service.send_happy_birthday_email}
NOTIFICATIONS = {"nv_opened": "Elkezdődött a nasirendelés 🎉!", "nv_closes": "Holnap ér véget a nasirendelés.", "starts_today": "Ma kezdődik a GyűrűkUra 10-27 🎉!", "started": "Kezdődik a GyűrűkUra 10-27 🎉!", "ends_today": "Ma van a finálé 🎉!", "birthday": "Boldog szülinapot Sebi 🎂!"}

def load_emails(emails_file) -> dict:
    with open(emails_file, 'r', encoding='utf-8') as f:
        return json.load(f)
    
def update_emails(emails_file, to_be_updated):
    with open(emails_file, 'r+', encoding='utf-8') as f:
        emails = json.load(f)
        emails[to_be_updated] = True
        f.seek(0)
        json.dump(emails, f, ensure_ascii=False, indent=2)
        f.truncate()
    
def call_at_datetime(dt, template):
    print(f"[{get_time()}] - 🕖 {template} email sending will be called at {dt}...")
    def wait_and_call():
        while True:
            now = datetime.now(dt.tzinfo)
            diff = (dt - now).total_seconds()
            if diff <= 0:
                break

            time.sleep(min(diff, 1))
        send_emails(template)
        print(f"[{get_time()}] - 📧 {template} emails sent.")
        print(f"[{get_time()}] - 🔃 Updating emails.json...")
        update_emails('emails.json', f"{template}_sent")
        print(f"[{get_time()}] - 🔃 emails.json updated.")
    threading.Thread(target=wait_and_call, daemon=True).start()


def send_emails(template):
    if template not in EMAILS.keys():
        return
    
    profiles = data_service.load_profiles(True)
    email_function = EMAILS[template]

    print(f"[{get_time()}] - 📧 Sending {template} emails...")
    for profile in profiles:
        email_function(profile["email"], profile["user"], app, "https://www.gyurukura1027.com")

        profile['notifications'].append([NOTIFICATIONS[template], get_time()])

        if profile['admin'] == True:
            profile['notifications'].append([f'{template} emailek elküldve.', get_time()])
        
        data_service.update_profile(profile['id'], profile, False)

    
def is_send_emails(config):
    nv_opened = config.get("nv_opened")
    nv_opened_sent = config.get("nv_opened_sent")
    if nv_opened and nv_opened_sent == False:
        nv_opened = parser.isoparse(nv_opened)
        now = datetime.now(nv_opened.tzinfo)
        today = now.date()
        nv_date = nv_opened.date()
        if nv_date == today:
            call_at_datetime(nv_opened, "nv_opened")

    nv_closes = config.get("nv_closes")
    nv_closes_sent = config.get("nv_closes_sent")
    if nv_closes and nv_closes_sent == False:
        nv_closes = parser.isoparse(nv_closes)
        now = datetime.now(nv_closes.tzinfo)
        today = now.date()
        nv_date = nv_closes.date()
        if nv_date == today:
            call_at_datetime(nv_closes, "nv_closes")
            
    starts_today = config.get("starts_today")
    starts_today_sent = config.get("starts_today_sent")
    if starts_today and starts_today_sent == False:
        starts_today = parser.isoparse(starts_today)
        now = datetime.now(starts_today.tzinfo)
        today = now.date()
        gyu_date = starts_today.date()
        if gyu_date == today:
            call_at_datetime(starts_today, "starts_today")
            
    started = config.get("started")
    started_sent = config.get("started_sent")
    if started and started_sent == False:
        started = parser.isoparse(started)
        now = datetime.now(started.tzinfo)
        today = now.date()
        started_date = started.date()
        if started_date == today:
            call_at_datetime(started, "started")
            
    ends_today = config.get("ends_today")
    ends_today_sent = config.get("ends_today_sent")
    if ends_today and ends_today_sent == False:
        ends_today = parser.isoparse(ends_today)
        now = datetime.now(ends_today.tzinfo)
        today = now.date()
        ends_date = ends_today.date()
        if ends_date == today:
            call_at_datetime(ends_today, "ends_today")

    birthday = config.get("birthday")
    birthday_sent = config.get("birthday_sent")
    if birthday and birthday_sent == False:
        birthday = parser.isoparse(birthday)
        now = datetime.now(birthday.tzinfo)
        today = now.date()
        birthday_date = birthday.date()
        if birthday_date == today:
            call_at_datetime(birthday, "birthday")


# Serve React app in production
@app.route('/')
def serve_react_app():
    if os.path.exists('dist/index.html'):
        return send_from_directory('dist', 'index.html')
    else:
        return jsonify({
            "message": "Development mode - Frontend running on Vite",
            "frontend_url": f"http://{IPAddr}:2006",
            "backend_url": f"http://{IPAddr}:2020"
        })

@app.route('/<path:path>')
def serve_static_files(path):
    if os.path.exists('dist') and path.startswith('assets/'):
        return send_from_directory('dist', path)
    elif os.path.exists('dist/index.html'):
        return send_from_directory('dist', 'index.html')
    else:
        return jsonify({"error": "File not found", "path": path}), 404

# API Routes

@app.route('/api/config', methods=['GET'])
def get_config():
    config = config_service.get_config()

    keys = ["count_down_title", "start_time", "birthday_on_movie_id", "year", "about", "about_current_text", "emails"]
    filtered = {k: config[k] for k in keys if k in config}
    return jsonify(filtered)

@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    with_pin = request.args.get('with_pin', 'false').lower() == 'true'
    profiles = data_service.load_profiles(with_pin)
    return jsonify({'profiles': profiles})

@app.route('/api/options', methods=['GET'])
def get_options():
    options = data_service.load_options()
    return jsonify({'options': options})

@app.route('/api/profiles/<int:profile_id>', methods=['PUT'])
def update_profile(profile_id):
    print(f"[{get_time()}] - 🔄 PUT /api/profiles/{profile_id} called")
    try:
        data = request.get_json()
        print(f"[{get_time()}] - 📝 Request data keys: {list(data.keys()) if data else 'None'}")
        
        if not data:
            print(f"[{get_time()}] - ❌ No data provided")
            return jsonify({'error': 'No data provided'}), 400
        
        profile_data = data.get('profile')
        updateType = data.get('updateType')
        
        print(f"[{get_time()}] - 👤 Profile data received: {bool(profile_data)}")
        print(f"[{get_time()}] - 🔔 UpdateType: {updateType}")
        print(f"[{get_time()}] - 🆔 Profile ID from URL: {profile_id} (type: {type(profile_id)})")
        
        if not profile_data:
            print(f"[{get_time()}] - ❌ No profile data provided")
            return jsonify({'error': 'No profile data provided'}), 400
        
        print(f"[{get_time()}] - 🚀 Calling data_service.update_profile...")
        success = data_service.update_profile(profile_id, profile_data, updateType)
        print(f"[{get_time()}] - ✅ Update result: {success}")
        
        if success and updateType == 'nasi_changed':
            print(f"[{get_time()}] - 📧 Sending notification to admin...")
            email_service.send_notification_to_admin('', profile_data['user'], app, "https://www.gyurukura1027.com")
            email_service.send_thankyou_email(profile_data['email'], profile_data['user'], app, "https://www.gyurukura1027.com")
        elif success and updateType == 'status_changed':  
            email_service.send_changed_email(profile_data['email'], profile_data['user'], app, "https://www.gyurukura1027.com")
            completed = True
            
            for key, value in profile_data.items():
                if key.startswith('acday'):
                    if value[0] != 'Teljesítve' or value[1] != 'Teljesítve':
                        completed = False

            if completed == True:
                email_service.send_nr_completed_email(profile_data['email'], profile_data['user'], app, "https://www.gyurukura1027.com")
                profile_data['notifications'].append(['Nasirendje teljesítve 🎉!', get_time()])
        elif success and updateType == 'notify_user':            
            success = email_service.send_notification_email(profile_data['email'], profile_data['user'], app, "https://www.gyurukura1027.com")
        elif success and updateType == 'pin_changed':
            success = email_service.send_pin_changed_email(profile_data['email'], profile_data['user'], app, "https://www.gyurukura1027.com")
        elif success and updateType == 'pin_created':
            success = email_service.send_pin_created_email(profile_data['email'], profile_data['user'], app, "https://www.gyurukura1027.com")

        return jsonify({'success': success})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in update_profile route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/profiles', methods=['PUT'])
def save_all_profiles():
    print(f"[{get_time()}] - 🔄 PUT /api/profiles called")
    try:
        data = request.get_json()
        print(f"[{get_time()}] - 📝 Request data: {bool(data)}")
        
        if not data or 'profiles' not in data:
            return jsonify({'error': 'No profiles data provided'}), 400
        
        for profile in data['profiles']:
            if 'pin_changed' in profile['sendEmails']:
                print(f"[{get_time()}] - 📧 Sending PIN changed email for profile {profile['id']}")
                try:
                    email_result = email_service.send_admin_changed_pin_email(profile['email'], profile['user'], app, "https://www.gyurukura1027.com")
                    print(f"[{get_time()}] - 📧 Email result: {email_result}")
                except Exception as email_error:
                    print(f"[{get_time()}] - ❌ Email error: {email_error}")

            if 'name_changed' in profile['sendEmails']:
                print(f"[{get_time()}] - 📧 Sending name changed email for profile {profile['id']}")
                try:
                    email_result = email_service.send_admin_changed_name_email(profile['email'], profile['user'], app, "https://www.gyurukura1027.com")
                    print(f"[{get_time()}] - 📧 Email result: {email_result}")
                except Exception as email_error:
                    print(f"[{get_time()}] - ❌ Email error: {email_error}")

            if 'seat_changed' in profile['sendEmails']:
                print(f"[{get_time()}] - 📧 Sending seat changed email for profile {profile['id']}")
                try:
                    email_result = email_service.send_admin_changed_seat_email(profile['email'], profile['user'], app, "https://www.gyurukura1027.com")
                    print(f"[{get_time()}] - 📧 Email result: {email_result}")
                except Exception as email_error:
                    print(f"[{get_time()}] - ❌ Email error: {email_error}")

            if 'seat_created' in profile['sendEmails']:
                print(f"[{get_time()}] - 📧 Sending seat created email for profile {profile['id']}")
                try:
                    email_result = email_service.send_admin_created_seat_email(profile['email'], profile['user'], app, "https://www.gyurukura1027.com")
                    print(f"[{get_time()}] - 📧 Email result: {email_result}")
                except Exception as email_error:
                    print(f"[{get_time()}] - ❌ Email error: {email_error}")

            profile['sendEmails'] = []
        
        success = data_service.save_all_profiles(data['profiles'])
        print(f"[{get_time()}] - ✅ Save all result: {success}")
        
        return jsonify({'success': success})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in save_all_profiles: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/check-pin', methods=['POST'])
def check_pin():
    try:
        data = request.get_json()
        profile_id = data.get('profile_id')
        pin = data.get('pin')
        
        print(f"[{get_time()}] - 🔐 Checking PIN for profile {profile_id}")
        
        is_valid = auth_service.check_profile_pin(profile_id, pin)
        return jsonify({'valid': is_valid})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in check_pin: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/check-admin-pin', methods=['POST'])
def check_admin_pin():
    try:
        data = request.get_json()
        pin = data.get('pin')
        
        print(f"[{get_time()}] - 🔐 Checking admin PIN")
        
        is_valid = auth_service.check_admin_pin(pin)
        return jsonify({'valid': is_valid})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in check_admin_pin: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/check-ip', methods=['GET'])
def check_ip():
    try:
        ip = request.remote_addr
        print(f"[{get_time()}] - 🌐 Checking IP: {ip}")
        
        is_known = auth_service.is_known_ip(ip)
        return jsonify({'known': is_known})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in check_ip: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/save-ip', methods=['POST'])
def save_ip():
    try:
        ip = request.remote_addr
        print(f"[{get_time()}] - 💾 Saving IP: {ip}")
        
        auth_service.save_ip(ip)
        return jsonify({'success': True})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in save_ip: {e}")
        return jsonify({'error': str(e)}), 500

# Email routes (for future use)
@app.route('/api/email/accept', methods=['POST'])
def send_acceptance_emails():
    try:
        data = request.get_json()
        ids = data.get('ids', [])
        message = data.get('message', '')
        
        success = email_service.send_acceptance_emails(ids, message)
        return jsonify({'success': success})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in send_acceptance_emails: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/email/decline', methods=['POST'])
def send_decline_emails():
    try:
        data = request.get_json()
        ids = data.get('ids', [])
        message = data.get('message', '')
        
        success = email_service.send_decline_emails(ids, message)
        return jsonify({'success': success})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in send_decline_emails: {e}")
        return jsonify({'error': str(e)}), 500

# File upload endpoint
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    return jsonify({'filename': file.filename})

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'backend_ip': IPAddr,
        'backend_port': 2020,
        'frontend_url': f"http://{IPAddr}:2006"
    })

if __name__ == "__main__":
    print(f"[{get_time()}] - 🎬 GyűrűkUra 10-27 Backend Server")
    print(f"[{get_time()}] - 🔗 API endpoints available at: http://{IPAddr}:2020/api/")
    print(f"[{get_time()}] - 📊 Health check: http://{IPAddr}:2020/api/health")
    print(f"[{get_time()}] - 🎯 Frontend should connect to: http://{IPAddr}:2006")
    print(f"\n\n{'='*20} Console {'='*20}\n\n")

    is_send_emails(config_service.get_config()['emails'])
    
    app.run(debug=True, host='0.0.0.0', port=2020)
