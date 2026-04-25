from datetime import datetime
from uuid import UUID, uuid4
from beanie import Document, Link, before_event, Replace, Insert
from pydantic import Field
from .user_model import User
from .todo_model import Todo


class TodoShare(Document):
    share_id: UUID = Field(default_factory=uuid4, unique=True)
    todo: Link[Todo]
    owner: Link[User]
    shared_with: Link[User]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<TodoShare {self.share_id}>"

    def __str__(self) -> str:
        return str(self.share_id)

    def __hash__(self) -> int:
        return hash(self.share_id)

    def __eq__(self, other: object) -> bool:
        if isinstance(other, TodoShare):
            return self.share_id == other.share_id
        return False

    @before_event([Replace, Insert])
    def update_created_at(self):
        if not self.created_at:
            self.created_at = datetime.utcnow()

    class Collection:
        name = "todo_shares"
