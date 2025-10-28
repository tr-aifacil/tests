# Pilates Studio PWA

Aplicação **Progressive Web App (PWA)** construída com Expo e React Native Web que replica o visual da App Studio e liga os fluxos de agendamento de Pilates a um backend Supabase. O projecto pode ser instalado como app em smartphones/tablets ou usado directamente no browser, mantendo os modos Professor, Cliente, Minhas Aulas, Perfil e Admin.

## Funcionalidades principais

- **Autenticação Supabase (email/senha)** com gestão de sessão centralizada e persistência no dispositivo.
- **Dashboard do Professor** com métricas semanais, presenças em tempo-real e gestão de lotação/lista de espera via RPCs.
- **Experiência do Cliente** com destaques de créditos, próximas aulas e acções rápidas para reservar/cancelar.
- **Ecrã Minhas Aulas** que agrega histórico e reservas futuras do utilizador autenticado.
- **Perfil** com saldo e extrato de créditos (`credit_wallet`/`credit_ledger`).
- **Admin** mantém atalhos e indicadores operacionais em linha com o visual original.
- **Preparação para notificações push** (captura de token nas plataformas nativas e armazenamento em `profiles.push_token`).

## Estrutura do projecto

```
mobile_app/
├── App.js                 # Shell Expo com navegação por tabs dependente do perfil
├── app.json               # Configuração Expo (inclui metadata PWA)
├── package.json           # Scripts Expo (start, web, build:web)
├── web/                   # Assets PWA (manifest, service worker, icons)
└── src/
    ├── components/        # Cartões, métricas, tabs e cabeçalho reutilizáveis
    ├── lib/               # Clientes Supabase e helpers de notificações/push
    ├── screens/           # Fluxos Teacher/Client/Admin/MyClasses/Profile/Login
    ├── store/             # Auth store com persistência de sessão
    ├── theme/             # Paleta partilhada com gradientes e destaques
    └── utils/             # Formatadores de datas/horas e labels
```

O backend encontra-se em `supabase/migrations/0001_init.sql`, com tabelas, políticas RLS e funções `book_session`/`cancel_booking`.

## Executar em modo desenvolvimento (web/PWA)

```bash
cd mobile_app
npm install
npm run web
```

A app abre em `http://localhost:19006` com hot reload. Para instalar como PWA no browser, usa a opção "Adicionar ao ecrã inicial" ou "Instalar" disponível nos browsers compatíveis.

### Construir distribuição estática

```bash
npm run build:web
```

Gera `dist/` com artefactos prontos para deploy numa CDN/hosting estático (inclui manifest e service worker).

## Integração Supabase

1. Cria um projecto em [Supabase](https://supabase.com/) e define as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` em `mobile_app/app.json` (ou via `app.config.js`/variáveis de ambiente para produção).
2. Executa as migrations em `supabase/migrations/0001_init.sql`.
3. Cria utilizadores pela dashboard do Supabase (Auth > Users) e associa perfis (`profiles.role`).
4. Opcional: credita valores na `credit_wallet`/`credit_ledger` para testar reservas e devoluções.

Após autenticação, as queries no frontend carregam dados em tempo-real de `sessions_with_availability`, `enrollments` e `credit_ledger`, enquanto os botões de reserva/cancelamento disparam as RPCs `book_session` e `cancel_booking`.

## Notas sobre PWA

- O manifest (`mobile_app/web/manifest.json`) define `display: standalone`, ícones e temas alinhados com o visual escuro App Studio.
- `mobile_app/web/service-worker.js` implementa cache básico do shell e fallback offline.
- `mobile_app/App.js` garante `minHeight: 100vh` (no web) e adapta `StatusBar` para a plataforma.
- Estilos incluem ajustes responsivos (largura máxima e cursores) sem alterar o look&feel original.

Para instruções detalhadas de backend, consulta o [README_SUPABASE.md](README_SUPABASE.md).
