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
    points INTEGER NOT NULL,
    impact TEXT NOT NULL
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

    # cursor.execute("SELECT * FROM completions")

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
    ("Plastic Free Day", "Waste Management", "Spend an entire day without using any single use plastic. Upload a photo of your reusable alternatives.", 50 , "Prevented approximately 5 single-use plastic items from entering landfill or ocean. Single-use plastics take 400-1000 years to decompose."),
    ("Collect and Segregate Waste", "Waste Management", "Segregate your household waste into wet and dry. Upload a photo of segregated bins.", 40, "Proper segregation enables up to 90% of dry waste to be recycled, diverting it from landfill and reducing methane emissions."),
    ("Beach or Park Cleanup", "Waste Management", "Clean up a public space and upload a photo of the waste you collected.", 120, "Community cleanups remove an average of 2-5 kg of waste per session, directly preventing soil and water contamination."),
    ("Say No to Plastic Bag", "Waste Management", "Use only reusable bags for shopping today. Upload a photo of your reusable bag.", 30,"One reusable bag used over its lifetime replaces approximately 500 single-use plastic bags."),
    ("Compost Your Kitchen Waste", "Waste Management", "Start or contribute to a compost pile at home. Upload a photo.", 80, "Composting 1 kg of food waste prevents approximately 0.5 kg of methane emissions — a greenhouse gas 25x more potent than CO2."),
    ("Zero Waste Day", "Waste Management", "Produce zero non-recyclable waste for an entire day. Upload a photo of your empty dustbin.", 100, "The average Indian generates 0.5-1 kg of waste per day. A zero waste day diverts that entirely from landfill."),

    # Air Quality
    ("No Vehicle Day", "Air Quality", "Use no personal vehicle today. Walk, cycle or use public transport. Upload a photo as proof.", 60, "Avoiding a 20 km car trip saves approximately 2.4 kg of CO2. Petrol cars emit ~120g of CO2 per km on average."),
    ("Cycle to Work or College", "Air Quality", "Cycle to your destination instead of using a vehicle. Upload a photo of yourself with your cycle.", 70, "Cycling instead of driving for 10 km saves approximately 1.2 kg of CO2 and produces zero tailpipe emissions."),
    ("Walk Instead of Drive", "Air Quality", "Walk to a nearby destination instead of taking a vehicle. Upload a photo.", 40, "Walking 5 km instead of driving saves approximately 0.6 kg of CO2 and improves personal health simultaneously."),
    ("Switch Off Unnecessary Lights", "Air Quality", "Switch off all unnecessary lights and fans for a full day. Upload a photo of your switchboard.", 30 ,"Switching off a 60W bulb for 8 hours saves approximately 0.05 kg of CO2, based on India's average grid emission factor of 0.82 kg CO2/kWh."),
    ("Carpool Today", "Air Quality", "Share a ride with at least one other person instead of travelling alone. Upload a photo.", 50, "Carpooling with one other person halves per-person CO2 emissions. A 20 km shared trip saves approximately 1.2 kg of CO2 per passenger."),

    # Green Cover
    ("Plant a Sapling", "Green Cover", "Plant a sapling anywhere — home, school, or public space. Upload a photo with it.", 100,"A mature tree absorbs approximately 21-22 kg of CO2 per year. Your sapling begins absorbing carbon from day one."),
    ("Water Existing Plants", "Green Cover", "Water plants in your home or neighbourhood. Upload a photo.", 20, "Maintaining existing plants supports local biodiversity and helps sustain carbon sinks that would otherwise die and decompose, releasing stored CO2."),
    ("Start a Kitchen Garden", "Green Cover", "Start growing any vegetable or herb at home. Upload a photo of your setup.", 90,"A 1 sq metre kitchen garden can produce 2-4 kg of vegetables per season, reducing food transport emissions and packaging waste."),
    ("Protect a Tree", "Green Cover", "Put a guard or support around a young tree in your area. Upload a photo.", 80, "A protected tree absorbs 21-22 kg of CO2 per year over its lifetime. Preventing damage to one tree preserves decades of carbon absorption."),
    ("Seed Bombing", "Green Cover", "Make and throw seed bombs in an empty patch of land. Upload a photo of the process.", 70, "Successful seed germination from one bomb can produce 3-10 plants, each contributing to local biodiversity and carbon absorption over time."),

    # Water Conservation
    ("Fix a Leaking Tap", "Water Conservation", "Fix or report a leaking tap at home or in public. Upload a photo of the fixed tap.", 60, "A tap leaking one drop per second wastes approximately 10,000 litres of water per year. Fixing it immediately stops this loss."),
    ("Rainwater Collection", "Water Conservation", "Set up a rainwater collection container at home. Upload a photo.", 90 , "A basic 200-litre rainwater collection setup can offset 10-15% of a household's daily water needs during monsoon season."),
    ("Reuse Water", "Water Conservation", "Reuse water from washing vegetables or rice to water plants. Upload a photo.", 40,"Reusing washing water for plants saves approximately 5-10 litres per day — water that would otherwise go directly into drainage." ),
    ("Turn Off Tap While Brushing", "Water Conservation", "Turn off the tap while brushing teeth for a full day. Upload a photo as reminder note.", 20 , "Leaving a tap running while brushing wastes approximately 6 litres per minute. Turning it off saves 10-12 litres per brushing session."),

    # Energy Conservation  
    ("Unplug Unused Devices", "Energy Conservation", "Unplug all unused electronic devices for a full day. Upload a photo of unplugged sockets.", 30, "Standby power consumption accounts for 5-10% of household electricity use. Unplugging devices for one day saves approximately 0.1-0.3 kWh."),
    ("Use Natural Light", "Energy Conservation", "Spend an entire day using only natural light instead of artificial lights. Upload a photo.", 40, "Replacing 8 hours of artificial lighting with natural light saves approximately 0.3-0.5 kWh of electricity per day, depending on bulb types used."),
    ("Air Dry Clothes", "Energy Conservation", "Air dry your clothes instead of using a dryer. Upload a photo of clothes on the line.", 30, "A single dryer cycle uses approximately 3-4 kWh of electricity. Air drying eliminates this entirely and extends fabric life."),
    ("Switch to Cold Water Wash", "Energy Conservation", "Wash clothes with cold water instead of hot. Upload a photo of your washing.", 25, "90% of a washing machine's energy goes to heating water. Cold water washing saves approximately 0.5-1 kWh per cycle."),
]
        
        cursor.executemany('''INSERT INTO tasks (title, category, description, points, impact ) VALUES(?,?,?,?,?)''',tasks)

        connect_db.commit()
    connect_db.close()