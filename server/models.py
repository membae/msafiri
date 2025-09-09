from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin

metadata=MetaData()
db=SQLAlchemy(metadata=metadata)

class User(db.Model, SerializerMixin):
    __tablename__="users"
    id=db.Column(db.Integer,primary_key=True)
    first_name=db.Column(db.String, nullable=False)
    last_name=db.Column(db.String, nullable=False)
    email=db.Column(db.String, unique=True)
    password=db.Column(db.String, nullable=False)
    
    booking=db.relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    serialize_only = ("id", "first_name", "last_name", "email") 
    
class Booking(db.Model, SerializerMixin):
    __tablename__="bookings"
    id=db.Column(db.Integer, primary_key=True)
    from_loc=db.Column(db.String, nullable=False)
    to_loc=db.Column(db.String, nullable=False)
    date=db.Column(db.String, nullable=False)
    fare=db.Column(db.Integer, nullable=False)
    bus_id = db.Column(db.Integer, nullable=False)
    seat_number = db.Column(db.String(10), nullable=False)
    
    user_id=db.Column(db.Integer, db.ForeignKey("users.id"))
    user=db.relationship("User",back_populates="booking")
    serialize_only = ("id", "from_loc", "to_loc", "date", "bus_id", "seat_number", "fare", "user_id")

    
    