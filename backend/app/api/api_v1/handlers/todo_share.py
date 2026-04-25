from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user_model import User
from app.api.deps.user_deps import get_current_user
from app.schemas.todo_share_schema import (
    TodoShareCreate, 
    TodoShareOut, 
    TodoShareWithTodoOut,
    TodoShareListOut
)
from app.services.todo_share_service import TodoShareService
from app.services.todo_service import TodoService
from app.services.user_service import UserService
from app.models.todo_model import Todo


todo_share_router = APIRouter()


@todo_share_router.post('/share', summary="Share a todo with another user", response_model=TodoShareOut)
async def share_todo(
    data: TodoShareCreate,
    current_user: User = Depends(get_current_user)
):
    todo = await TodoService.retrieve_todo(current_user, data.todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    shared_with_user = await UserService.get_user_by_email(data.shared_with_email)
    if not shared_with_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email {data.shared_with_email} does not exist"
        )
    
    if shared_with_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot share todo with yourself"
        )
    
    share = await TodoShareService.create_share(current_user, todo, shared_with_user)
    return await TodoShareService.to_share_out(share)


@todo_share_router.delete('/share/{share_id}', summary="Cancel sharing a todo")
async def cancel_share(
    share_id: UUID,
    current_user: User = Depends(get_current_user)
):
    success = await TodoShareService.delete_share_by_id(share_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or you are not the owner"
        )
    return None


@todo_share_router.get('/shared-with-me', summary="Get todos shared with me", response_model=List[TodoShareWithTodoOut])
async def get_shared_with_me(
    current_user: User = Depends(get_current_user)
):
    shares = await TodoShareService.list_shares_by_shared_user(current_user)
    result = []
    for share in shares:
        result.append(await TodoShareService.to_share_with_todo_out(share))
    return result


@todo_share_router.get('/my-shares/{todo_id}', summary="Get all shares for a todo", response_model=List[TodoShareListOut])
async def get_todo_shares(
    todo_id: UUID,
    current_user: User = Depends(get_current_user)
):
    todo = await TodoService.retrieve_todo(current_user, todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    shares = await TodoShareService.list_shares_by_todo(todo)
    result = []
    for share in shares:
        result.append(await TodoShareService.to_share_list_out(share))
    return result
