from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from twilio.rest import Client
import smtplib, ssl, random, sqlite3, os
import phonenumbers

# ---------------- FASTAPI APP ----------------
app = FastAPI()
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- DATABASE ----------------
connection = sqlite3.connect('user.db', check_same_thread=False)
cursor = connection.cursor()

# Merge user table to include auth + loyalty fields
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT,
    phone TEXT,
    otp TEXT,
    balance REAL DEFAULT 1000,
    orange_coins INTEGER DEFAULT 0
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_email TEXT,
    receiver_account TEXT,
    amount REAL,
    orange_coins INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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

class CreateUserRequest(BaseModel):  # optional for admin preloading
    email: EmailStr
    balance: float = 1000
    orange_coins: int = 0
    phone: str

class SendMoneyRequest(BaseModel):
    sender_email: EmailStr
    receiver_account: EmailStr
    amount: float

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
            server.sendmail(sender, receiver, message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

def send_sms(phone_number: str, otp: str):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

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

# ---------------- AUTH ENDPOINTS ----------------
@app.post("/signup")
def signup(user: SignupUser):
    hashed_pw = password_context.hash(user.password)
    full_number = f"{user.country_code}{user.phone_number}"
    formatted_number = format_number(full_number)

    try:
        cursor.execute(
            "INSERT INTO users (email, password, phone, balance, orange_coins) VALUES (?, ?, ?, ?, ?)",
            (user.email, hashed_pw, formatted_number, 1000, 0)
        )
        connection.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")

    return {"message": "User registered successfully!"}

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

# ---------------- LOYALTY ENDPOINTS ----------------
@app.post("/create-user/")
def create_user(request: CreateUserRequest):
    cursor.execute("SELECT * FROM users WHERE email=?", (request.email,))
    existing_user = cursor.fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    cursor.execute(
        "INSERT INTO users(email, balance, orange_coins, phone, password) VALUES (?, ?, ?, ?, ?)",
        (request.email, request.balance, request.orange_coins, request.phone, "")
    )
    connection.commit()

    return {"message": f"User {request.email} created with balance R{request.balance}"}

@app.post("/send-money/")
def transfer_money(request: SendMoneyRequest):
    # Get sender
    cursor.execute("SELECT balance FROM users WHERE email=?", (request.sender_email,))
    sender = cursor.fetchone()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    # Get receiver
    cursor.execute("SELECT balance FROM users WHERE email=?", (request.receiver_account,))
    receiver = cursor.fetchone()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    sender_balance = sender[0]
    receiver_balance = receiver[0]

    # Check balance
    if sender_balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # Deduct & add
    sender_balance -= request.amount
    receiver_balance += request.amount
    points_earned = int(request.amount // 10)  # Example: 1 coin per R10

    cursor.execute("UPDATE users SET balance=?, orange_coins=orange_coins+? WHERE email=?",
                   (sender_balance, points_earned, request.sender_email))
    cursor.execute("UPDATE users SET balance=? WHERE email=?",
                   (receiver_balance, request.receiver_account))

    cursor.execute("""
        INSERT INTO transactions (sender_email, receiver_account, amount, orange_coins) 
        VALUES (?, ?, ?, ?)
    """, (request.sender_email, request.receiver_account, request.amount, points_earned))
    connection.commit()

    return {
        "message": f"{request.sender_email} sent R{request.amount} to {request.receiver_account}",
        "sender_balance": sender_balance,
        "receiver_balance": receiver_balance,
        "orange_coins_earned": points_earned
    }

@app.get("/test")
def test():
    return {"message": "FastAPI is working!"}
