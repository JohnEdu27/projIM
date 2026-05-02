import mysql.connector

db = mysql.connector.connect (
    host="localhost",
    user="root",
    password="TanginaMolala12!",
    database="ccg_db"
)
cursor = db.cursor(dictionary=True)