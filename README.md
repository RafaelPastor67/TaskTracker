# TaskFlow

Aplicacao full stack para gerenciamento de tarefas com autenticacao JWT, controle de acesso por perfil e organizacao de tarefas por projeto.

## Visao geral

O fluxo principal do sistema segue este modelo:

- `1 usuario -> N projetos`
- `1 projeto -> N tasks`
- `1 task -> 1 projeto`

Cada usuario autenticado pode criar projetos proprios e manter uma lista de tasks separada em cada projeto. A interface exibe os projetos na sidebar e carrega as tasks de acordo com o projeto selecionado.

## Funcionalidades

- Cadastro e login de usuarios
- Autenticacao com JWT
- Protecao de rotas no backend e no frontend
- CRUD de projetos por usuario autenticado
- CRUD de tasks por projeto
- Gerenciamento de usuarios por administradores
- Atualizacao e exclusao da propria conta

## Tecnologias utilizadas

### Backend

- Node.js
- Express
- MySQL
- bcrypt
- JSON Web Token (JWT)
- dotenv
- cors

### Frontend

- React
- Vite
- React Router DOM
- Bootstrap
- React Bootstrap
- React Icons

## Estrutura do projeto

```text
TaskTracker/
|-- backend/
|   |-- controllers/
|   |-- database/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   `-- tests/
`-- frontend/
    |-- src/
    `-- package.json
```

## Requisitos

- Node.js e npm
- MySQL em execucao

## Variaveis de ambiente

O backend utiliza um arquivo `.env` dentro da pasta `backend`. Use `backend/.env.example` como base:

```env
JWT_SECRET=INSIRA_CHAVE_DO_JWT
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=INSIRA_SENHA_DO_BANCO
DB_NAME=taskflow
```

## Banco de dados

O backend trabalha com tres entidades principais:

- `users`
- `projects`
- `tasks`

O schema base esta em [backend/database/schema.sql](backend/database/schema.sql).

Ao preparar o banco, o sistema tambem garante um usuario administrador padrao:

- Email: `admin@email.com`
- Senha: `admin`

Esse usuario e criado automaticamente na inicializacao do backend caso ainda nao exista. O script `schema.sql` tambem inclui esse registro para setups feitos manualmente do zero.

## Como executar o projeto

1. Clonar o repositorio

```bash
git clone https://github.com/RafaelPastor67/TaskTracker.git
cd TaskTracker
```

2. Configurar o banco de dados

- Crie um banco chamado `taskflow` no MySQL, se ele ainda nao existir.
- Configure o arquivo `backend/.env`.
- Se quiser criar tudo do zero manualmente, execute o script `backend/database/schema.sql`.
- Ao subir o backend pela primeira vez, confira se o usuario admin padrao foi criado e altere a senha depois do primeiro login.

3. Executar o backend

```bash
cd backend
npm install
npm run dev
```

O backend sera iniciado em [http://localhost:5000](http://localhost:5000).

4. Executar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend sera iniciado em [http://localhost:5173](http://localhost:5173).

## Rotas principais da API

### Autenticacao

- `POST /auth/register` - cria uma nova conta
- `POST /auth/login` - autentica o usuario e retorna um token JWT
- `GET /auth/me` - retorna os dados do usuario autenticado
- `GET /auth/admin` - valida acesso administrativo

### Usuarios

- `GET /auth/users` - lista usuarios (admin)
- `POST /auth/users` - cria um usuario (admin)
- `PUT /auth/users/:id` - atualiza um usuario
- `DELETE /auth/users/:id` - remove um usuario ou a propria conta

### Projetos

- `GET /projects` - lista os projetos do usuario autenticado
- `GET /projects/:id` - retorna um projeto especifico do usuario autenticado
- `POST /projects` - cria um novo projeto
- `DELETE /projects/:id` - remove um projeto e suas tasks

### Tasks

- `GET /tasks?projectId=:id` - lista as tasks do projeto selecionado
- `POST /tasks` - cria uma nova task em um projeto
- `PUT /tasks/:id` - atualiza o status de uma task
- `DELETE /tasks/:id` - remove uma task

## Interface

O frontend possui fluxo de login, cadastro, listagem de projetos na sidebar, selecao do projeto ativo, listagem de tasks por projeto e area administrativa para gerenciamento de usuarios.
