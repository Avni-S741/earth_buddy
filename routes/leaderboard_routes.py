from fastapi import APIRouter, Depends
from auth import verify_token
from db import make_connection

router= APIRouter()

@router.get("/")
def get_leaderboard(current_user:str=Depends(verify_token)):
    connect_db=make_connection()
    cursor=connect_db.cursor()

    cursor.execute('''SELECT u.username, SUM(t.points) as total_points
                    FROM completions c
                    JOIN tasks t ON c.task_id = t.id
                    JOIN users u ON c.user_id = u.id
                    WHERE c.verified = 1
                    GROUP BY c.user_id
                    ORDER BY total_points DESC''')
    rows=cursor.fetchall()
    connect_db.close()

    leaderboard=[]
    for rank, row in enumerate(rows,start=1):
        leaderboard.append({
            "rank":rank,
            "username":row["username"],
            "total_points":row["total_points"]}
        )

    return { "leaderboard" : leaderboard }