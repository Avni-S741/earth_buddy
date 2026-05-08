from fastapi import APIRouter, Depends, UploadFile, File, Form
from db import make_connection
import os
from PIL import Image
import io
import requests
from auth import verify_token

router=APIRouter()

your_api_user=518199246
your_api_secret="vdBPyZwFEbP5E73HXKuQxVNTLMP7eBKZ"
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


@router.post("/complete/")
def complete_task(task_id:int=Form(...),
                  image: UploadFile=File(...),
                  current_user: str= Depends(verify_token)):
    image_path = f"{UPLOAD_FOLDER}/{current_user}_{task_id}_{image.filename}"
    content=image.file.read()
    if not content:
        return{"verified":False,"msg":"Empty / Corrupted file...."}
    
    with open(image_path, "wb") as f:
        f.write(content)

    compressed_path = compress_image(image_path)
    with open(compressed_path, "rb") as img:
       response = requests.post(
        "https://api.sightengine.com/1.0/check.json",
        data={
            "models": "genai",
            "api_user": your_api_user,
            "api_secret": your_api_secret
        },
        files={"media": img}
    )
    try:
        result = response.json()
        ai_score = result.get("type", {}).get("ai_generated", 1)
    except:
        return {"verified":False,"msg":"AI check failed"}

    if ai_score < 0.5:  # real photo
        connect_db = make_connection()
        cursor = connect_db.cursor()

        # Get user id
        cursor.execute("SELECT id FROM users WHERE username=?", (current_user,))
        user = cursor.fetchone()

        # Get task points
        cursor.execute("SELECT points FROM tasks WHERE id=?", (task_id,))
        task = cursor.fetchone()

        # Get current total points BEFORE insertion
        cursor.execute("""
            SELECT COALESCE(SUM(t.points), 0)
            FROM completions c
            JOIN tasks t ON c.task_id = t.id
            WHERE c.user_id = ? AND c.verified = 1
            """, (user["id"],))
        current_total = cursor.fetchone()[0]
        new_total = current_total + task["points"]

        # Insert the completion
        cursor.execute(
            "INSERT INTO completions(user_id, task_id, image, verified) VALUES (?,?,?,?)",
            (user["id"], task_id, image_path, 1)
        )
        connect_db.commit()

        # Determine new badges
        badge_thresholds = [
            (500, "Eco Initiate"),
            (1500, "Green Guardian"),
            (3500, "Earth Defender"),
            (5000, "Planet Protector"),
        ]
        new_badges = []
        for threshold, badge_name in badge_thresholds:
            if current_total < threshold and new_total >= threshold:
                new_badges.append(badge_name)

        connect_db.close()

        return {
            "verified": True,
            "points_earned": task["points"],
            "total_points": new_total,
            "new_badges": new_badges
        }
    
    else:
        return {
            "verified": False,
            "msg": "Image appears AI generated. No points awarded."
        }

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
