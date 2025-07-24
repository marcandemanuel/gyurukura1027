import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from email.mime.image import MIMEImage

from datetime import datetime


EMAIL = "gyurukura1027@gmail.com"
PASSWORD = "abmw bcuj sdyj uloi"
NAME = 'GyűrűkUra 10-27'

def send_email(receiver_email, subject, name, template, app, url, extra=''):
    with app.app_context():
        jinja_template = app.jinja_env.get_template(f'emails/{template}.html')
        email_content = jinja_template.render({'name': name, 'subject': subject, 'extra': extra, 'url': url})

    message = MIMEMultipart('related')
    message['From'] = formataddr((str(Header(NAME, 'utf-8')), EMAIL))
    message['To'] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(email_content, "html"))

    if template != 'changed':
        with open("static/images/lotr-img-1.jpg", 'rb') as f:
            img = MIMEImage(f.read())
            img.add_header('Content-ID', '<background>')
            img.add_header('Content-Disposition', 'inline', filename='background.jpg')
            message.attach(img)

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL, PASSWORD)
            server.sendmail(EMAIL, receiver_email, message.as_string())
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - 📧 Email sikeresen elküldve!")
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] - ❌ Error az email küldése közben: {e}")
