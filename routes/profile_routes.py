from fastapi import APIRouter, Depends
from auth import verify_token
from db import make_connection

router=APIRouter()

@router.get("/")
def get_profile(user:str=Depends(verify_token)):
    connect_db=make_connection()
    cursor=connect_db.cursor()

    cursor.execute("SELECT ")