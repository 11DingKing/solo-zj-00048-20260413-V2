from typing import List, Optional
from uuid import UUID
from app.models.user_model import User
from app.models.todo_model import Todo
from app.models.todo_share_model import TodoShare
from app.schemas.todo_share_schema import TodoShareOut, TodoShareWithTodoOut, TodoShareListOut, TodoShareUserOut
from app.services.user_service import UserService


class TodoShareService:
    @staticmethod
    async def create_share(owner: User, todo: Todo, shared_with_user: User) -> TodoShare:
        existing_share = await TodoShare.find_one(
            TodoShare.todo.id == todo.id,
            TodoShare.shared_with.id == shared_with_user.id
        )
        if existing_share:
            return existing_share
        
        share = TodoShare(
            todo=todo,
            owner=owner,
            shared_with=shared_with_user
        )
        return await share.insert()

    @staticmethod
    async def get_share_by_id(share_id: UUID) -> Optional[TodoShare]:
        return await TodoShare.find_one(TodoShare.share_id == share_id)

    @staticmethod
    async def get_share_by_todo_and_user(todo: Todo, user: User) -> Optional[TodoShare]:
        return await TodoShare.find_one(
            TodoShare.todo.id == todo.id,
            TodoShare.shared_with.id == user.id
        )

    @staticmethod
    async def is_todo_shared_with_user(todo: Todo, user: User) -> bool:
        share = await TodoShareService.get_share_by_todo_and_user(todo, user)
        return share is not None

    @staticmethod
    async def list_shares_by_owner(owner: User) -> List[TodoShare]:
        return await TodoShare.find(TodoShare.owner.id == owner.id).to_list()

    @staticmethod
    async def list_shares_by_todo(todo: Todo) -> List[TodoShare]:
        return await TodoShare.find(TodoShare.todo.id == todo.id).to_list()

    @staticmethod
    async def list_shares_by_shared_user(user: User) -> List[TodoShare]:
        return await TodoShare.find(TodoShare.shared_with.id == user.id).to_list()

    @staticmethod
    async def delete_share(share: TodoShare) -> None:
        await share.delete()

    @staticmethod
    async def delete_share_by_id(share_id: UUID, owner: User) -> bool:
        share = await TodoShare.find_one(
            TodoShare.share_id == share_id,
            TodoShare.owner.id == owner.id
        )
        if share:
            await share.delete()
            return True
        return False

    @staticmethod
    async def delete_all_shares_for_todo(todo: Todo) -> None:
        shares = await TodoShareService.list_shares_by_todo(todo)
        for share in shares:
            await share.delete()

    @staticmethod
    async def to_share_out(share: TodoShare) -> TodoShareOut:
        await share.fetch_all_links()
        return TodoShareOut(
            share_id=share.share_id,
            todo_id=share.todo.todo_id,
            owner_id=share.owner.user_id,
            shared_with_id=share.shared_with.user_id,
            shared_with_email=share.shared_with.email,
            created_at=share.created_at
        )

    @staticmethod
    async def to_share_with_todo_out(share: TodoShare) -> TodoShareWithTodoOut:
        await share.fetch_all_links()
        return TodoShareWithTodoOut(
            share_id=share.share_id,
            todo_id=share.todo.todo_id,
            todo_title=share.todo.title,
            todo_description=share.todo.description,
            todo_status=share.todo.status,
            todo_created_at=share.todo.created_at,
            todo_updated_at=share.todo.updated_at,
            owner_email=share.owner.email,
            created_at=share.created_at
        )

    @staticmethod
    async def to_share_list_out(share: TodoShare) -> TodoShareListOut:
        await share.fetch_all_links()
        return TodoShareListOut(
            share_id=share.share_id,
            shared_with=TodoShareUserOut(
                user_id=share.shared_with.user_id,
                email=share.shared_with.email,
                username=share.shared_with.username
            ),
            created_at=share.created_at
        )
