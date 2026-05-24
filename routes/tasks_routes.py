from fastapi import APIRouter, Depends, UploadFile, File, Form
from db import make_connection
from auth import verify_token

from PIL import Image
import requests
import sqlite3
import os

router = APIRouter()

your_api_user = 518199246
your_api_secret = "vdBPyZwFEbP5E73HXKuQxVNTLMP7eBKZ"

UPLOAD_FOLDER = r"C:\EarthBuddyUploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================
# Compress image
# =========================
def compress_image(image_path):

    img = Image.open(image_path)

    img = img.convert("RGB")

    compressed_path = image_path + "_compressed.jpg"

    img.save(
        compressed_path,
        "JPEG",
        quality=60,
        optimize=True
    )

    return compressed_path


# =========================
# Get all tasks
# =========================
@router.get("/all")
def get_all_tasks(
    current_user: str = Depends(verify_token)
):

    connect_db = make_connection()

    cursor = connect_db.cursor()

    cursor.execute("SELECT * FROM tasks")

    tasks = cursor.fetchall()

    connect_db.close()

    return {
        "tasks": [dict(task) for task in tasks]
    }


# =========================
# Complete task
# =========================
@router.post("/complete/")
def complete_task(
    task_id: int = Form(...),
    image: UploadFile = File(...),
    current_user: str = Depends(verify_token)
):

    try:

      

        # =========================
        # Read file
        # =========================
        content = image.file.read()

        if not content:
            return {
                "verified": False,
                "msg": "Empty image file"
            }

        image_path = f"{UPLOAD_FOLDER}/{current_user}_{task_id}_{image.filename}"

        with open(image_path, "wb") as f:
            f.write(content)


        # =========================
        # Compress image
        # =========================
        try:

            compressed_path = compress_image(image_path)

            

        except Exception as img_error:

            print("IMAGE ERROR:", str(img_error))

            return {
                "verified": False,
                "msg": "Invalid or corrupted image"
            }

# =========================
# AI Detection
# =========================

        try:

                with open(compressed_path, "rb") as img:

                   response = requests.post(
                   "https://api.sightengine.com/1.0/check.json",
                   data={
                   "models": "genai",
                   "api_user": your_api_user,
                   "api_secret": your_api_secret
                },
                files={
                "media": img
            },
            timeout=15
        )

                print("AI API STATUS:", response.status_code)

                result = response.json()

                print("AI API RESPONSE:", result)

    # API failure from SightEngine
                if result.get("status") == "failure":

                    return {
                "verified": False,
            "msg": result.get("error", {}).get(
                "message",
                "AI verification failed"
            )
        }

    # Extract actual AI probability
                ai_score = result.get("type", {}).get(
                "ai_generated",
                0
    )

                print("AI SCORE:", ai_score)

        except Exception as api_error:

            print("AI API ERROR:", str(api_error))

            return {
                    "verified": False,
                    "msg": "AI verification service unavailable"
    }
        # =========================
        # If image is real
        # =========================
        if ai_score < 0.5:

            connect_db = make_connection()

            cursor = connect_db.cursor()

            # =========================
            # Get user
            # =========================
            cursor.execute(
                "SELECT id FROM users WHERE username=?",
                (current_user,)
            )

            user = cursor.fetchone()

            if not user:
                return {
                    "verified": False,
                    "msg": "User not found"
                }

            # =========================
            # Get task
            # =========================
            cursor.execute(
                "SELECT points FROM tasks WHERE id=?",
                (task_id,)
            )

            task = cursor.fetchone()

            if not task:
                return {
                    "verified": False,
                    "msg": "Task not found"
                }

            # =========================
            # Current total points
            # =========================
            cursor.execute("""
                SELECT COALESCE(SUM(t.points), 0)
                FROM completions c
                JOIN tasks t ON c.task_id = t.id
                WHERE c.user_id = ?
                AND c.verified = 1
            """, (user["id"],))

            current_total = cursor.fetchone()[0]

            new_total = current_total + task["points"]

            # =========================
            # Insert completion
            # =========================
            cursor.execute("""
                INSERT INTO completions
                (user_id, task_id, image, verified)
                VALUES (?, ?, ?, ?)
            """, (
                user["id"],
                task_id,
                image_path,
                1
            ))

            connect_db.commit()

            # =========================
            # Badges
            # =========================
            badge_thresholds = [
                (500, "Eco Initiate"),
                (1500, "Green Guardian"),
                (3500, "Earth Defender"),
                (5000, "Planet Protector")
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

        # =========================
        # AI generated image
        # =========================
        else:
            
            return {
                "verified": False,
                "msg": "Image appears AI generated"
            }
            

    except Exception as e:

        print("FINAL SERVER ERROR:", str(e))
        os.remove(compressed_path)
        return {
            "verified": False,
            "msg": f"Server error: {str(e)}"
        }
    