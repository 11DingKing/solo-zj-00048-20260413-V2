from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field
from enum import Enum


class Priority(str, Enum):
    urgent = "urgent"
    high = "high"
    normal = "normal"
    low = "low"


class TodoCreate(BaseModel):
    title: str = Field(..., title='Title', max_length=55, min_length=1)
    description: str = Field(..., title='Title', max_length=755, min_length=1)
    status: Optional[bool] = False
    priority: Priority = Priority.normal
    due_date: Optional[datetime] = None
    assignee_id: Optional[UUID] = None
    
    
class TodoUpdate(BaseModel):
    title: Optional[str] = Field(..., title='Title', max_length=55, min_length=1)
    description: Optional[str] = Field(..., title='Title', max_length=755, min_length=1)
    status: Optional[bool] = False
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[UUID] = None


class TodoOut(BaseModel):
    todo_id: UUID
    status: bool
    title: str
    description: str
    priority: Priority
    due_date: Optional[datetime]
    assignee_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    

class BatchDeleteRequest(BaseModel):
    todo_ids: List[UUID]


class BatchUpdateStatusRequest(BaseModel):
    todo_ids: List[UUID]
    status: bool


class BatchUpdatePriorityRequest(BaseModel):
    todo_ids: List[UUID]
    priority: Priority


class DailyStats(BaseModel):
    date: str
    count: int


class PriorityStats(BaseModel):
    urgent: int
    high: int
    normal: int
    low: int


class StatsResponse(BaseModel):
    total_count: int
    completed_count: int
    completion_rate: float
    this_week_new: int
    daily_completed: List[DailyStats]
    priority_distribution: PriorityStats
