from fastapi import APIRouter, Depends
from auth import verify_token
from db import make_connection

router=APIRouter()

@router.get("/")
def get_profile(current_user:str=Depends(verify_token)):
    connect_db=make_connection()
    cursor=connect_db.cursor()

    cursor.execute("SELECT name, username, email FROM users WHERE username=?",(current_user,))
    user=cursor.fetchone()

    cursor.execute("""
        SELECT SUM(t.points) as total_points
        FROM completions c
        JOIN tasks t ON c.task_id = t.id
        WHERE c.user_id = (SELECT id FROM users WHERE username = ?)
        AND c.verified = 1
    """, (current_user,))
    points_row = cursor.fetchone()
    total_points = points_row["total_points"] or 0

    cursor.execute("""
        SELECT t.title, t.category, t.points, c.completed_at
        FROM completions c
        JOIN tasks t ON c.task_id = t.id
        WHERE c.user_id = (SELECT id FROM users WHERE username = ?)
        AND c.verified = 1
        ORDER BY c.completed_at DESC
    """, (current_user,))
    completed_tasks = [dict(row) for row in cursor.fetchall()]

    badges = []
    if total_points >= 500:
        badges.append("Eco Initiate")
    if total_points >= 1500:
        badges.append("Green Guardian")
    if total_points >= 3500:
        badges.append("Earth Defender")
    if total_points >= 5000:
        badges.append("Planet Protector")

    connect_db.close()

    return {
        "email":user["email"],
        "username":user["username"],
        "name":user["name"],
        "total_points":total_points,
        "badges":badges,
        "completed_tasks":completed_tasks
    }