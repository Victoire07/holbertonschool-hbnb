from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from config import DevelopmentConfig

from app.extensions import db, jwt, bcrypt
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protected import api as protected_ns


def create_app(config_class="config.DevelopmentConfig"):
    """
    Flask application factory that instantiates
    the app with a configuration class
    """
    # 1: Load application configuration before initializing extensions(BD...)
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enabling CORS for all origins (in dev)
    CORS(app)

    # Step 2: Initialize Bcrypt with the Flask application
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Step 3: Create the Flask-RESTx API
    api = Api(
        app,
        version="1.0",
        title="HBnB API",
        description="HBnB Application API"
    )

    # 4: Register namespaces to activate routesfor each feature(exusers/places)

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(protected_ns, path='/api/v1')
    api.add_namespace(auth_ns, path="/api/v1/auth")
    return app
