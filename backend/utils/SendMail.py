from fastapi.responses import JSONResponse
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = '587'
SMTP_EMAIL = 'project.malhar@gmail.com'
SMTP_PASSWORD = 'uavh liyl wyrf kkol'

def send_mail(to_email:str,subject:str,text:str):
    msg = MIMEMultipart()
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(text,'plain'))
    
    #Mail server Connection
    try:
        server = smtplib.SMTP(SMTP_SERVER,SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL,SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL,to_email,msg.as_string())
        server.quit()
        
    except Exception as e:
        return JSONResponse(status_code=404,content={"message":"Failed to Send mail"})
    
    return {"message":"Email sent Successfully"}

# send_mail("projectuser123@yopmail.com","Test Mail","Hello world")