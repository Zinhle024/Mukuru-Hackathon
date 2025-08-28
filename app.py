from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from twilio.rest import Client
import smtplib, ssl, random, sqlite3, os
import phonenumbers



#defining a connection and a cursor

connection = sqlite3.connect('user.db')

#cursor used to interact with the database

cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT,
    phone TEXT,
    otp TEXT
)
""")

connection.commit()