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
                   INSERT INTO transactions (sender_email, receiver_account, amount,orange_points) 
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
    orange_points INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

connection.commit()