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
    password TEXT NOT NULL ,
    email TEXT UNIQUE NOT NULL
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
        tasks = [
    # Waste Management
    ("Plastic Free Day", "Waste Management", "Spend an entire day without using any single use plastic. Upload a photo of your reusable alternatives.", 50),
    ("Collect and Segregate Waste", "Waste Management", "Segregate your household waste into wet and dry. Upload a photo of segregated bins.", 40),
    ("Beach or Park Cleanup", "Waste Management", "Clean up a public space and upload a photo of the waste you collected.", 120),
    ("Say No to Plastic Bag", "Waste Management", "Use only reusable bags for shopping today. Upload a photo of your reusable bag.", 30),
    ("Compost Your Kitchen Waste", "Waste Management", "Start or contribute to a compost pile at home. Upload a photo.", 80),
    ("Zero Waste Day", "Waste Management", "Produce zero non-recyclable waste for an entire day. Upload a photo of your empty dustbin.", 100),

    # Air Quality
    ("No Vehicle Day", "Air Quality", "Use no personal vehicle today. Walk, cycle or use public transport. Upload a photo as proof.", 60),
    ("Cycle to Work or College", "Air Quality", "Cycle to your destination instead of using a vehicle. Upload a photo of yourself with your cycle.", 70),
    ("Walk Instead of Drive", "Air Quality", "Walk to a nearby destination instead of taking a vehicle. Upload a photo.", 40),
    ("Switch Off Unnecessary Lights", "Air Quality", "Switch off all unnecessary lights and fans for a full day. Upload a photo of your switchboard.", 30),
    ("Carpool Today", "Air Quality", "Share a ride with at least one other person instead of travelling alone. Upload a photo.", 50),

    # Green Cover
    ("Plant a Sapling", "Green Cover", "Plant a sapling anywhere — home, school, or public space. Upload a photo with it.", 100),
    ("Water Existing Plants", "Green Cover", "Water plants in your home or neighbourhood. Upload a photo.", 20),
    ("Start a Kitchen Garden", "Green Cover", "Start growing any vegetable or herb at home. Upload a photo of your setup.", 90),
    ("Protect a Tree", "Green Cover", "Put a guard or support around a young tree in your area. Upload a photo.", 80),
    ("Seed Bombing", "Green Cover", "Make and throw seed bombs in an empty patch of land. Upload a photo of the process.", 70),

    # Water Conservation
    ("Fix a Leaking Tap", "Water Conservation", "Fix or report a leaking tap at home or in public. Upload a photo of the fixed tap.", 60),
    ("Take a Short Shower", "Water Conservation", "Limit your shower to under 5 minutes today. Upload a photo of a timer as proof.", 30),
    ("Rainwater Collection", "Water Conservation", "Set up a rainwater collection container at home. Upload a photo.", 90),
    ("Reuse Water", "Water Conservation", "Reuse water from washing vegetables or rice to water plants. Upload a photo.", 40),
    ("Turn Off Tap While Brushing", "Water Conservation", "Turn off the tap while brushing teeth for a full day. Upload a photo as reminder note.", 20),

    # Energy Conservation  
    ("Unplug Unused Devices", "Energy Conservation", "Unplug all unused electronic devices for a full day. Upload a photo of unplugged sockets.", 30),
    ("Use Natural Light", "Energy Conservation", "Spend an entire day using only natural light instead of artificial lights. Upload a photo.", 40),
    ("Air Dry Clothes", "Energy Conservation", "Air dry your clothes instead of using a dryer. Upload a photo of clothes on the line.", 30),
    ("Switch to Cold Water Wash", "Energy Conservation", "Wash clothes with cold water instead of hot. Upload a photo of your washing.", 25),
]
        
        cursor.executemany('''INSERT INTO tasks (title, category, description, points) VALUES(?,?,?,?)''',tasks)

        connect_db.commit()
    connect_db.close()