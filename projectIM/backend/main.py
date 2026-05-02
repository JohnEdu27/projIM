from fastapi import FastAPI, HTTPException
from db import db, cursor
import models
import bcrypt
import random



def gen_randomID():
    while True:
        new_id = random.randint(10000000, 99999999)
        cursor.execute("SELECT CustomerID FROM ccg_db.customers WHERE CustomerID = %s", (new_id,))
        if not cursor.fetchone():
            return new_id

app = FastAPI()

@app.get("/")
def homepage():
    return "Hello, Welcome"


@app.get("/customers")
def get_customers():
    cursor.execute("SELECT * FROM customers")
    return cursor.fetchall()

@app.post("/signup")
def add_customers(name: str, email: str, password: str):
    customer_id = gen_randomID()
    bytes_pwd = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(bytes_pwd, salt)

    query = "INSERT INTO ccg_db.customers (CustomerID, name, email, password) VALUES (%s,%s,%s,%s)"

    cursor.execute(query,(customer_id, name, email, hashed_pwd.decode('utf-8')))
    db.commit()
    return "Customer Added"

@app.post("/login")
def login_customers(email:str, password: str):
    cursor.execute("SELECT * FROM ccg_db.customers WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user:
        stored_hash = user['password'].encode('utf-8')
        user_input_bytes = password.encode('utf-8')

        if bcrypt.checkpw(user_input_bytes,stored_hash):
            return {"message":"Login Successfully"}
        else:
            return {"message":"Invalid Password"}
    return {"message":"User not found"}

@app.put("/customers/{customer_id}")
def update_customerpwd(customer_id:int, name: str, email : str, new_password : str):
    hashed_pwd = bcrypt.hashpw(new_password.encode('utf-8'),
    bcrypt.gensalt())
    query = "UPDATE ccg_db.customers SET name = %s, email = %s, password = %s WHERE CustomerID = %s"

    values = (name, email, hashed_pwd.decode('utf-8'), customer_id)

    cursor.execute(query,values)
    db.commit()
    return {"message":"Customer Account updated."}

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id : int, email:str, password:str):
    query = "DELETE FROM ccg_db.customers WHERE CustomerID = %s"
    cursor.execute("SELECT * FROM ccg_db.customers WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user:
        stored_hash = user['password'].encode('utf-8')
        user_input_bytes = password.encode('utf-8')

        if bcrypt.checkpw(user_input_bytes,stored_hash):
            cursor.execute(query, (customer_id,))
            return {"message":f"User {customer_id} Successfully Deleted."}
        else:
            return {"message":"Invalid Password"}
    return {"message":"User not found"}

@app.delete("/product/{product_id}")
def delete_product(product_id : int):
    query = "DELETE FROM ccg_db.products WHERE productID = %s"

    cursor.execute(query, (product_id,))
    db.commit()

    if cursor.rowcount == 0:
        return {"message":"No Product in that ID"}
    return {"message": f"Product {product_id} has been removed."}





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

@app.put("/product/{product_id}")
def change_product(product_id: int, ProductName: str, quantity: int, price : float):
    query = "UPDATE ccg_db.products SET productName = %s, quantity = %s, price = %s WHERE productID = %s"
    values = (ProductName, quantity, price, product_id)
    cursor.execute(query, values)
    db.commit()

    if cursor.rowcount == 0:
        return {"message":"No product found with that ID"}
    return {"message": f"Product {product_id} updated successfully"}

@app.get("/search")
def search_product(ProductName: str):
    query = "SELECT * FROM ccg_db.products WHERE productName LIKE %s"
    search_term = f"%{ProductName}%"
    cursor.execute(query, (search_term,))
    results = cursor.fetchall()

    if not results:
        return {"message": "No products found matching that name."}
    return results