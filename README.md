# Pilates Scheduler App

Aplicação de linha de comando para gerir aulas de pilates com três perfis principais: professor, cliente e administrador. Permite calendarizar aulas, gerir listas de espera, controlar assiduidade, reagendar faltas, e monitorizar pagamentos de mensalidades.

## Funcionalidades principais

- **Modo Professor**
  - Visualização das aulas atribuídas.
  - Registo de presenças, faltas e atrasos por aluno.
  - Relatório rápido de taxa de assiduidade.

- **Modo Cliente**
  - Consulta das aulas futuras nas quais está inscrito.
  - Aviso de falta com atribuição automática de crédito de reposição.
  - Confirmação antecipada de presença.
  - Reagendamento utilizando créditos de reposição em aulas com vagas.
  - Consulta do calendário completo e do estado das mensalidades.

- **Modo Administrador**
  - Registo e edição de clientes e professores.
  - Criação e gestão de aulas (capacidade, horários e professores).
  - Movimentação de alunos entre aulas, com suporte a lista de espera.
  - Registo e consulta de pagamentos de mensalidades.
  - Relatórios de ocupação para apoiar decisões de planeamento.

Outras funcionalidades incluem promoção automática de alunos da lista de espera quando uma vaga é libertada, gestão de créditos de reposição e armazenamento persistente em ficheiro JSON.

## Requisitos

- Python 3.10+

## Como executar

1. Instale as dependências padrão da biblioteca standard (nenhuma dependência externa é necessária).
2. No directório do projecto, execute:

   ```bash
   python -m pilates_app.app
   ```

Os dados são guardados em `data/pilates_data.json`. Pode apagar este ficheiro para reiniciar o estado da aplicação.
