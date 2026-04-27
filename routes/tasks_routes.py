from fastapi import APIRouter, Depends, UploadFile, File, Form
from db import make_connection
import os
from PIL import Image
import io
import requests
from auth import verify_token

router=APIRouter()

AIORNOT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlYWMzYzYwLWI2MGUtNDI3OS05MTNjLWZmODk3YWVmYjFiOCIsInVzZXJfaWQiOiIwZWI1YzVmNy0wZTM4LTQ4YWItYjNkNi1lMTE0NjRlMzAxZjEiLCJhdWQiOiJhY2Nlc3MiLCJleHAiOjE5OTgwODY0MDAsInNjb3BlIjoiYWxsIn0.XDA8L8BALJSPWq6q9SAITVGGIdPYmjWtDEhIZzLEbgo"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)



def compress_image(image_path):
    img = Image.open(image_path)
    img = img.convert("RGB")
    compressed_path = image_path + "_compressed.jpg"
    img.save(compressed_path, "JPEG", quality=60, optimize=True)
    return compressed_path


@router.get("/all")
def get_all_tasks (current_user: str= Depends(verify_token)):
    connect_db = make_connection()
    cursor = connect_db.cursor()

    cursor.execute('''SELECT * FROM tasks''')
    tasks=cursor.fetchall()
    connect_db.close()

    return {"tasks":[dict(task) for task in tasks] }

# fetch("http://127.0.0.1:8000/tasks/all", {
#     headers: {"Authorization": "Bearer YOUR_TOKEN_HERE"}
# }).then(r => r.json()).then(d => console.log(d))


@router.post("/complete")
def complete_task(task_id:int=Form(...),
                  image: UploadFile=File(...),
                  current_user: str= Depends(verify_token)):
    image_path = f"{UPLOAD_FOLDER}/{current_user}_{task_id}_{image.filename}"
    with open(image_path, "wb") as f:
        f.write(image.file.read())

    compressed_path = compress_image(image_path)
    with open(compressed_path, "rb") as img:
        response=requests.post(
            "https://api.aiornot.com/v1/reports/image",
            headers={"Authorization": f"Bearer {AIORNOT_API_KEY}"},
            files={"object": img}
        )
        result=response.json()
        verdict=result.get("report",{}).get("verdict","ai")

    if verdict=="human":
        connect_db=make_connection()
        cursor=connect_db.cursor()

        cursor.execute("SELECT id FROM users WHERE username=?",(current_user,))
        user=cursor.fetchone()

        cursor.execute("SELECT points FROM tasks WHERE id=?",(task_id,))
        task=cursor.fetchone()

        cursor.execute("INSERT INTO completions(user_id,task_id,image,verified) VALUES (?,?,?,?)", (user["id"], task_id, image_path, 1))

        connect_db.commit()
        connect_db.close()

        return {"verified": True, "points_earned":task["points"]}
    else:
        return {"verified": False, "msg":"Image appears ai. Hence no points will be awarded..."}
    

# const formData = new FormData()
# formData.append("task_id", 1)
# const fileInput = document.createElement('input')
# fileInput.type = 'file'
# fileInput.onchange = async (e) => {
#     formData.append("image", e.target.files[0])
#     const r = await fetch("http://127.0.0.1:8000/tasks/complete", {
#         method: "POST",
#         headers: {"Authorization": "Bearer YOUR_TOKEN_HERE"},
#         body: formData
#     })
#     console.log(await r.json())
# }
# fileInput.click()
