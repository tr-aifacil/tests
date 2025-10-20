from __future__ import annotations

import sys
import textwrap
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from .data_store import DataStore
from .models import ClassSession, Client, Teacher

DATE_FORMAT = "%Y-%m-%d %H:%M"


class PilatesApp:
    """Command line Pilates studio scheduling application."""

    def __init__(self, data_path: Path) -> None:
        self.store = DataStore(data_path)

    # ------------------------------------------------------------------
    # Application entry point
    # ------------------------------------------------------------------
    def run(self) -> None:
        banner = textwrap.dedent(
            """
            ==============================
            Pilates Studio Scheduler v1.0
            ==============================
            """
        )
        print(banner)
        while True:
            print("Select a mode:\n1) Teacher\n2) Client\n3) Admin\n4) Exit")
            choice = input("> ").strip()
            if choice == "1":
                self.teacher_mode()
            elif choice == "2":
                self.client_mode()
            elif choice == "3":
                self.admin_mode()
            elif choice == "4":
                print("Até breve! 👋")
                break
            else:
                print("Opção inválida. Tente novamente.\n")

    # ------------------------------------------------------------------
    # Teacher mode
    # ------------------------------------------------------------------
    def teacher_mode(self) -> None:
        teacher = self._select_teacher()
        if not teacher:
            return

        while True:
            print(
                textwrap.dedent(
                    """
                    --- Menu Professor ---
                    1) Ver aulas atribuídas
                    2) Marcar presenças/faltas
                    3) Relatório rápido de assiduidade
                    4) Voltar
                    """
                )
            )
            choice = input("> ").strip()
            if choice == "1":
                self._list_sessions_for_teacher(teacher.teacher_id)
            elif choice == "2":
                self._teacher_mark_attendance(teacher.teacher_id)
            elif choice == "3":
                self._teacher_attendance_report(teacher.teacher_id)
            elif choice == "4":
                break
            else:
                print("Opção inválida.\n")

    def _teacher_mark_attendance(self, teacher_id: str) -> None:
        sessions = self._list_sessions_for_teacher(teacher_id, return_sessions=True)
        if not sessions:
            print("Sem aulas para gerir.\n")
            return
        idx = self._ask_index(len(sessions))
        if idx is None:
            return
        session = sessions[idx]
        for client_id in session.enrolled_clients:
            client = self.store.get_client(client_id)
            if not client:
                continue
            prompt = f"{client.name} (P=presente, F=falta, A=atraso)"
            status = input(prompt + ": ").strip().upper() or "P"
            if status not in {"P", "F", "A"}:
                status = "P"
            session.mark_attendance(client_id, status)
        self.store.upsert_session(session)
        print("Registos actualizados!\n")

    def _teacher_attendance_report(self, teacher_id: str) -> None:
        sessions = [
            s for s in self.store.list_sessions() if s.teacher_id == teacher_id
        ]
        if not sessions:
            print("Sem aulas registadas.\n")
            return
        total = 0
        present = 0
        for session in sessions:
            for status in session.attendance.values():
                total += 1
                if status == "P":
                    present += 1
        taxa = (present / total * 100) if total else 0
        print(f"Taxa de presença geral: {taxa:.1f}% ({present}/{total})\n")

    # ------------------------------------------------------------------
    # Client mode
    # ------------------------------------------------------------------
    def client_mode(self) -> None:
        client = self._select_client(create_if_missing=True)
        if not client:
            return
        while True:
            print(
                textwrap.dedent(
                    """
                    --- Menu Cliente ---
                    1) Ver minhas aulas
                    2) Avisar falta
                    3) Confirmar presença
                    4) Reagendar com crédito
                    5) Ver calendário disponível
                    6) Estado da mensalidade
                    7) Voltar
                    """
                )
            )
            choice = input("> ").strip()
            if choice == "1":
                self._client_list_sessions(client.client_id)
            elif choice == "2":
                self._client_notify_absence(client)
            elif choice == "3":
                self._client_confirm_presence(client)
            elif choice == "4":
                self._client_reschedule(client)
            elif choice == "5":
                self._list_all_sessions()
            elif choice == "6":
                self._show_payments(client.client_id)
            elif choice == "7":
                break
            else:
                print("Opção inválida.\n")

    def _client_list_sessions(self, client_id: str) -> List[ClassSession]:
        sessions = [
            s
            for s in self.store.list_sessions()
            if client_id in s.enrolled_clients and s.start_time >= datetime.now()
        ]
        sessions.sort(key=lambda s: s.start_time)
        if not sessions:
            print("Sem aulas agendadas.\n")
            return []
        for idx, session in enumerate(sessions, start=1):
            teacher = self.store.get_teacher(session.teacher_id)
            teacher_name = teacher.name if teacher else "(professor desconhecido)"
            print(
                f"{idx}) {session.title} com {teacher_name} - "
                f"{session.start_time.strftime(DATE_FORMAT)}"
            )
        print()
        return sessions

    def _client_notify_absence(self, client: Client) -> None:
        sessions = self._client_list_sessions(client.client_id)
        if not sessions:
            return
        idx = self._ask_index(len(sessions))
        if idx is None:
            return
        session = sessions[idx]
        session.drop_client(client.client_id)
        client.make_up_credits += 1
        self._promote_waiting_client(session)
        self.store.upsert_session(session)
        self.store.upsert_client(client)
        print(
            "Falta registada e crédito de reposição atribuído. "
            "Contactaremos a lista de espera.\n"
        )

    def _client_confirm_presence(self, client: Client) -> None:
        sessions = self._client_list_sessions(client.client_id)
        if not sessions:
            return
        idx = self._ask_index(len(sessions))
        if idx is None:
            return
        session = sessions[idx]
        session.mark_attendance(client.client_id, "P")
        self.store.upsert_session(session)
        print("Presença antecipada registada. Obrigado!\n")

    def _client_reschedule(self, client: Client) -> None:
        if client.make_up_credits <= 0:
            print("Não possui créditos de reposição disponíveis.\n")
            return
        available = [
            s
            for s in self.store.list_sessions()
            if s.start_time >= datetime.now()
            and client.client_id not in s.enrolled_clients
            and s.available_spots() > 0
        ]
        available.sort(key=lambda s: s.start_time)
        if not available:
            print("Não existem aulas com vagas neste momento.\n")
            return
        for idx, session in enumerate(available, start=1):
            teacher = self.store.get_teacher(session.teacher_id)
            teacher_name = teacher.name if teacher else "(professor desconhecido)"
            print(
                f"{idx}) {session.title} - {session.start_time.strftime(DATE_FORMAT)} "
                f"com {teacher_name} (vagas: {session.available_spots()})"
            )
        choice = self._ask_index(len(available))
        if choice is None:
            return
        session = available[choice]
        if session.enrol_client(client.client_id):
            client.make_up_credits -= 1
            self.store.upsert_session(session)
            self.store.upsert_client(client)
            print("Reposição marcada com sucesso!\n")
        else:
            print("Vaga indisponível, ficou em lista de espera.\n")

    # ------------------------------------------------------------------
    # Admin mode
    # ------------------------------------------------------------------
    def admin_mode(self) -> None:
        while True:
            print(
                textwrap.dedent(
                    """
                    --- Menu Administrador ---
                    1) Adicionar/editar cliente
                    2) Adicionar/editar professor
                    3) Criar aula
                    4) Mudar aluno de aula
                    5) Registar mensalidade
                    6) Relatórios de ocupação
                    7) Consultar pagamentos
                    8) Voltar
                    """
                )
            )
            choice = input("> ").strip()
            if choice == "1":
                self._admin_add_client()
            elif choice == "2":
                self._admin_add_teacher()
            elif choice == "3":
                self._admin_create_session()
            elif choice == "4":
                self._admin_move_client()
            elif choice == "5":
                self._admin_record_payment()
            elif choice == "6":
                self._admin_occupancy_report()
            elif choice == "7":
                self._admin_consult_payments()
            elif choice == "8":
                break
            else:
                print("Opção inválida.\n")

    def _admin_add_client(self) -> None:
        client_id = input("ID do cliente (enter para gerar automático): ").strip()
        if not client_id:
            client_id = uuid.uuid4().hex[:8]
        name = input("Nome: ").strip() or "Cliente sem nome"
        email = input("Email: ").strip()
        active = input("Mensalidade activa? (s/n) ").strip().lower() != "n"
        notes = input("Notas adicionais: ").strip()
        client = Client(
            client_id=client_id,
            name=name,
            email=email,
            active_membership=active,
            notes=notes,
        )
        self.store.upsert_client(client)
        print(f"Cliente {client.name} guardado com sucesso!\n")

    def _admin_add_teacher(self) -> None:
        teacher_id = input("ID do professor (enter para gerar automático): ").strip()
        if not teacher_id:
            teacher_id = uuid.uuid4().hex[:8]
        name = input("Nome: ").strip() or "Professor sem nome"
        specialties = input("Especialidades (separadas por vírgula): ").split(",")
        specialties = [s.strip() for s in specialties if s.strip()]
        teacher = Teacher(teacher_id=teacher_id, name=name, specialties=specialties)
        self.store.upsert_teacher(teacher)
        print(f"Professor {teacher.name} guardado com sucesso!\n")

    def _admin_create_session(self) -> None:
        title = input("Nome da aula: ").strip() or "Aula de Pilates"
        teacher = self._select_teacher(create_if_missing=True)
        if not teacher:
            print("Necessário ter um professor.\n")
            return
        start = self._ask_datetime("Data e hora (YYYY-MM-DD HH:MM): ")
        if not start:
            return
        duration = self._ask_int("Duração em minutos: ", default=60)
        capacity = self._ask_int("Capacidade: ", default=10)
        session = ClassSession(
            session_id=uuid.uuid4().hex[:8],
            title=title,
            teacher_id=teacher.teacher_id,
            start_time=start,
            duration_minutes=duration,
            capacity=capacity,
        )
        self.store.upsert_session(session)
        print("Aula criada com sucesso!\n")

    def _admin_move_client(self) -> None:
        client = self._select_client()
        if not client:
            return
        print("Selecionar aula de origem:")
        sessions = [
            s
            for s in self.store.list_sessions()
            if client.client_id in s.enrolled_clients
        ]
        if not sessions:
            print("Cliente não está matriculado em nenhuma aula.\n")
            return
        for idx, session in enumerate(sessions, start=1):
            print(f"{idx}) {session.title} em {session.start_time.strftime(DATE_FORMAT)}")
        origin_idx = self._ask_index(len(sessions))
        if origin_idx is None:
            return
        origin = sessions[origin_idx]

        print("Selecionar aula de destino:")
        destinations = [
            s for s in self.store.list_sessions() if s.session_id != origin.session_id
        ]
        if not destinations:
            print("Não há outras aulas disponíveis.\n")
            return
        for idx, session in enumerate(destinations, start=1):
            print(
                f"{idx}) {session.title} ({session.start_time.strftime(DATE_FORMAT)}) "
                f"- vagas: {session.available_spots()}"
            )
        dest_idx = self._ask_index(len(destinations))
        if dest_idx is None:
            return
        destination = destinations[dest_idx]

        origin.drop_client(client.client_id)
        enrol_success = destination.enrol_client(client.client_id)
        self.store.upsert_session(origin)
        self.store.upsert_session(destination)
        if enrol_success:
            print("Aluno movido com sucesso!\n")
        else:
            print("Destino sem vagas, aluno ficou em lista de espera.\n")

    def _admin_record_payment(self) -> None:
        client = self._select_client()
        if not client:
            return
        month = input("Mês de referência (YYYY-MM): ").strip() or datetime.now().strftime(
            "%Y-%m"
        )
        amount = float(input("Valor pago: ").strip() or "0")
        status = input("Estado (pago/em aberto/atrasado): ").strip() or "pago"
        self.store.record_payment(client.client_id, month, amount, status)
        if status.lower() == "pago":
            client.active_membership = True
        elif status.lower() == "atrasado":
            client.active_membership = False
        self.store.upsert_client(client)
        print("Pagamento registado!\n")

    def _admin_occupancy_report(self) -> None:
        sessions = sorted(self.store.list_sessions(), key=lambda s: s.start_time)
        if not sessions:
            print("Sem aulas no calendário.\n")
            return
        print("\n--- Ocupação das aulas ---")
        for session in sessions:
            occupancy = (
                len(session.enrolled_clients) / session.capacity * 100
                if session.capacity
                else 0
            )
            print(
                f"{session.title} ({session.start_time.strftime(DATE_FORMAT)}): "
                f"{occupancy:.0f}% ocupação, {session.available_spots()} vagas livres, "
                f"lista de espera: {len(session.waitlist)}"
            )
        print()

    def _admin_consult_payments(self) -> None:
        client_id = input("Filtrar por ID de cliente (enter para todos): ").strip()
        payments = self.store.list_payments(client_id or None)
        if not payments:
            print("Sem pagamentos registados.\n")
            return
        for cid, records in payments.items():
            client = self.store.get_client(cid)
            name = client.name if client else cid
            print(f"Cliente: {name} ({cid})")
            for month, info in sorted(records.items()):
                print(f"  - {month}: {info['status']} ({info['amount']:.2f}€)")
        print()

    # ------------------------------------------------------------------
    # Utility helpers
    # ------------------------------------------------------------------
    def _select_client(self, create_if_missing: bool = False) -> Optional[Client]:
        client_id = input("ID do cliente: ").strip()
        if not client_id and create_if_missing:
            name = input("Nome: ").strip() or "Cliente sem nome"
            email = input("Email: ").strip()
            client = Client(client_id=uuid.uuid4().hex[:8], name=name, email=email)
            self.store.upsert_client(client)
            print(f"Cliente criado com ID {client.client_id}.\n")
            return client
        client = self.store.get_client(client_id)
        if not client:
            print("Cliente não encontrado.\n")
        return client

    def _select_teacher(self, create_if_missing: bool = False) -> Optional[Teacher]:
        teachers = self.store.list_teachers()
        if not teachers and not create_if_missing:
            print("Nenhum professor registado.\n")
            return None
        if not teachers and create_if_missing:
            print("Nenhum professor encontrado, vamos criar um novo.")
            self._admin_add_teacher()
            teachers = self.store.list_teachers()
        if not teachers:
            return None
        for idx, teacher in enumerate(teachers, start=1):
            specialties = ", ".join(teacher.specialties) if teacher.specialties else "-"
            print(f"{idx}) {teacher.name} ({specialties}) [ID: {teacher.teacher_id}]")
        idx = self._ask_index(len(teachers))
        if idx is None:
            return None
        return teachers[idx]

    def _list_sessions_for_teacher(self, teacher_id: str, return_sessions: bool = False):
        sessions = [
            s
            for s in self.store.list_sessions()
            if s.teacher_id == teacher_id and s.start_time >= datetime.now() - timedelta(days=7)
        ]
        sessions.sort(key=lambda s: s.start_time)
        if not sessions:
            print("Nenhuma aula registada.\n")
            return []
        for idx, session in enumerate(sessions, start=1):
            print(
                f"{idx}) {session.title} em {session.start_time.strftime(DATE_FORMAT)} "
                f"- inscritos: {len(session.enrolled_clients)}"
            )
        print()
        return sessions if return_sessions else None

    def _list_all_sessions(self) -> None:
        sessions = sorted(self.store.list_sessions(), key=lambda s: s.start_time)
        if not sessions:
            print("Nenhuma aula disponível.\n")
            return
        for session in sessions:
            teacher = self.store.get_teacher(session.teacher_id)
            teacher_name = teacher.name if teacher else "(professor desconhecido)"
            print(
                f"- {session.title} | {session.start_time.strftime(DATE_FORMAT)} "
                f"| Prof: {teacher_name} | Vagas: {session.available_spots()}"
            )
        print()

    def _promote_waiting_client(self, session: ClassSession) -> None:
        if session.available_spots() <= 0:
            return
        while session.waitlist and session.available_spots() > 0:
            next_client_id = session.waitlist.pop(0)
            session.enrol_client(next_client_id)
            notified_client = self.store.get_client(next_client_id)
            if notified_client:
                print(
                    f"Notificação: {notified_client.name} promovido da lista de espera "
                    f"para a aula {session.title}."
                )

    def _show_payments(self, client_id: str) -> None:
        records = self.store.list_payments(client_id).get(client_id, {})
        if not records:
            print("Sem pagamentos registados.\n")
            return
        print("--- Mensalidades ---")
        for month, info in sorted(records.items()):
            print(f"{month}: {info['status']} ({info['amount']:.2f}€)")
        print()

    def _ask_index(self, size: int) -> Optional[int]:
        raw = input("Escolha um número (enter para cancelar): ").strip()
        if not raw:
            return None
        try:
            idx = int(raw) - 1
        except ValueError:
            print("Entrada inválida.\n")
            return None
        if idx < 0 or idx >= size:
            print("Opção fora de alcance.\n")
            return None
        return idx

    def _ask_datetime(self, prompt: str) -> Optional[datetime]:
        raw = input(prompt).strip()
        if not raw:
            return None
        try:
            return datetime.strptime(raw, DATE_FORMAT)
        except ValueError:
            print("Formato inválido. Utilize YYYY-MM-DD HH:MM.\n")
            return None

    def _ask_int(self, prompt: str, default: int) -> int:
        raw = input(prompt).strip()
        if not raw:
            return default
        try:
            return int(raw)
        except ValueError:
            print("Valor inválido, a usar padrão.")
            return default


def main(argv: Optional[List[str]] = None) -> int:
    data_path = Path("data/pilates_data.json")
    app = PilatesApp(data_path)
    app.run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
