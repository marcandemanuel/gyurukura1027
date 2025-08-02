from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import json
from datetime import datetime, timedelta, timezone
from dateutil import parser
import threading
import socket
import os
from services.email_service import EmailService
from services.data_service import DataService
from services.auth_service import AuthService
from services.config_service import ConfigService
import time
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Response, abort
import pytz

hostname = socket.gethostname()
IPAddr = socket.gethostbyname(hostname)

app = Flask(__name__)
CORS(app, origins=[
    "https://www.gyurukura1027.com",
    "https://gyurukura1027.com",
    "http://localhost:2006",
    f"http://{IPAddr}:2006",
    "https://gyurukura1027.onrender.com",
    "https://gyurukura1027-backend.onrender.com"
], supports_credentials=True, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
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


def schedule_emails_from_config(td, emails_config):
    scheduler = BackgroundScheduler()
    send_emails('nv_opened')
    for key, value in emails_config.items():
        try:
            tz = timezone(timedelta(hours=td))
            send_time = parser.isoparse(value)
            current_time = datetime.now(tz)
            print(current_time)
            if send_time > current_time:
                scheduler.add_job(
                    send_emails,
                    'date',
                    run_date=send_time,
                    args=[key],
                    id=f"send_email_{key}",
                    misfire_grace_time=300
                )
                print(f"[{get_time()}] - 🗓️ Scheduled '{key}' email for {send_time}")
        except Exception as e:
            print(f"[{get_time()}] - ⚠️ Could not schedule '{key}': {e}")
    scheduler.start()
    return scheduler


@app.route('/audio/<path:filename>')
def serve_audio(filename):
    audio_dir = os.path.join('public', 'audio')
    file_path = os.path.join(audio_dir, filename)
    if not os.path.exists(file_path):
        return abort(404)

    range_header = request.headers.get('Range', None)
    if not range_header:
        # No Range header, send full file
        return send_from_directory(audio_dir, filename)

    size = os.path.getsize(file_path)
    byte1, byte2 = 0, None

    # Parse Range header: e.g. "bytes=0-1023"
    import re
    m = re.match(r"bytes=(\d+)-(\d*)", range_header)
    if m:
        byte1 = int(m.group(1))
        if m.group(2):
            byte2 = int(m.group(2))
    else:
        # Malformed Range header
        return abort(416)

    if byte2 is not None:
        length = byte2 - byte1 + 1
    else:
        length = size - byte1

    with open(file_path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data, 206, mimetype="audio/mpeg", direct_passthrough=True)
    rv.headers.add('Content-Range', f'bytes {byte1}-{byte1 + length - 1}/{size}')
    rv.headers.add('Accept-Ranges', 'bytes')
    rv.headers.add('Content-Length', str(length))
    return rv

# Serve React app in production
@app.route('/')
def serve_react_app():
    if os.path.exists('build/index.html'):
        return send_from_directory('build', 'index.html')
    elif os.path.exists('dist/index.html'):
        return send_from_directory('dist', 'index.html')
    else:
        return jsonify({
            "message": "Development mode - Frontend running on Vite",
            "frontend_url": f"http://{IPAddr}:2006",
            "backend_url": f"http://{IPAddr}:2020"
        })

@app.route('/<path:path>')
def serve_static_files(path):
    if os.path.exists('build') and path.startswith('assets/'):
        return send_from_directory('build', path)
    elif os.path.exists('dist') and path.startswith('assets/'):
        return send_from_directory('dist', path)
    # Serve static files from public/ (favicon, etc.)
    elif os.path.exists('public') and os.path.exists(os.path.join('public', path)):
        return send_from_directory('public', path)
    # For all other routes (SPA), serve index.html
    elif os.path.exists('build/index.html'):
        return send_from_directory('build', 'index.html')
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

        print(f"Type ------ {updateType}, {success}")
        
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

# Device token authentication endpoints

from flask import make_response

@app.route('/api/auth/check-device-token', methods=['GET'])
def check_device_token():
    try:
        token = request.cookies.get('device_token')
        print(f"[{get_time()}] - 🔑 Checking device token: {token}")
        is_valid = False
        if token:
            is_valid = auth_service.is_valid_device_token(token)
        return jsonify({'valid': is_valid})
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in check_device_token: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/register-device-token', methods=['POST'])
def register_device_token():
    try:
        # This endpoint should be called after successful PIN entry
        token = auth_service.generate_device_token()
        auth_service.save_device_token(token)
        resp = make_response(jsonify({'success': True, 'token': token}))
        # Set as secure, HttpOnly cookie (adjust domain/path as needed)
        resp.set_cookie(
            'device_token',
            token,
            max_age=60*60*24*365,  # 1 year
            httponly=True,
            secure=True,
            samesite='Lax'
        )
        print(f"[{get_time()}] - 🆕 Device token issued and stored.")
        return resp
    except Exception as e:
        print(f"[{get_time()}] - ❌ Error in register_device_token: {e}")
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


config = config_service.get_config()

emails_config = config['emails']
td = int(config['timezone'])
schedule_emails_from_config(td, emails_config)

if __name__ == "__main__":
    print(f"[{get_time()}] - 🎬 GyűrűkUra 10-27 Backend Server")
    print(f"[{get_time()}] - 🔗 API endpoints available at: http://{IPAddr}:2020/api/")
    print(f"[{get_time()}] - 📊 Health check: http://{IPAddr}:2020/api/health")
    print(f"[{get_time()}] - 🎯 Frontend should connect to: http://{IPAddr}:2006")
    print(f"\n\n{'='*20} Console {'='*20}\n\n")


    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
