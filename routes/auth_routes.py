from fastapi import APIRouter,Depends
import sqlite3
from pydantic import BaseModel
from db import make_connection
from auth import hash_password, create_token, verify_password, verify_token

router = APIRouter()

class RegisterUser(BaseModel):
    name: str
    username: str
    password: str

@router.post("/register")
def register(user: RegisterUser):
    connect_db = make_connection()
    cursor = connect_db.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
            (user.name, user.username, hash_password(user.password))
        )
        connect_db.commit()
        return {"message": "Account created successfully"}

    except sqlite3.IntegrityError:
        return {"error": "Username already taken"}
    except Exception as e:
        return {"error": str(e)}

    finally:
        connect_db.close()


class LoginUser(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(user: LoginUser):
    connect_db = make_connection()
    cursor = connect_db.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        (user.username,)
    )
    db_user = cursor.fetchone()
    connect_db.close()

    if not db_user:
        return {"error": "User not found"}

    if not verify_password(user.password, db_user["password"]):
        return {"error": "Wrong password"}

    token = create_token(user.username)
    return {"access_token": token, "username": user.username}


@router.get("/profile")
def get_profile(current_user: str = Depends(verify_token)):
    return {"logged_in_as": current_user}