from typing import List, Optional
from uuid import UUID
from app.models.user_model import User
from app.models.todo_model import Todo
from app.schemas.todo_schema import TodoCreate, TodoUpdate
from app.services.todo_share_service import TodoShareService


class TodoService:
    @staticmethod
    async def list_todos(user: User) -> List[Todo]:
        todos = await Todo.find(Todo.owner.id == user.id).to_list()
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
        return await TodoShareService.is_todo_shared_with_user(todo, user)
    
    @staticmethod
    async def can_edit(user: User, todo: Todo) -> bool:
        return todo.owner.id == user.id
    
    @staticmethod
    async def can_edit_status(user: User, todo: Todo) -> bool:
        if todo.owner.id == user.id:
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
            if 'title' in update_data or 'description' in update_data:
                raise PermissionError("You can only modify the status of shared todos")
            
            if 'status' not in update_data:
                raise PermissionError("You can only modify the status of shared todos")
        
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
