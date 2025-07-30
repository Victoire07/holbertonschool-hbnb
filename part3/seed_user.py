from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User

app = create_app()

with app.app_context():
    email = "test@example.com"
    raw_password = "password123"
    hashed_password = bcrypt.generate_password_hash(raw_password).decode('utf-8')

    # Vérifie si un utilisateur avec cet email existe déjà
    existing = User.query.filter_by(email=email).first()
    if existing:
        print("Utilisateur déjà existant.")
    else:
        user = User(
            email=email,
            password_hash=hashed_password,
            is_admin=False
        )
        db.session.add(user)
        db.session.commit()
        print("Utilisateur ajouté :", email)
