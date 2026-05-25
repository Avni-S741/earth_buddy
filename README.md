# 🌍 Earth Buddy 

[![GitHub repo size](https://img.shields.io/github/repo-size/Avni-S741/earth_buddy?color=neon-green&style=flat-square)](https://github.com/Avni-S741/earth_buddy)
[![GitHub contributors](https://img.shields.io/github/contributors/Avni-S741/earth_buddy?color=cyan&style=flat-square)](https://github.com/Avni-S741/earth_buddy/graphs/contributors)

> **"Be the Buddy Earth Needs"** 🌱✨

---

## ⚠️ Problem Statement

Millions of individuals worldwide lack clear, personalized guidance and motivation to reduce their carbon footprint, hindering collective progress towards mitigating climate change. This lack of awareness and engagement jeopardizes not only environmental health but also economic stability and societal well-being, demanding immediate and innovative solutions to empower individuals to become active participants in building a sustainable future.

---

## 💡 Our Solution

**Earth Buddy** tackles the challenge of limited individual engagement in climate action through a dynamic and engaging platform. By gamifying sustainable habits, we motivate and incentivize users to make a real-world impact.

---

## ⚡ Features

* 📝 **Curated Task Lists:** Complete categorized actions (transportation, energy, consumption) to minimize your carbon footprint.
* 📸 **AI Image Verification:** Integrated Sightengine AI to accurately verify user task submissions and distinguish real photos from generated images.
* 🏆 **Leaderboards:** Foster healthy competition and community engagement by tracking your progress against others.
* 🏅 **Badges & Points:** Earn visual rewards that signify your achievements and long-term commitment to sustainability.
* 💻 **Admin Dashboard:** Seamless task management, event creation, and user engagement monitoring, including Top Performer Recognition.
* 🌐 **Social Sharing:** Share your achievements easily to inspire others and raise global awareness.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend Language** | Python |
| **Framework** | FastAPI |
| **Server** | Uvicorn |
| **Database** | SQLite |
| **AI Integration** | Sightengine API |

---

## 🚀 Getting Started

Follow these steps to set up the Earth Buddy backend locally on your machine.

### Prerequisites
* Python (v3.8+)
* Git

### Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Avni-S741/earth_buddy.git
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up API keys (Sightengine):**

- Sign up for an account at https://sightengine.com
- Retrieve your `api_user` and `api_secret`
- Open `routes/tasks_routes.py` in your code editor
- Replace the placeholder credentials with your new API keys

4. **Run the backend server:**
```bash
python -m uvicorn main:app --reload
```

The API will be available at:

```bash
http://127.0.0.1:8000
```

---

## 🔮 Next Steps

To further enhance the community aspect, the following features are in the pipeline:

- 💬 **User Forum / Community:** A dedicated space for sharing experiences, ideas, and sustainability tips.
- 🌱 **User-Generated Content:** Allowing users to post about their personal sustainable activities and campaigns.
- 📊 **Carbon Footprint Tracker:** Get tangible feedback by tracking the total emissions you've reduced compared to the global average.
- 🌐 **Deployment:**The project currently runs locally using FastAPI and SQLite.
     Deployment is planned for a future update.
- 🤖 **AI Task Correctness Verification:** Improve AI verification system using computer vision/object
     detection models to verify whether uploaded images actually match the ecological task being completed.

---

## 🧑‍💻 Team Members

- **Akshat Jain** – Frontend Developer
- **Avni Shrivastava** – Backend Developer

---

Built with 💛 for a sustainable future.
