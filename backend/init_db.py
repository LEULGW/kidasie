from app import app, db
import os

instance_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
if not os.path.exists(instance_dir):
    os.makedirs(instance_dir)
    print(f"Created instance directory at {instance_dir}")

with app.app_context():
    db.create_all()
    print("Database created successfully!")