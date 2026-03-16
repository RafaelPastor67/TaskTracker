# TaskFlow — Sprint 1

Este repositório contém a **Sprint 1** do projeto **TaskFlow**, um sistema de gestão de tarefas desenvolvido como parte de um desafio **Fullstack**.

O objetivo desta sprint foi estabelecer **a base da aplicação**, com foco principal no **backend e no sistema de autenticação**, deixando o frontend propositalmente simples para priorizar a arquitetura da API.

---

# Objetivos da Sprint 1

Nesta primeira sprint foram implementados os seguintes elementos fundamentais:

- Estrutura inicial do projeto
- API backend com **Node.js e Express**
- Sistema de **registro e login de usuários**
- **Hash de senha com bcrypt**
- Autenticação utilizando **JSON Web Token (JWT)**
- **Middleware de proteção de rotas**
- Endpoint para verificação de usuário autenticado
- Integração básica com o frontend

O frontend foi desenvolvido de forma **minimalista**, apenas para validar o fluxo de autenticação e a comunicação com a API.

---

# Tecnologias Utilizadas

## Backend
- Node.js
- Express
- bcrypt
- JSON Web Token (JWT)
- dotenv

## Frontend
- React
- React Router
- Fetch API

## Ferramentas
- Git / GitHub
- Nodemon

---

# Frontend

O frontend desta sprint foi desenvolvido apenas para **testar e demonstrar o fluxo de autenticação**.

Ele contém três páginas simples:

- **Login**
- **Register**
- **Menu (acessível apenas com autenticação)**

A interface foi mantida propositalmente simples para que o desenvolvimento pudesse **priorizar a lógica e segurança do backend**.

---

# Sistema de Autenticação

O sistema de autenticação utiliza **JWT (JSON Web Token)**.


---

# Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurações sensíveis.

Foi incluído um arquivo:

.env.example

# Como Executar o Projeto

## 1. Clonar o repositório

git clone https://github.com/RafaelPastor67/TaskTracker


---

## 2. Executar o Backend

Entrar na pasta:

cd backend

npm install

npm install

Servidor rodará em:


http://localhost:5000

---
## 3. Executar o Frontend

Entrar na pasta:

cd frontend


Instalar dependências:


npm install


Rodar aplicação:


npm run dev


Aplicação rodará em:


http://localhost:5173

Autor

Projeto desenvolvido por Rafael Pastor Pereira para o desafio TaskFlow Fullstack.
