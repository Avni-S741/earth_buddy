import sqlite3

def make_connection():
    connect_db=sqlite3.connect("database.db")
    connect_db.row_factory = sqlite3.Row

    return connect_db 

def init_db():
    connect_db=make_connection()
    cursor=connect_db.cursor()

    cursor.execute(''' 
    CREATE TABLE IF NOT EXISTS users (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL 
    );
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks(
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL
    );
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS completions(
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,
    task_id  INTEGER NOT NULL,
    image TEXT,
    verified INTEGER DEFAULT 0,
    completed_At  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) )
    ''')

    connect_db.commit()
    connect_db.close()

def seed_tasks():
    connect_db=make_connection()
    cursor=connect_db.cursor()

    cursor.execute("SELECT COUNT(*) FROM tasks")
    count= cursor.fetchone()[0]

    if count==0:
        tasks=[("Plastic free day","Wastage","Spend an entire day without using a single plastic. Upload a photo as proof",100),
               ("No Vehicle day","Air Quality","Spend an entire day without using vehicle, walk to the distance if needed.Upload a photo as proof",50),
               ("Plant a sappling","Greenery","Plant a sappling and Upload a photo with it",100),
               ("Cycle to work or college","Air Quality","Use cycle to work or college and upload a photo of it",50),
               ]
        
        cursor.executemany('''INSERT INTO tasks (title, category, description, points) VALUES(?,?,?,?)''',tasks)

        connect_db.commit()
    connect_db.close()