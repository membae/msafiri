from models import db, User,Booking
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
app.config['SECRET_KEY'] =secrets.token_hex(32)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)



migrate = Migrate(app, db)

db.init_app(app)
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
                    access_token=create_access_token(identity=user.id)
                    refresh_token=create_refresh_token(identity=user.id)
                    return make_response({"user":user.to_dict(),"access_token":access_token,"refresh_token":refresh_token},200)
                return make_response({"msg":"Incorrect password"},400)
            return make_response({"msg":"email not registered"},404)
        return make_response({"msg":"Invalid data"})
api.add_resource(Login,'/login')




class Location(Resource):
    def get(self):
        return jsonify(LOCATIONS)
    
api.add_resource(Location, '/locations')









if __name__=="__main__":
    app.run(debug=True)
