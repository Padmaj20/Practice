from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

# Allow frontend to access backend
origins = [
    "http://localhost",        # if you open HTML via localhost
    "http://127.0.0.1:5500",  # if using Live Server
    "file://",                 # if opening directly
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use origins list above
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schema
class QuestionBase(BaseModel):
    question_text: str
    answer_text: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# Get a single question by ID
@app.get("/question/{question_id}")
async def read_question(question_id: int, db: db_dependency):
    result = db.query(models.Questions).filter(models.Questions.id == question_id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Question not found')
    return result

# Get all questions
@app.get("/questions/")
async def read_all_questions(db: db_dependency):
    results = db.query(models.Questions).all()
    return results

# Create a question
@app.post("/question/")
async def create_question(question: QuestionBase, db: db_dependency):
    db_question = models.Questions(
        question_text=question.question_text,
        answer_text=question.answer_text
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

# Update a question
@app.put("/question/{question_id}")
async def update_question(question_id: int, question: QuestionBase, db: db_dependency):
    db_question = db.query(models.Questions).filter(models.Questions.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    db_question.question_text = question.question_text
    db_question.answer_text = question.answer_text
    db.commit()
    db.refresh(db_question)
    return db_question

# Delete a question
@app.delete("/question/{question_id}")
async def delete_question(question_id: int, db: db_dependency):
    db_question = db.query(models.Questions).filter(models.Questions.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(db_question)
    db.commit()
    return {"detail": "Question deleted successfully"}
