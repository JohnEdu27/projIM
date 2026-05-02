from fastapi import FastAPI, HTTPException
from db import db, cursor
import models

app = FastAPI()

@app.get("/")
def homepage():
    return "Hello, Welcome"


@app.get("/customers")
def get_customers():
    cursor.execute("SELECT * FROM customers")
    return cursor.fetchall()

@app.post("/signup")
def add_customers(name: str, email: str):
    query = "INSERT INTO ccg_db.customers (name, email) VALUES (%s,%s)"
    values = (name, email)
    cursor.execute(query,values)
    db.commit()
    return "Customer Added"


@app.post("/product")
def add_product(ProductName : str, quantity: int, price : float):
    query = "INSERT INTO ccg_db.products (productName, quantity, price) VALUES (%s,%s,%s)"
    values = (ProductName, quantity, price)
    cursor.execute(query,values)
    db.commit()
    return "product added"

@app.get("/products")
def get_products():
    cursor.execute("SELECT * FROM products")
    return cursor.fetchall()

@app.put("/product")
def change_product(productID: int, ProductName: str, quantity: int, price : float):
    