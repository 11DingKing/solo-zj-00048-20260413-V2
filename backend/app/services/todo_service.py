from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
from app.models.user_model import User
from app.models.todo_model import Todo, Priority
from app.schemas.todo_schema import TodoCreate, TodoUpdate, DailyStats, PriorityStats, StatsResponse
from app.services.todo_share_service import TodoShareService
from beanie.odm.operators.find.logical import Or
from pymongo import ASCENDING, DESCENDING


PRIORITY_ORDER = {
    Priority.urgent: 0,
    Priority.high: 1,
    Priority.normal: 2,
    Priority.low: 3,
}


class TodoService:
    @staticmethod
    async def list_owned_todos(user: User) -> List[Todo]:
        todos = await Todo.find(Todo.owner.id == user.id).to_list()
        todos.sort(key=lambda t: PRIORITY_ORDER.get(t.priority, 2))
        return todos
    
    @staticmethod
    async def list_assigned_todos(user: User) -> List[Todo]:
        todos = await Todo.find(Todo.assignee_id == user.user_id).to_list()
        todos.sort(key=lambda t: PRIORITY_ORDER.get(t.priority, 2))
        return todos
    
    @staticmethod
    async def list_todos(user: User) -> List[Todo]:
        todos = await Todo.find(Todo.owner.id == user.id).to_list()
        todos.sort(key=lambda t: PRIORITY_ORDER.get(t.priority, 2))
        return todos
    
    @staticmethod
    async def create_todo(user: User, data: TodoCreate) -> Todo:
        todo = Todo(**data.dict(), owner=user)
        return await todo.insert()
    
    @staticmethod
    async def retrieve_todo(current_user: User, todo_id: UUID) -> Optional[Todo]:
        todo = await Todo.find_one(Todo.todo_id == todo_id)
        if not todo:
            return None
        
        if todo.owner.id == current_user.id:
            return todo
        
        if todo.assignee_id == current_user.user_id:
            return todo
        
        is_shared = await TodoShareService.is_todo_shared_with_user(todo, current_user)
        if is_shared:
            return todo
        
        return None
    
    @staticmethod
    async def get_todo_by_id(todo_id: UUID) -> Optional[Todo]:
        return await Todo.find_one(Todo.todo_id == todo_id)
    
    @staticmethod
    async def is_owner(user: User, todo: Todo) -> bool:
        return todo.owner.id == user.id
    
    @staticmethod
    async def can_view(user: User, todo: Todo) -> bool:
        if todo.owner.id == user.id:
            return True
        if todo.assignee_id == user.user_id:
            return True
        return await TodoShareService.is_todo_shared_with_user(todo, user)
    
    @staticmethod
    async def can_edit(user: User, todo: Todo) -> bool:
        return todo.owner.id == user.id
    
    @staticmethod
    async def can_edit_status(user: User, todo: Todo) -> bool:
        if todo.owner.id == user.id:
            return True
        if todo.assignee_id == user.user_id:
            return True
        return await TodoShareService.is_todo_shared_with_user(todo, user)
    
    @staticmethod
    async def update_todo(current_user: User, todo_id: UUID, data: TodoUpdate):
        todo = await TodoService.retrieve_todo(current_user, todo_id)
        if not todo:
            return None
        
        is_owner = await TodoService.is_owner(current_user, todo)
        can_edit_status = await TodoService.can_edit_status(current_user, todo)
        
        update_data = data.dict(exclude_unset=True)
        
        if not is_owner:
            if 'title' in update_data or 'description' in update_data or 'priority' in update_data or 'due_date' in update_data or 'assignee_id' in update_data:
                raise PermissionError("You can only modify the status of assigned or shared todos")
            
            if 'status' not in update_data:
                raise PermissionError("You can only modify the status of assigned or shared todos")
        
        if update_data:
            await todo.update({"$set": update_data})
            await todo.save()
        
        return todo
    
    @staticmethod
    async def delete_todo(current_user: User, todo_id: UUID) -> None:
        todo = await TodoService.retrieve_todo(current_user, todo_id)
        if todo and await TodoService.is_owner(current_user, todo):
            await TodoShareService.delete_all_shares_for_todo(todo)
            await todo.delete()
            
        return None
    
    @staticmethod
    async def get_stats(user: User) -> StatsResponse:
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = datetime(start_of_week.year, start_of_week.month, start_of_week.day)
        
        owned_todos = await Todo.find(Todo.owner.id == user.id).to_list()
        assigned_todos = await Todo.find(Todo.assignee_id == user.user_id).to_list()
        
        all_user_todos = owned_todos + [t for t in assigned_todos if t not in owned_todos]
        
        total_count = len(all_user_todos)
        completed_count = sum(1 for t in all_user_todos if t.status)
        completion_rate = (completed_count / total_count * 100) if total_count > 0 else 0.0
        
        this_week_new = sum(1 for t in all_user_todos if t.created_at >= start_of_week)
        
        daily_completed_data = {}
        for i in range(6, -1, -1):
            date = (now - timedelta(days=i)).date()
            daily_completed_data[date.isoformat()] = 0
        
        for todo in all_user_todos:
            if todo.status and todo.updated_at >= week_ago:
                date_str = todo.updated_at.date().isoformat()
                if date_str in daily_completed_data:
                    daily_completed_data[date_str] += 1
        
        daily_completed = [DailyStats(date=k, count=v) for k, v in daily_completed_data.items()]
        
        priority_distribution = PriorityStats(
            urgent=sum(1 for t in all_user_todos if t.priority == Priority.urgent),
            high=sum(1 for t in all_user_todos if t.priority == Priority.high),
            normal=sum(1 for t in all_user_todos if t.priority == Priority.normal),
            low=sum(1 for t in all_user_todos if t.priority == Priority.low),
        )
        
        return StatsResponse(
            total_count=total_count,
            completed_count=completed_count,
            completion_rate=completion_rate,
            this_week_new=this_week_new,
            daily_completed=daily_completed,
            priority_distribution=priority_distribution,
        )
    
    @staticmethod
    async def batch_delete(user: User, todo_ids: List[UUID]) -> int:
        count = 0
        for todo_id in todo_ids:
            todo = await TodoService.retrieve_todo(user, todo_id)
            if todo and await TodoService.is_owner(user, todo):
                await TodoShareService.delete_all_shares_for_todo(todo)
                await todo.delete()
                count += 1
        return count
    
    @staticmethod
    async def batch_update_status(user: User, todo_ids: List[UUID], status: bool) -> int:
        count = 0
        for todo_id in todo_ids:
            todo = await TodoService.retrieve_todo(user, todo_id)
            if todo and await TodoService.can_edit_status(user, todo):
                todo.status = status
                await todo.save()
                count += 1
        return count
    
    @staticmethod
    async def batch_update_priority(user: User, todo_ids: List[UUID], priority: Priority) -> int:
        count = 0
        for todo_id in todo_ids:
            todo = await TodoService.retrieve_todo(user, todo_id)
            if todo and await TodoService.is_owner(user, todo):
                todo.priority = priority
                await todo.save()
                count += 1
        return count
