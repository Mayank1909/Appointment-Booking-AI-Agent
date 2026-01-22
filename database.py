import sqlite3
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

DB_NAME = "clinic.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Users Table
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT)''')
    # Appointments Table
    c.execute('''CREATE TABLE IF NOT EXISTS appointments 
                 (id TEXT PRIMARY KEY, user_id TEXT, start_time TEXT, status TEXT,
                  FOREIGN KEY(user_id) REFERENCES users(id))''')
    conn.commit()
    conn.close()

def create_user(email, password, name):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    user_id = str(uuid.uuid4())
    hashed_pw = generate_password_hash(password)
    try:
        c.execute("INSERT INTO users VALUES (?, ?, ?, ?)", (user_id, email, hashed_pw, name))
        conn.commit()
        return {"id": user_id, "name": name, "email": email}
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def verify_user(email, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, password, name FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    if user and check_password_hash(user[1], password):
        return {"id": user[0], "name": user[2], "email": email}
    return None

def add_appointment(user_id, start_time):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    booking_id = str(uuid.uuid4())[:8].upper()
    c.execute("INSERT INTO appointments VALUES (?, ?, ?, ?)", 
              (booking_id, user_id, start_time, "CONFIRMED"))
    conn.commit()
    conn.close()
    return booking_id

def get_all_booked_slots(date_str):
    """Retrieves all booked slots for a specific date to check availability."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    query = f"{date_str}%"
    c.execute("SELECT start_time FROM appointments WHERE start_time LIKE ? AND status='CONFIRMED'", (query,))
    rows = c.fetchall()
    slots = [row[0] for row in rows]
    conn.close()
    return slots

def get_user_appointments(user_id):
    """Retrieves appointment history for a specific user."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, start_time, status FROM appointments WHERE user_id = ?", (user_id,))
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "time": r[1], "status": r[2]} for r in rows]