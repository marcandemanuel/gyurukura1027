import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from email.mime.image import MIMEImage
from typing import List, Dict, Any
import json
from datetime import datetime
import services.config_service as config_service
import os
import ssl

class EmailService:
    def __init__(self):
        self.config = config_service.ConfigService().get_config()
        self.USERNAME = os.environ.get("SMTP_USERNAME")
        self.PASSWORD = os.environ.get("SMTP_PASSWORD")
        self.EMAIL = "nasivalaszto@gyurukura1027.com"
        self.NAME = "GyűrűkUra 10-27"
    
    def send_email(self, receiver_email, subject, name, template, app, url="https://www.gyurukura1027.com"):
        try:
            with app.app_context():
                print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] - 📄 Reading template...')
                jinja_template = app.jinja_env.get_template(f'/emails/{template}.html')
                print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] - 📄 Template read')
                email_content = jinja_template.render({'name': name, 'subject': subject, 'url': url, 'count_down_title': self.config.get('count_down_title')})

            message = MIMEMultipart('related')
            message['From'] = formataddr((str(Header(self.NAME, 'utf-8')), self.EMAIL))
            message['To'] = receiver_email
            message["Subject"] = subject
            message["X-Priority"] = "1"
            message["X-MSMail-Priority"] = "High"
            message["Importance"] = "High"

            message.attach(MIMEText(email_content, "html"))

            context = ssl.create_default_context()

            with smtplib.SMTP_SSL('smtp.mailersend.net', 587) as server:
                server.starttls(context=context)
                server.login(self.USERNAME, self.PASSWORD)
                server.sendmail(self.EMAIL, receiver_email, message.as_string())
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📧 Email sikeresen elküldve!")
            return True
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