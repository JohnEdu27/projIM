from pydantic import BaseModel

class Order(BaseModel):
    name : str
    email : str
    date : str

class products(BaseModel):
    productName1 : str
    quantity : int
    price : float