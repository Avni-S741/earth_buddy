from fastapi import FastAPI
from db import init_db,seed_tasks
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.tasks_routes import router as task_router
from routes.leaderboard_routes import router as leaderboard_router

from routes.profile_routes import router as profile_router


app=FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

init_db()
seed_tasks()

app.include_router(auth_router, prefix= "/auth")
app.include_router(task_router, prefix= "/tasks")
app.include_router(leaderboard_router, prefix= "/leaderboard")
app.include_router(profile_router,prefix="/profile")

# for route in app.routes:
#     print(route.path, route.methods)