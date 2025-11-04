from sqlalchemy.orm import Session
from core.database import engine, SessionLocal
from core.models import Base, User
from core.auth import hash_password
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    """Initialize database with tables and default admin user"""
    
    # Create all tables
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created!")
    
    # Get session
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@contexweave.com").first()
        
        if admin:
            print("✓ Admin user already exists! No action needed.")
            print(f"  Email: {admin.email}")
            print(f"  Status: {admin.status}")
            print(f"  Role: {admin.role}")
        else:
            # Create default admin
            admin_password = os.getenv("ADMIN_PASSWORD", "admin123secure")
            
            admin = User(
                email="admin@contexweave.com",
                username="admin",
                password_hash=hash_password(admin_password),
                role="admin",
                status="approved"
            )
            
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            print("✨ Admin user created successfully!")
            print(f"  Email: {admin.email}")
            print(f"  Username: {admin.username}")
            print(f"  Password: {admin_password}")
            print("⚠️  IMPORTANT: Change this password in production!")
    
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
