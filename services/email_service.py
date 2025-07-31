import os
import requests
from typing import List, Dict, Any
import json
from datetime import datetime
import services.config_service as config_service

class EmailService:
    def __init__(self):
        self.config = config_service.ConfigService().get_config()
        self.FROM_EMAIL = "nasivalaszto@gyurukura1027.com"
        self.FROM_NAME = "GyűrűkUra 10-27"
        self.MAILERSEND_API_KEY = os.environ.get("MAILERSEND_API_KEY")

    def send_email(self, receiver_email, subject, name, template, app, url="https://www.gyurukura1027.com"):
        try:
            with app.app_context():
                print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] - 📄 Reading template...')
                jinja_template = app.jinja_env.get_template(f'/emails/{template}.html')
                print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] - 📄 Template read')
                email_content = jinja_template.render({'name': name, 'subject': subject, 'url': url, 'count_down_title': self.config.get('count_down_title')})

            payload = {
                "from": {
                    "email": self.FROM_EMAIL,
                    "name": self.FROM_NAME
                },
                "to": [
                    {
                        "email": receiver_email,
                        "name": name
                    }
                ],
                "subject": subject,
                "html": email_content
            }

            headers = {
                "Authorization": f"Bearer {self.MAILERSEND_API_KEY}",
                "Content-Type": "application/json"
            }

            response = requests.post("https://api.mailersend.com/v1/email", headers=headers, data=json.dumps(payload))
            if response.status_code == 202:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📧 Email sikeresen elküldve MailerSend-del!")
                return True
            else:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ MailerSend error: {response.status_code} {response.text}")
                return False
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error az email küldése közben: {e}")
            return False
    
    def send_changed_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Rendelésének állapota módosult'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'changed_wb', app, url)

        return success
    
    def send_notification_to_admin(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = self.config.get('admin_main_email', '')
        SUBJECT = 'Nasiválasztó'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'changed', app, url)

        return success

    def send_thankyou_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Köszönjük a megrendelését 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'thankyou', app, url)

        return success
    
    def send_nv_opened_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Elkezdődött a nasirendelés 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'nv_opened', app, url)

        return success
    
    def send_nv_closes_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Holnap ér véget a nasirendelés'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'nv_closes', app, url)

        return success
    
    def send_notification_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Töltse ki a nasirendjét'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'notification', app, url)

        return success
    
    def send_starts_today_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Ma kezdődik a GyűrűkUra 10-27 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'ends_today', app, url)

        return success
    
    def send_started_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Kezdődik a GyűrűkUra 10-27 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'started', app, url)

        return success
    
    def send_ends_today_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Ma van a finálé 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'starts_today', app, url)

        return success
    
    def send_happy_birthday_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Boldog szülinapot Sebi 🎂!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'birthday', app, url)

        return success
    
    def send_admin_changed_pin_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Az admin módosította az Ön PIN-kódját'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'admin_changed_pin', app, url)

        return success
    
    def send_admin_changed_name_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Az admin módosította az Ön nevét'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'admin_changed_name', app, url)

        return success
    
    def send_admin_changed_seat_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = "Az admin módosította az Ön ülőhelyét"
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'admin_changed_seat', app, url)

        return success
    
    def send_admin_created_seat_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = "Az admin feltöltötte az Ön ülőhelyét 🎉!"
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'admin_created_seat', app, url)

        return success
    
    def send_pin_changed_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'PIN módosítva'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'pin_changed', app, url)

        return success
    
    def send_pin_created_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'PIN létrehozva 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'pin_created', app, url)

        return success
    
    def send_nr_completed_email(self, email, name, app, url="https://www.gyurukura1027.com"):
        TO = email
        SUBJECT = 'Nasirendje teljesítve 🎉!'
        NAME = name
        success = self.send_email(TO, SUBJECT, NAME, 'nr_completed', app, url)

        return success