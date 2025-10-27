# Integração Supabase

Esta aplicação mobile usa Supabase (PostgreSQL + Auth) para gerir perfis, aulas, reservas e créditos. Segue os passos abaixo para configurar o backend e ligar a app Expo.

## 1. Criar o projecto Supabase
1. Acede a [https://app.supabase.com](https://app.supabase.com) e cria um novo projecto.
2. Guarda o `Project URL` e o `anon public API key` — vais colocá-los em `mobile_app/app.json`.

## 2. Aplicar o esquema (migrations)
1. No painel do projecto vai a **SQL Editor**.
2. Cria um novo script e cola o conteúdo de `supabase/migrations/0001_init.sql`.
3. Executa o script. A migration é idempotente, pelo que podes voltar a correr se precisares de reaplicar.

A migration cria:
- Tabelas para perfis (`profiles`), locais (`locations`/`rooms`), templates de aulas, sessões, inscrições, lista de espera, carteira de créditos e livro razão.
- View `sessions_with_availability` com disponibilidade agregada.
- Funções RPC `book_session` e `cancel_booking` com regras de negócio de créditos/lista de espera.
- Políticas RLS para garantir que cada utilizador só lê/escreve os seus dados.

## 3. Configurar variáveis da app Expo
Edita `mobile_app/app.json` e actualiza a secção `extra` com o URL e a anon key do projecto:

```json
"extra": {
  "SUPABASE_URL": "https://<o-teu-projecto>.supabase.co",
  "SUPABASE_ANON_KEY": "<a-tua-anon-key>"
}
```

> **Nota:** não comites chaves reais no repositório.

## 4. Instalar dependências e arrancar a app
```
cd mobile_app
npm install
npm run web
```

Usa `npm run web` para desenvolvimento no browser/PWA. Para testar nativo continua disponível `npm start`. A aplicação usa Expo, Supabase JS, AsyncStorage e Expo Notifications para registar o token push no perfil do utilizador.

Para gerar um build estático PWA (deploy em hosting/CDN):

```
npm run build:web
```

## 5. Preparar dados de teste
1. Cria utilizadores através do Dashboard ou da CLI (`supabase.auth.signUp`).
2. Para cada utilizador garante que existe uma linha em `profiles` (a app cria automaticamente na primeira sessão, mas podes inserir manualmente para definir `role`).
3. Introduz créditos iniciais:
   ```sql
   insert into credit_wallet (user_id, balance)
   values ('<uuid-do-user>', 5)
   on conflict (user_id) do update set balance = excluded.balance;
   ```
4. Cria algumas entradas em `class_templates`, `locations`, `rooms` e `sessions`. Exemplos rápidos:
   ```sql
   insert into class_templates (id, name, level)
   values (gen_random_uuid(), 'Pilates Reformer', 'Intermédio');

   insert into locations (id, name) values (gen_random_uuid(), 'Studio Centro');

   insert into rooms (id, location_id, name)
   values (gen_random_uuid(), (select id from locations limit 1), 'Sala 1');

   insert into sessions (template_id, start_at, end_at, room_id, instructor_id, capacity)
   values (
     (select id from class_templates limit 1),
     now() + interval '1 day',
     now() + interval '1 day' + interval '55 minutes',
     (select id from rooms limit 1),
     '<uuid-do-professor>',
     8
   );
   ```

## 6. Fluxos a validar
1. **Login:** entra com `email`/`password` criados no Supabase.
2. **Próximas aulas (Cliente):** a lista deve mostrar as inscrições em `enrollments` (`status = 'booked'`).
3. **Reservar:** nos cartões “Disponíveis para reserva”, carrega em **Reservar**. A app chama `rpc('book_session')` e apresenta o resultado (`booked` ou `waitlisted`).
4. **Minhas Aulas:** vê a reserva criada, cancela-a e confirma que `cancel_booking` devolve o crédito e promove alguém da waitlist quando aplicável.
5. **Perfil:** verifica o saldo em `credit_wallet` e a linha correspondente em `credit_ledger`.

Após estes passos a app Expo ficará ligada ao teu backend Supabase com dados reais de aulas e reservas.
