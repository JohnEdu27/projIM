from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import db, cursor
from Models import *
import bcrypt
import random
import json

def role_verifyRider(email : str):
    cursor.execute("SELECT role FROM ccg_db.riders WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user or user['role'] != 'rider':
        raise HTTPException(status_code=403, detail="You do not have privilege to access this.")
    return True

def role_verifyFaculty(email : str):
    cursor.execute("SELECT role FROM ccg_db.faculty WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user or user['role'] != 'faculty':
        raise HTTPException(status_code=403, detail="You do not have privilege to access this.")
    return True

def role_verifyADMIN(email : str):
    cursor.execute("SELECT role FROM ccg_db.admin WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user or user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="You do not have privilege to access this.")
    return True

def gen_randomID():
    while True:
        new_id = random.randint(10000000, 99999999)
        cursor.execute("SELECT CustomerID FROM ccg_db.customers WHERE CustomerID = %s", (new_id,))
        if not cursor.fetchone():
            return new_id

def gen_productID():
    while True:
        productID = random.randint(10000,99999)
        cursor.execute("SELECT productID FROM ccg_db.products WHERE productID = %s", (productID,))
        if not cursor.fetchone():
            return productID

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def homepage():
    return "Hello, Welcome"


@app.get("/customers")
def get_customers():
    cursor.execute("SELECT * FROM customers")
    return cursor.fetchall()

@app.post("/add/adminlol")
def add_admin(user : adminADD):
    cursor.execute("SELECT * FROM ccg_db.admin WHERE email = %s", (user.adminEmail,))
    admin = cursor.fetchone()

    if not admin:
        raise HTTPException(status_code=404, detail="admin not found.")
    stored_hash = admin['password'].encode('utf-8')
    user_enterpass = user.adminPass.encode('utf-8')

    if not bcrypt.checkpw(user_enterpass,stored_hash):
        raise HTTPException(status_code=401, detail="Invalid password.")
    if not role_verifyADMIN(user.adminEmail):
        raise HTTPException(status_code=402, detail="You dont have access to this")
    adminID = gen_randomID()
    bytes_pwd = user.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(bytes_pwd, salt)

    query = "INSERT INTO ccg_db.admin (id, name, email, password) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (adminID, user.name, user.email, hashed_pwd.decode('utf-8')))
    db.commit()
    return {"message":"new admin added"};

@app.post("/signup/faculty")
def add_faculty(user : faculty):
    facultyID = gen_randomID()
    bytes_pwd = user.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(bytes_pwd, salt)

    query = "INSERT INTO ccg_db.faculty (facultyID, name, email, password, phone) VALUES (%s,%s,%s,%s,%s)"

    cursor.execute(query, (facultyID, user.name, user.email, hashed_pwd.decode('utf-8'), user.phone))
    db.commit()
    return {
        "message": "faculty added"
    }


@app.post("/signup")
def add_customers(user : customers):
    customer_id = gen_randomID()
    bytes_pwd = user.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(bytes_pwd, salt)

    query = "INSERT INTO ccg_db.customers (CustomerID, name, email, password) VALUES (%s,%s,%s,%s)"

    cursor.execute(query,(customer_id, user.name, user.email, hashed_pwd.decode('utf-8')))
    db.commit()
    return "Customer Added"

@app.post("/login")
def login(userA : customer):
    cursor.execute("SELECT email, name, password, role, CustomerID FROM ccg_db.customers WHERE email = %s UNION SELECT email, name, password, role, id FROM ccg_db.admin WHERE email = %s UNION SELECT email, name, password, role, facultyID FROM ccg_db.faculty WHERE email = %s UNION SELECT email, name, password, role, rider_id FROM ccg_db.riders WHERE email = %s", (userA.email, userA.email, userA.email, userA.email))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    stored_hash = user['password'].encode('utf-8')
    user_input_bytes = userA.password.encode('utf-8')

    if not bcrypt.checkpw(user_input_bytes,stored_hash):
        raise HTTPException(status_code=401, detail="Invalid Password")

    user_id = (
        user.get('CustomerID') or
        user.get('facultyID') or
        user.get('rider_id') or
        user.get('id')
    )

    return  {
        "message":f"Welcome back {user['name']}!",
        "role": user['role'],
        "name": user['name'],
        "id": user_id
        }

@app.put("/customers/{customer_id}")
def update_customerpwd(user : updateCustomer):
    hashed_pwd = bcrypt.hashpw(user.new_password.encode('utf-8'),
    bcrypt.gensalt())
    query = "UPDATE ccg_db.customers SET name = %s, email = %s, password = %s WHERE CustomerID = %s"

    values = (user.name, user.email, hashed_pwd.decode('utf-8'), user.customer_id)

    cursor.execute(query,values)
    db.commit()
    return {"message":"Customer Account updated."}

@app.delete("/customers/{customer_id}")
def delete_customer(userA : deleteCustomer):
    query = "DELETE FROM ccg_db.customers WHERE CustomerID = %s"
    cursor.execute("SELECT * FROM ccg_db.customers WHERE email = %s", (userA.email,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    stored_hash = user['password'].encode('utf-8')
    user_input_bytes = userA.password.encode('utf-8')

    if not bcrypt.checkpw(user_input_bytes,stored_hash):
        raise HTTPException(status_code=402, detail="Invalid Password.")
    cursor.execute(query, (userA.customer_id,))
    return {"message":f"User {userA.customer_id} Successfully Deleted."}

@app.delete("/product/{product_id}")
def delete_product(user : deleteProduct):
    query = "DELETE FROM ccg_db.products WHERE productID = %s"

    cursor.execute(query, (user.product_id,))
    db.commit()

    if cursor.rowcount == 0:
        return {"message":"No Product in that ID"}
    return {"message": f"Product {user.product_id} has been removed."}


@app.put("/product")
def restock_product(user : restockProduct):
    query = "UPDATE ccg_db.products SET quantity = %s WHERE productID = %s"
    values = (user.numberOFStock, user.product_id)
    if not role_verifyFaculty(user.email):
        raise HTTPException(status_code=403, detail="You have no access to this.")
    cursor.execute(query, values)
    db.commit()
    return {"message":"Product Updated"}


@app.post("/product")
def add_product(user : product):
    product_id = gen_productID()
    query = "INSERT INTO ccg_db.products (productName, quantity, price, productID) VALUES (%s,%s,%s,%s)"
    values = (user.ProductName, user.quantity, user.price, product_id)
    cursor.execute(query,values)
    db.commit()
    return {"message":"product added"}

@app.get("/products")
def get_products():
    cursor.execute("SELECT * FROM products")
    return cursor.fetchall()

@app.put("/product/{product_id}")
def change_product(user : updateProduct):
    query = "UPDATE ccg_db.products SET productName = %s, quantity = %s, price = %s WHERE productID = %s"
    values = (user.ProductName, user.quantity, user.price, user.product_id)
    cursor.execute(query, values)
    db.commit()

    if cursor.rowcount == 0:
        return {"message":"No product found with that ID"}
    return {"message": f"Product {user.product_id} updated successfully"}

@app.get("/search")
def search_product(user : searchProduct):
    query = "SELECT * FROM ccg_db.products WHERE productName LIKE %s"
    search_term = f"%{user.ProductName}%"
    cursor.execute(query, (search_term,))
    results = cursor.fetchall()

    if not results:
        return {"message": "No products found matching that name."}
    return results


@app.post("/signup/rider")
def add_rider(user : riderAccount):
    rider_id = gen_randomID()
    bytes_pwd = user.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(bytes_pwd, salt)

    query = "INSERT INTO ccg_db.riders (rider_id, name, email, phone, password) VALUES (%s,%s,%s,%s,%s)"

    cursor.execute(query,(rider_id, user.name, user.email, hashed_pwd.decode('utf-8')))
    db.commit()
    return {"message":"rider Added"}

@app.get("/riders")
def get_riders():
    cursor.execute("SELECT * FROM riders")
    return cursor.fetchall()


@app.put("/rider/{rider_id}")
def edit_rider(user : updateRider):
    hashed_pwd = bcrypt.hashpw(user.new_password.encode('utf-8'),
    bcrypt.gensalt())
    query = "UPDATE ccg_db.riders SET name = %s, email = %s, password = %s WHERE rider_id = %s"

    values = (user.name, user.email, hashed_pwd.decode('utf-8'), user.rider_id)

    cursor.execute(query,values)
    db.commit()
    return {"message":"Rider Account updated."}

@app.delete("/rider/{rider_id}")
def delete_rider(userA : deleteRider):
    query = "DELETE FROM ccg_db.riders WHERE rider_id = %s"
    cursor.execute("SELECT * FROM ccg_db.rider WHERE email = %s", (userA.email,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    stored_hash = user['password'].encode('utf-8')
    user_input_bytes = userA.password.encode('utf-8')

    if not bcrypt.checkpw(user_input_bytes,stored_hash):
        raise HTTPException(status_code=401, detail="Invalid Password")
    cursor.execute(query, (userA.rider_id,))
    return {"message":f"User {userA.rider_id} Successfully Deleted."}


@app.post("/orders")
def add_orders(user : addOrders):
    query = "INSERT INTO ccg_db.deliveryinfo (CustomerID ,orderID, date, time, customerName, address, phone, deliveryOption, deliveryFee, paymentMethod, notes, items, subtotal, total, status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    items_json = json.dumps([item.model_dump() for item in user.items])
    values = (user.userID, user.orderId, user.date, user.time, user.customerName, user.address, user.phone, user.deliveryOption, user.deliveryFee, user.paymentMethod, user.notes, items_json, user.subtotal, user.total, user.status)

    
    cursor.execute(query, values)
    db.commit()
    return {
        "message":"Order has been processed."
    }



@app.post("/admin/dashboard")
def get_allInfo(num : adminDashboard):
    cursor.execute("SELECT COUNT(*) AS total FROM ccg_db.deliveryinfo WHERE date = %s", (num.date,))
    
    result1 = cursor.fetchone()
    
    OrdersToday = result1["total"]

    if OrdersToday is None:
        OrdersToday = 0

    cursor.execute("SELECT COUNT(*) AS total FROM ccg_db.products")
    result2 = cursor.fetchone()

    totalProducts = result2["total"]
    if totalProducts is None:
        totalProducts = 0

    cursor.execute("SELECT COUNT(*) AS total FROM ccg_db.customers")
    result3 = cursor.fetchone()
    
    totalCustomers = result3["total"]
    if totalCustomers is None:
        totalCustomers = 0
    
    cursor.execute("SELECT SUM(total) AS total FROM ccg_db.deliveryinfo")
    result4 = cursor.fetchone()
    
    totalSales = result4["total"]
    if totalSales is None:
        totalSales = 0
    
    totalSales = float(totalSales)
    return {
        "OrdersToday": OrdersToday,
        "TotalProducts": totalProducts,
        "TotalCustomers": totalCustomers,
        "TotalSales": totalSales
    }

@app.get("/orders")
def get_orders():
    query = "SELECT CustomerID, orderID, customerName, items, total, status FROM ccg_db.deliveryinfo"
    cursor.execute(query)
    Information = cursor.fetchall()

    return {
        "orders": Information
    }

@app.post("/order")
def get_ordersVIAiD(user : getByID):
    cursor.execute("SELECT * FROM ccg_db.deliveryinfo WHERE CustomerID = %s", (user.CustomerID,))
    user2 = cursor.fetchall()

    return {
        "orders": user2
    }

@app.get("/faculty")
def get_faculty():
    cursor.execute("SELECT * FROM ccg_db.faculty")
    return cursor.fetchall()


