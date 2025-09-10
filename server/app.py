from models import db, User,Booking,Bus
from flask_migrate import Migrate
from flask import Flask, make_response,jsonify,request
from flask_cors import CORS
from flask_restful import Api, Resource
import os,secrets
from datetime import timedelta
from werkzeug.security import check_password_hash,generate_password_hash
from flask_jwt_extended import JWTManager,create_access_token, create_refresh_token,jwt_required,get_jwt_identity


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.environ.get(
    "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SECRET_KEY'] =secrets.token_hex(32)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['SECRET_KEY'] = "super-secret-key"       # Flask sessions
app.config['JWT_SECRET_KEY'] = "super-secret-key"   


db.init_app(app)
migrate = Migrate(app, db)


api=Api(app)
jwt=JWTManager(app)

LOCATIONS = ["Nairobi", "Mombasa", "Kisumu", "Eldoret"]

FARES = {
    ("Nairobi", "Mombasa"): 1200,
    ("Mombasa", "Nairobi"): 1200,
    ("Nairobi", "Kisumu"): 1500,
    ("Kisumu", "Nairobi"): 1500,
    ("Mombasa", "Kisumu"): 2000,
    ("Kisumu", "Mombasa"): 2000,
    ("Nairobi", "Eldoret"): 1300,
    ("Eldoret", "Nairobi"): 1300,
}


class Home(Resource):
    def get(self):
        return make_response({"msg":"Homepage here"},200)

api.add_resource(Home,'/')


class Signup(Resource):
    def post(self):
        data=request.get_json()
        email=data.get("email")
        first_name=data.get("first_name")
        last_name=data.get("last_name")
        password=generate_password_hash(data.get("password"))
        if "@" in email and first_name and first_name!=" " and last_name and last_name!=" "  and data.get("password") and data.get("password")!=" ":
            user=User.query.filter_by(email=email).first()
            if user:
                return make_response({"msg":f"{email} is already registered"},400)
            new_user=User(first_name=first_name,last_name=last_name,email=email,password=password)
            db.session.add(new_user)
            db.session.commit()
            return make_response(new_user.to_dict(),201)
        return make_response({"msg":"Invalid data entries"},400)
api.add_resource(Signup,'/signup')


class Login(Resource):
    def post(self):
        data=request.get_json()
        email=data.get("email")
        password=data.get("password")
        if "@" in email and password:
            user=User.query.filter_by(email=email).first()
            if user:
                if check_password_hash(user.password,password):
                    access_token=create_access_token(identity=str(user.id))
                    refresh_token=create_refresh_token(identity=str(user.id))
                    return make_response({"user":user.to_dict(),"access_token":access_token,"refresh_token":refresh_token},200)
                return make_response({"msg":"Incorrect password"},400)
            return make_response({"msg":"email not registered"},404)
        return make_response({"msg":"Invalid data"})
api.add_resource(Login,'/login')


class User_Booking(Resource):
    def get(self,booking_id=None):
        if booking_id:
            booking=Booking.query.get(booking_id)
            if booking:
                return make_response(booking.to_dict(),200)
            return make_response({"msg":"Booking not found"},404)
        bookings = [b.to_dict() for b in Booking.query.all()]
        return make_response(bookings,200)
        
    
    @jwt_required()
    def post(self):
        data=request.get_json()
        user_id = int(get_jwt_identity())
        
        from_loc = data.get("from_loc")
        to_loc = data.get("to_loc")
        bus_id = data.get("bus_id")
        seat_number = data.get("seat_number")
        
        # existing_booking = Booking.query.filter_by(user_id=user_id, bus_id=bus_id).first()
        # if existing_booking:
        #     return make_response({"msg": "You have already booked a seat on this bus"}, 400)

   
        fare = FARES.get((from_loc, to_loc))
        if not fare:
            return make_response({"msg": "Invalid route"}, 400)
        
        bus = Bus.query.get(bus_id)
        if not bus:
            return make_response({"msg": "Bus not found"}, 404)

   
        if len(bus.bookings) >= bus.capacity:
            return make_response({"msg": "Bus is fully booked"}, 400)
        
        try:
            seat_number_int = int(seat_number)
            if seat_number_int < 1 or seat_number_int > bus.capacity:
                return make_response({"msg": f"Seat number must be between 1 and {bus.capacity}"}, 400)
        except ValueError:
            return make_response({"msg": "Seat number must be a valid integer"}, 400)

    
        if seat_number in [b.seat_number for b in bus.bookings]:
            return make_response({"msg": f"Seat {seat_number} is already booked"}, 400)


        new_booking = Booking(
            user_id=user_id,
            from_loc=from_loc,
            to_loc=to_loc,
            date=data.get("date"),
            bus_id=data.get("bus_id"),
            seat_number=data.get("seat_number"),
            fare=fare,
        )
        db.session.add(new_booking)
        db.session.commit()
        return make_response(new_booking.to_dict(), 201)
    
    
api.add_resource(User_Booking,"/booking","/booking/<int:booking_id>")


class GetBus(Resource):
    def get(self,id=None):
        if id:
            bus=Bus.query.filter_by(id=id).first()
            if bus:
                return make_response(bus.to_dict(),200)
            return make_response({"msg":f"bus with id {id} does not exist"},401)
        buses=[b.to_dict() for b in Bus.query.all()]
        return make_response(buses,201)
    
    def post(self):
        data=request.get_json()
        regNo = data.get("regNo")
        capacity = data.get("capacity")

        if not regNo or not capacity:
            return make_response({"msg": "regNo and capacity are required"}, 400)
        
        try:
            capacity = int(capacity)
            if capacity <= 0:
                raise ValueError
        except ValueError:
            return make_response({"msg": "capacity must be a positive integer"}, 400)

        existing_bus = Bus.query.filter_by(regNo=regNo).first()
        if existing_bus:
            return make_response({"msg": "Bus with this registration number already exists"}, 409)
        new_bus=Bus(
            regNo=regNo,
            capacity=capacity
        )
        db.session.add(new_bus)
        db.session.commit()
        return make_response(new_bus.to_dict(),201)
    
    def patch(self, id):
        bus = Bus.query.filter_by(id=id).first()
        if not bus:
            return make_response({"msg": f"Bus with id {id} does not exist"}, 404)

        data = request.get_json()
        regNo = data.get("regNo")
        capacity = data.get("capacity")
        
        if regNo:
        # Optional: check uniqueness
            # existing_bus = Bus.query.filter_by(regNo=regNo).first()
            # if existing_bus and existing_bus.id != id:
            #     return make_response({"msg": "Another bus with this registration number already exists"}, 409)
            bus.regNo = regNo

        if capacity:
            try:
                capacity = int(capacity)
                if capacity <= 0:
                    raise ValueError
                bus.capacity = capacity
            except ValueError:
                return make_response({"msg": "capacity must be a positive integer"}, 400)

        db.session.commit()
        return make_response(bus.to_dict(), 200)

    def delete(self, id):
        bus = Bus.query.filter_by(id=id).first()
        if not bus:
            return make_response({"msg": f"Bus with id {id} does not exist"}, 404)

        db.session.delete(bus)
        db.session.commit()
        return make_response({"msg": f"Bus with id {id} deleted successfully"}, 200)

    


api.add_resource(GetBus,"/buses","/buses/<int:id>")

class User_Resource(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            if user:
                return make_response(user.to_dict(), 200)
            return make_response({"msg": "User not found"}, 404)

        users = [u.to_dict() for u in User.query.all()]
        return make_response(users, 200)
    
    def patch(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return make_response({"msg": "User not found"}, 404)

        data = request.get_json()

        # Example fields to update
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            user.email = data["email"]
        if "password" in data:  # ideally hash this
            user.password = data["password"]

        db.session.commit()
        return make_response(user.to_dict(), 200)

    
api.add_resource(User_Resource,"/users","/users/<int:user_id>")


class Location(Resource):
    def get(self):
        return jsonify(LOCATIONS)
    
api.add_resource(Location, '/locations')









if __name__=="__main__":
    app.run(debug=True)
