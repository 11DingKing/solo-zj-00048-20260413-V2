from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


class TodoShareCreate(BaseModel):
    todo_id: UUID
    shared_with_email: EmailStr = Field(..., title='Email of user to share with')


class TodoShareOut(BaseModel):
    share_id: UUID
    todo_id: UUID
    owner_id: UUID
    shared_with_id: UUID
    shared_with_email: str
    created_at: datetime


class TodoShareWithTodoOut(BaseModel):
    share_id: UUID
    todo_id: UUID
    todo_title: str
    todo_description: str
    todo_status: bool
    todo_created_at: datetime
    todo_updated_at: datetime
    owner_email: str
    created_at: datetime


class TodoShareUserOut(BaseModel):
    user_id: UUID
    email: str
    username: str


class TodoShareListOut(BaseModel):
    share_id: UUID
    shared_with: TodoShareUserOut
    created_at: datetime
