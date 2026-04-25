from fastapi import APIRouter, Depends
from db import make_connection
from auth import verify_token

router=APIRouter()

@router.get("/all")
def get_all_tasks (current_user: str= Depends(verify_token)):
    connect_db = make_connection()
    cursor = connect_db.cursor()

    cursor.execute('''SELECT * FROM tasks''')
    tasks=cursor.fetchall()
    connect_db.close()

    return {"tasks":[dict(task) for task in tasks] }


