from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user_model import User
from app.api.deps.user_deps import get_current_user
from app.schemas.todo_schema import TodoOut, TodoCreate, TodoUpdate
from app.services.todo_service import TodoService
from app.models.todo_model import Todo


todo_router = APIRouter()

@todo_router.get('/', summary="Get all todos of the user", response_model=List[TodoOut])
async def list(current_user: User = Depends(get_current_user)):
    return await TodoService.list_todos(current_user)


@todo_router.post('/create', summary="Create Todo", response_model=Todo)
async def create_todo(data: TodoCreate, current_user: User = Depends(get_current_user)):
    return await TodoService.create_todo(current_user, data)


@todo_router.get('/{todo_id}', summary="Get a todo by todo_id", response_model=TodoOut)
async def retrieve(todo_id: UUID, current_user: User = Depends(get_current_user)):
    todo = await TodoService.retrieve_todo(current_user, todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or you don't have permission to access it"
        )
    return todo


@todo_router.put('/{todo_id}', summary="Update todo by todo_id", response_model=TodoOut)
async def update(todo_id: UUID, data: TodoUpdate, current_user: User = Depends(get_current_user)):
    try:
        todo = await TodoService.update_todo(current_user, todo_id, data)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found or you don't have permission to access it"
            )
        return todo
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@todo_router.delete('/{todo_id}', summary="Delete todo by todo_id")
async def delete(todo_id: UUID, current_user: User = Depends(get_current_user)):
    todo = await TodoService.retrieve_todo(current_user, todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or you don't have permission to access it"
        )
    
    if not await TodoService.is_owner(current_user, todo):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can delete this todo"
        )
    
    await TodoService.delete_todo(current_user, todo_id)
    return None
