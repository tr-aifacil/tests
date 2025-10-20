from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from .models import Admin, ClassSession, Client, Teacher


class DataStore:
    """Simple JSON persistence for the pilates scheduler."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._data = {
            "clients": {},
            "teachers": {},
            "admins": {},
            "sessions": {},
            "payments": {},
        }
        if path.exists():
            self._load()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def list_clients(self) -> List[Client]:
        return [Client(**raw) for raw in self._data["clients"].values()]

    def get_client(self, client_id: str) -> Optional[Client]:
        payload = self._data["clients"].get(client_id)
        return Client(**payload) if payload else None

    def upsert_client(self, client: Client) -> None:
        self._data["clients"][client.client_id] = client.to_dict()
        self._save()

    def list_teachers(self) -> List[Teacher]:
        return [Teacher(**raw) for raw in self._data["teachers"].values()]

    def get_teacher(self, teacher_id: str) -> Optional[Teacher]:
        payload = self._data["teachers"].get(teacher_id)
        return Teacher(**payload) if payload else None

    def upsert_teacher(self, teacher: Teacher) -> None:
        self._data["teachers"][teacher.teacher_id] = teacher.to_dict()
        self._save()

    def list_admins(self) -> List[Admin]:
        return [Admin(**raw) for raw in self._data["admins"].values()]

    def upsert_admin(self, admin: Admin) -> None:
        self._data["admins"][admin.admin_id] = admin.to_dict()
        self._save()

    def list_sessions(self) -> List[ClassSession]:
        return [ClassSession.from_dict(raw) for raw in self._data["sessions"].values()]

    def get_session(self, session_id: str) -> Optional[ClassSession]:
        payload = self._data["sessions"].get(session_id)
        return ClassSession.from_dict(payload) if payload else None

    def upsert_session(self, session: ClassSession) -> None:
        self._data["sessions"][session.session_id] = session.to_dict()
        self._save()

    def delete_session(self, session_id: str) -> None:
        self._data["sessions"].pop(session_id, None)
        self._save()

    def record_payment(self, client_id: str, month: str, amount: float, status: str) -> None:
        payments = self._data.setdefault("payments", {})
        client_payments = payments.setdefault(client_id, {})
        client_payments[month] = {"amount": amount, "status": status}
        self._save()

    def list_payments(self, client_id: Optional[str] = None) -> Dict[str, Dict[str, Dict]]:
        payments: Dict[str, Dict[str, Dict]] = self._data.get("payments", {})
        if client_id:
            return {client_id: payments.get(client_id, {})}
        return payments

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------
    def _load(self) -> None:
        payload = json.loads(self.path.read_text())
        for key, value in payload.items():
            self._data[key] = value

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.path.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(self._data, indent=2, sort_keys=True, default=_json_default))
        tmp_path.replace(self.path)


def _json_default(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, "to_dict"):
        return value.to_dict()
    raise TypeError(f"Type {type(value)!r} not serialisable")
