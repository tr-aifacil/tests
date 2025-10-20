from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, List


@dataclass
class Client:
    client_id: str
    name: str
    email: str
    active_membership: bool = True
    notes: str = ""
    make_up_credits: int = 0

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class Teacher:
    teacher_id: str
    name: str
    specialties: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class Admin:
    admin_id: str
    name: str

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class ClassSession:
    session_id: str
    title: str
    teacher_id: str
    start_time: datetime
    duration_minutes: int
    capacity: int
    enrolled_clients: List[str] = field(default_factory=list)
    attendance: Dict[str, str] = field(default_factory=dict)
    waitlist: List[str] = field(default_factory=list)

    def available_spots(self) -> int:
        return max(self.capacity - len(self.enrolled_clients), 0)

    def enrol_client(self, client_id: str) -> bool:
        if client_id in self.enrolled_clients:
            return True
        if len(self.enrolled_clients) >= self.capacity:
            if client_id not in self.waitlist:
                self.waitlist.append(client_id)
            return False
        self.enrolled_clients.append(client_id)
        return True

    def drop_client(self, client_id: str) -> None:
        if client_id in self.enrolled_clients:
            self.enrolled_clients.remove(client_id)
        if client_id in self.waitlist:
            self.waitlist.remove(client_id)
        if client_id in self.attendance:
            del self.attendance[client_id]

    def mark_attendance(self, client_id: str, status: str) -> None:
        if client_id in self.enrolled_clients:
            self.attendance[client_id] = status

    def to_dict(self) -> Dict:
        data = asdict(self)
        data["start_time"] = self.start_time.isoformat()
        return data

    @classmethod
    def from_dict(cls, payload: Dict) -> "ClassSession":
        payload = dict(payload)
        payload["start_time"] = datetime.fromisoformat(payload["start_time"])
        return cls(**payload)
