# TaskFlow

Aplicação full stack para gerenciamento de tarefas, com autenticação JWT, controle de acesso por perfil e integração entre frontend em React e backend em Node.js/Express.

## Funcionalidades

- Cadastro e login de usuários
- Autenticação com JWT
- Proteção de rotas no backend e no frontend
- CRUD de tarefas por usuário autenticado
- Gerenciamento de usuários por administradores
- Atualização e exclusão da própria conta

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

```bash
TaskTracker/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── tests/
└── frontend/
    ├── src/
    └── package.json

```
## Requisitos

- Node.js e npm
- MySQL em execução

## Variáveis de ambiente
O backend utiliza um arquivo .env dentro da pasta backend. Use backend/.env.example como base:
```
JWT_SECRET=INSIRA_CHAVE_DO_JWT
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=INSIRA_SENHA_DO_BANCO
DB_NAME=taskflow
```

## Como executar o projeto

1. Clonar o repositório
```
git clone https://github.com/RafaelPastor67/TaskTracker.git
cd TaskTracker
```
2. Configurar o banco de dados
Execute o script backend/database/schema.sql no MySQL para criar o banco taskflow e as tabelas users e tasks.

3. Executar o backend
```
cd backend
npm install
npm run dev
```
O backend será iniciado em http://localhost:5000.

4. Executar o frontend
Em outro terminal:
```
cd frontend
npm install
npm run dev

```
O frontend será iniciado em http://localhost:5173

## Rotas principais da API

**Autenticação**
- `POST /auth/register` - cria uma nova conta

- `POST /auth/login` - autentica o usuário e retorna um token JWT
- `GET /auth/me` - retorna os dados do usuário autenticado
- `GET /auth/admin` - valida acesso administrativo

**Usuários**
- `GET /auth/users` - lista usuários (admin)
- `POST /auth/users` - cria um usuário (admin)
- `PUT /auth/users/:id` - atualiza um usuário
- `DELETE /auth/users/:id` - remove um usuário ou a própria conta

**Tarefas**

- `GET /tasks` - lista as tarefas do usuário autenticado
- `POST /tasks` - cria uma nova tarefa
- `PUT /tasks/:id` - atualiza o status de uma tarefa
- `DELETE /tasks/:id` - remove uma tarefa

## Interface

O frontend possui fluxo de login, cadastro, listagem de tarefas e uma área administrativa para gerenciamento de usuários. A interface é construída em React com Vite e utiliza Bootstrap para estilização.