import sqlite3
import os

def get_db_connection():
    """
    Create and return a database connection
    """
    # Database will be created in the backend folder
    db_path = os.path.join(os.path.dirname(__file__), 'student_rewards.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initialize the database with required tables and sample data
    """
    conn = get_db_connection()
    
    # Create students table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            total_points INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create points table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            points INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (id)
        )
    ''')
    
    # Create rewards table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            reward_type TEXT NOT NULL,
            earned_at INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (id)
        )
    ''')
    
    # Check if sample student exists
    student_count = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
    
    if student_count == 0:
        # Insert sample students
        sample_students = [
            ('Sarah Johnson', 0),
            ('John Smith', 0),
            ('Emma Davis', 0),
            ('Michael Brown', 0),
            ('Sophia Wilson', 0)
        ]
        
        conn.executemany(
            'INSERT INTO students (name, total_points) VALUES (?, ?)',
            sample_students
        )
        
        print("Sample students added to the database")
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")