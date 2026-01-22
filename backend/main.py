from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database
import chat_agent

app = FastAPI()
database.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class UserAuth(BaseModel):
    email: str
    password: str
    name: str = None

class ChatMsg(BaseModel):
    message: str
    user: dict
    history: list = []  # Added this to catch the conversation history


# --- ROUTES ---
@app.post("/register")
async def register(u: UserAuth):
    user = database.create_user(u.email, u.password, u.name)
    if not user: raise HTTPException(400, "Email already exists")
    return user

@app.post("/login")
async def login(u: UserAuth):
    user = database.verify_user(u.email, u.password)
    if not user: raise HTTPException(401, "Invalid Credentials")
    return user


@app.post("/chat")
async def chat(c: ChatMsg):
    # Pass the history to the agent
    response_text = chat_agent.get_chat_response(c.message, c.user, c.history)
    return {"response": response_text}

@app.get("/my-appointments/{user_id}")
async def get_history(user_id: str):
    return database.get_user_appointments(user_id)