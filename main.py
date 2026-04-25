from fastapi import FastAPI
from db import init_db,seed_tasks
from routes.auth_routes import router as auth_router

app=FastAPI()

init_db()
seed_tasks()

app.include_router(auth_router, prefix="/auth")
