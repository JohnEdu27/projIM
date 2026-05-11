from pydantic import BaseModel
from typing import List, Optional

class Order(BaseModel):
    name : str
    email : str
    date : str

class products(BaseModel):
    productName1 : str
    quantity : int
    price : float

class customer(BaseModel):
    email : str
    password : str
    
class customers(BaseModel):
    name : str
    email : str
    password : str

class adminADD(BaseModel):
    adminEmail : str
    adminPass : str
    name : str
    email : str
    password : str

class faculty(BaseModel):
    name : str
    email : str
    password : str

class deleteCustomer(BaseModel):
    customer_id : int
    email : str
    password : str

class updateCustomer(BaseModel):
    customer_id : int
    name : str
    email : str
    new_password : str

class deleteProduct(BaseModel):
    product_id : int

class product(BaseModel):
    ProductName : str
    quantity : int
    price : float

class restockProduct(BaseModel):
    product_id : int
    numberOFStock : int
    email : str

class updateProduct(BaseModel):
    product_id : int
    productName : str
    quantity : int
    price : float
class searchProduct(BaseModel):
    ProductName : str

class riderAccount(BaseModel):
    name : str
    email : str
    password : str

class updateRider(BaseModel):
    rider_id : int
    name : str
    email : str
    new_password : str

class deleteRider(BaseModel):
    rider_id : int
    email : str
    password : str

class OrderItem(BaseModel):
    id : int
    name : str
    price : float
    quantity : int

class addOrders(BaseModel):
    orderId : int
    date : str
    time : str
    customerName : str
    address : str
    phone : str
    deliveryOption : str
    deliveryFee : float
    paymentMethod : str
    notes : Optional[str] = None
    items : List[OrderItem]
    subtotal : float
    total : float
    status : str

class adminDashboard(BaseModel):
    date : str