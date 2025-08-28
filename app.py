from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from twilio.rest import Client
import smtplib, ssl, random, sqlite3, os
import phonenumbers

# ---------------- FASTAPI APP ----------------
app = FastAPI()
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DATABASE ----------------
connection = sqlite3.connect('user.db', check_same_thread=False)
cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT,
    email TEXT PRIMARY KEY,
    password TEXT,
    phone TEXT,
    otp TEXT
)
""")
connection.commit()

# ---------------- MODELS ----------------
class SignupUser(BaseModel):
    email: EmailStr
    password: str
    country_code: str  # e.g. +27
    phone_number: str  # e.g. 606855391

class LoginUser(BaseModel):
    email: EmailStr
    password: str
    send_via: str = "email"  # "email" or "sms"

# ---------------- HELPERS ----------------
def format_number(phone_number: str, region: str = "ZA"):
    try:
        parsed = phonenumbers.parse(phone_number, region)
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except:
        raise HTTPException(status_code=400, detail="Invalid phone number")

def send_email(receiver, otp):
    port = 465
    smtp_server = "smtp.gmail.com"
    sender = os.getenv("EMAIL_SENDER")
    password = os.getenv("EMAIL_PASSWORD")

    message = f"""Subject: Mukuru OTP CODE

Your OTP is {otp}"""

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender, password)
            server.send_message(f"Subject: Mukuru OTP\n\nYour OTP is {otp}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

def send_sms(phone_number: str, otp: str):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_PHONE_NUMBER").venv) wtc@pop-os:~/Desktop/mukuru_hackathon/Mukuru-Hackathon$ git stash list
git status
stash@{0}: WIP on main: dc83907 added transaction table
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   app.py

Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add <file>..." to mark resolution)
        both modified:   loginpage/script.js

    client = Client(account_sid, auth_token)

    try:
        message = client.messages.create(
            body=f"Your OTP code is {otp}",
            from_=twilio_number,
            to=phone_number
        )
        return message.sid
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SMS sending failed: {str(e)}")

# ---------------- ENDPOINTS ----------------
@app.post("/signup")
def signup(user: SignupUser):
    hashed_pw = password_context.hash(user.password)

    full_number = f"{user.country_code}{user.phone_number}"
    formatted_number = format_number(full_number)

    try:
        cursor.execute(
            "INSERT INTO users (email, password, phone) VALUES (?, ?, ?)",
            (user.email, hashed_pw, formatted_number)
        )
        connection.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = cursor.lastrowid
    return {"message": "User registered successfully!", "user_id": user_id}


@app.post("/login")
def login(user: LoginUser):
    cursor.execute("SELECT password, phone FROM users WHERE email=?", (user.email,))
    result = cursor.fetchone()
    if not result or not password_context.verify(user.password, result[0]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    otp = str(random.randint(100000, 999999))
    cursor.execute("UPDATE users SET otp=? WHERE email=?", (otp, user.email))
    connection.commit()

    if user.send_via == "sms":
        phone_number = result[1]
        send_sms(phone_number, otp)
    else:
        send_email(user.email, otp)

    return {"message": f"OTP sent via {user.send_via}"}

@app.post("/verify-otp")
def verify_otp(email: str = Form(...), otp: str = Form(...)):
    cursor.execute("SELECT otp FROM users WHERE email=?", (email,))
    result = cursor.fetchone()
    if result and result[0] == otp:
        return {"message": "OTP verified! Login successful."}
    raise HTTPException(status_code=401, detail="Invalid OTP")
