from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from twilio.rest import Client
import smtplib, ssl, random, sqlite3, os
import phonenumbers



#defining a connection and a cursor

connection = sqlite3.connect('user.db')
command = connection.cursor()

app = FastAPI()

#Pydantic model

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    balance: float = 1000000
    orange_coins: int = 0
    phone: str

class LoginUser(BaseModel):
    email: EmailStr
    password: str
    send_via: str = "email" 

@app.post("/create-user/")
def create_user(request: CreateUserRequest):
    command.execute("SELECT * FROM users WHERE email=?", (request.email,))
    if command.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = password_context.hash(request.password)
    formatted_number = format_number(request.phone)

    command.execute(
        "INSERT INTO users(email, balance, orange_coins, password, phone) VALUES (?, ?, ?, ?, ?)",
        (request.email, request.balance, request.orange_coins, hashed_pw, formatted_number)
    )
    connection.commit()
    return {"message": f"User {request.email} created successfully with balance R{request.balance}"}

@app.post("/login/")
def login(user: LoginUser):
    command.execute("SELECT password, phone FROM users WHERE email=?", (user.email,))
    result = command.fetchone()
    if not result or not password_context.verify(user.password, result[0]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    otp = str(random.randint(100000, 999999))
    command.execute("UPDATE users SET otp=? WHERE email=?", (otp, user.email))
    connection.commit()

    if user.send_via == "sms":
        send_sms(result[1], otp)
    else:
        send_email(user.email, otp)

    return {"message": f"OTP sent via {user.send_via}"}



class SendMoneyRequest(BaseModel):


    """
    Model for representing a money transfer request between 2 users
    """
    sender_email: EmailStr
    receiver_account: str
    amount: float


#Endpoint for sending money

@app.post("/send-money/")

def transfer_money(request: SendMoneyRequest):
    sender_email = request.sender_email
    receiver_account = request.receiver_account
    amount = request.amount

    sender = user.get()

    # check if sender has enough money
    sender_balance = sender[1]
    if sender_balance < amount:
        raise HTTPException(status_code=400,detail ="Insufficient funds")
    
    #deduct amonut from sender and add for reciever
    sender_balance -= amount
    receiver_balance = receiver[1] + amount

    command.execute("UPDATE users SET balance=? WHERE email=?", (sender_balance,sender_email))
    command.execute("UPDATE users SET balance=? WHERE email=?", (receiver_balance,receiver_account))

    #Calculate points earned
    points_earned = amount

    #add transaction to log
    command.execute("""
                   INSERT INTO transactions (sender_email, receiver_account, amount,orange_coins) 
                   VALUES (?, ?, ?, ?)
                   """, (sender_email, receiver_account, amount, points_earned))
    
    connection.commit()


    return {
        "message": f"{sender_email} sent R{amount} to {receiver_account}",
        "sender_balance": sender_balance,
        "orange coins_earned": points_earned,
        "receiver_balance": receiver_balance

    }

#dummy test for api 

@app.get("/test")
def test():
    return {"message": "FastAPI is working!"}

    # check if sender has enough money 
    # deduct amount
    # calculate points
    # record transaction
    

command.execute("""
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    balance REAL DEFAULT 0,
    orange_coins INTEGER DEFAULT 0,
    password TEXT,
    phone TEXT,
    otp TEXT
)
""")

connection.commit()

command.execute("""
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