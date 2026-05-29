# ChegaAi_unifor

API REST com CRUDs usando **Supabase** e o schema em `ChegaAi_bd.sql/chegaAIDB.sql`.

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No painel, abra **SQL Editor** e execute o conteúdo de `ChegaAi_bd.sql/chegaAIDB.sql`.
3. Em **Project Settings → API**, copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`  
     **Não** use a chave `publishable` aqui — ela respeita RLS e a API pode retornar `[]` mesmo com dados no banco.  
     Use a service role **somente no backend**; nunca exponha no app mobile/web.

## 2. Rodar a API localmente

```bash
npm install
cp .env.example .env
# preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Teste: `GET http://localhost:3001/health`

## Endpoints

Base: `http://localhost:3001/api`

| Recurso | Métodos |
|---------|---------|
| `/login` | POST |
| `/usuarios` | GET, GET/:id, POST, PUT/:id, DELETE/:id |
| `/comunidades` | GET, GET/:id, POST, PUT/:id, DELETE/:id |
| `/membros-comunidade` | GET, GET/:id_usuario_membro/:id_comunidade, POST, PUT, DELETE |
| `/eventos` | GET, GET/:id, POST, PUT/:id, DELETE/:id |
| `/participantes-evento` | GET, GET/:id_participante/:id_evento, POST, PUT, DELETE |
| `/amizades` | GET, GET/:id_usuario/:id_amigo, POST, PUT, DELETE |
| `/conquistas` | GET, GET/:id, POST, PUT/:id, DELETE/:id |
| `/usuario-conquistas` | GET, GET/:id_usuario/:id_conquista, POST, PUT, DELETE |
| `/desafios` | GET, GET/:id, POST, PUT/:id, DELETE/:id |
| `/usuario-desafios` | GET, GET/:id_usuario/:id_desafio, POST, PUT, DELETE |
| `/mensagens` | GET, GET/:id, POST, PUT/:id, DELETE/:id |

## Exemplo — criar usuário

```bash
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome_usuario": "Maria",
    "apelido_usuario": "mari",
    "email_usuario": "maria@email.com",
    "senha_usuario": "123456",
    "bio_usuario": "Olá!"
  }'
```

## Exemplo — login

```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_usuario": "maria@email.com",
    "senha_usuario": "123456"
  }'
```

Retorna `401` quando o email ou a senha estão incorretos.

## Retorna `[]` mas tem dados no Table Editor?

A chave **publishable** (`sb_publishable_...`) só enxerga linhas permitidas por **RLS**. O dashboard usa a role `postgres` e mostra tudo.

**Solução recomendada:** no `.env`, use a chave **service_role** (secret), não a publishable.

**Alternativa (dev):** execute `ChegaAi_bd.sql/supabase_rls_dev.sql` no SQL Editor para desabilitar RLS nas tabelas.

## Row Level Security (RLS)

Por padrão o Supabase bloqueia leitura com chaves públicas sem políticas RLS. Esta API usa **service_role** no servidor para bypass. Para produção, configure políticas RLS e Supabase Auth.
