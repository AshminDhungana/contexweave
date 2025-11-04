from core.database import engine, get_db
from core.models import Base, User
from core.auth import hash_password
from sqlalchemy.orm import Session

# Create tables
Base.metadata.create_all(bind=engine)

# Get DB session
db = next(get_db())

# Check if admin exists
admin = db.query(User).filter(User.email == "admin@contexweave.com").first()
if admin:
    print("✓ Admin already exists!")
else:
    # Create admin
    admin = User(
        email="admin@contexweave.com",
        username="admin",
        password_hash=hash_password("admin123secure"),  # CHANGE THIS!
        role="admin",
        status="approved"  # Auto-approve admin
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"✓ Admin created! Email: {admin.email}")

db.close()
