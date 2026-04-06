import assert from "node:assert/strict"
import { createAuthController } from "../controllers/authController.js"
import { createAuthMiddleware } from "../middleware/authMiddleware.js"
import { createUserController } from "../controllers/UserController.js"
import { createProjectControllerHandlers } from "../controllers/projectController.js"
import { createTaskControllerHandlers } from "../controllers/taskController.js"
import { createMockReq, createMockRes } from "./helpers/http.js"

const tests = []

function test(name, fn) {
  tests.push({ name, fn })
}

test("registra hashes de senhas e retorna created user", async () => {
  let savedUser
  const controller = createAuthController({
    findUserByEmailFn: async () => undefined,
    createUserFn: async (user) => {
      savedUser = user
      return { id: 10, name: user.name, email: user.email, role: "user" }
    },
    bcryptLib: {
      hash: async (password, rounds) => `hashed:${password}:${rounds}`,
      compare: async () => true,
    },
  })

  const req = createMockReq({
    body: { name: "Rafael", email: "rafael@example.com", password: "123456" },
  })
  const res = createMockRes()

  await controller.register(req, res)

  assert.deepEqual(savedUser, {
    name: "Rafael",
    email: "rafael@example.com",
    password: "hashed:123456:10",
  })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, {
    id: 10,
    name: "Rafael",
    email: "rafael@example.com",
    role: "user",
  })
})

test("register rejects duplicated email", async () => {
  const controller = createAuthController({
    findUserByEmailFn: async () => ({ id: 1 }),
  })

  const req = createMockReq({
    body: { name: "Rafael", email: "rafael@example.com", password: "123456" },
  })
  const res = createMockRes()

  await controller.register(req, res)

  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { message: "Email already used" })
})

test("register requires name, email and password", async () => {
  let createUserCalled = false
  const controller = createAuthController({
    findUserByEmailFn: async () => undefined,
    createUserFn: async () => {
      createUserCalled = true
    },
  })

  const req = createMockReq({
    body: { name: "   ", email: "rafael@example.com", password: "" },
  })
  const res = createMockRes()

  await controller.register(req, res)

  assert.equal(createUserCalled, false)
  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { message: "Name, email and password are required" })
})

test("login signs a token with the authenticated user payload", async () => {
  let receivedSecret
  let receivedPayload
  const controller = createAuthController({
    findUserByEmailFn: async () => ({
      id: 7,
      name: "Admin",
      email: "admin@example.com",
      password: "stored-hash",
      role: "admin",
    }),
    bcryptLib: {
      hash: async () => "",
      compare: async (password, hash) => password === "123456" && hash === "stored-hash",
    },
    jwtLib: {
      sign: (payload, secret, options) => {
        receivedPayload = payload
        receivedSecret = { secret, options }
        return "signed-token"
      },
    },
    jwtSecret: "test-secret",
  })

  const req = createMockReq({
    body: { email: "admin@example.com", password: "123456" },
  })
  const res = createMockRes()

  await controller.login(req, res)

  assert.deepEqual(receivedPayload, {
    id: 7,
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
  })
  assert.deepEqual(receivedSecret, {
    secret: "test-secret",
    options: { expiresIn: "1h" },
  })
  assert.deepEqual(res.body, { token: "signed-token" })
})

test("login rejects invalid credentials", async () => {
  const controller = createAuthController({
    findUserByEmailFn: async () => ({
      id: 1,
      password: "stored-hash",
    }),
    bcryptLib: {
      hash: async () => "",
      compare: async () => false,
    },
  })

  const req = createMockReq({
    body: { email: "user@example.com", password: "wrong-password" },
  })
  const res = createMockRes()

  await controller.login(req, res)

  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { message: "Invalid credentials" })
})

test("login requires email and password", async () => {
  const controller = createAuthController({
    findUserByEmailFn: async () => {
      throw new Error("findUserByEmail should not be called")
    },
  })

  const req = createMockReq({
    body: { email: "   ", password: "" },
  })
  const res = createMockRes()

  await controller.login(req, res)

  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { message: "Email and password are required" })
})

test("verifyToken stores decoded user and calls next", async () => {
  let nextCalled = false
  const middleware = createAuthMiddleware({
    jwtLib: {
      verify: (token, secret) => {
        assert.equal(token, "good-token")
        assert.equal(secret, "test-secret")
        return { id: 3, role: "user" }
      },
    },
    jwtSecret: "test-secret",
  })

  const req = createMockReq({
    headers: { authorization: "Bearer good-token" },
  })
  const res = createMockRes()

  await middleware.verifyToken(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
  assert.deepEqual(req.user, { id: 3, role: "user" })
})

test("verifyToken rejects missing token", async () => {
  const middleware = createAuthMiddleware()
  const req = createMockReq()
  const res = createMockRes()

  await middleware.verifyToken(req, res, () => {
    throw new Error("next should not be called")
  })

  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.body, { message: "No token" })
})

test("verifyAdmin rejects non-admin users", async () => {
  let nextCalled = false
  const middleware = createAuthMiddleware({
    findUserByIdFn: async () => ({ id: 8, role: "user" }),
  })

  const req = createMockReq({ user: { id: 8 } })
  const res = createMockRes()

  await middleware.verifyAdmin(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 403)
  assert.deepEqual(res.body, { message: "Acesso negado" })
})

test("verifyAdmin allows admin users", async () => {
  let nextCalled = false
  const middleware = createAuthMiddleware({
    findUserByIdFn: async () => ({ id: 8, role: "admin" }),
  })

  const req = createMockReq({ user: { id: 8 } })
  const res = createMockRes()

  await middleware.verifyAdmin(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
  assert.equal(res.statusCode, 200)
})

test("deletarUsuario blocks non-admin from deleting another account", async () => {
  let deletedId = null
  const controller = createUserController({
    findUserByIdFn: async (id) => ({ id, role: "user" }),
    deleteUserFn: async (id) => {
      deletedId = id
    },
  })

  const req = createMockReq({
    params: { id: "9" },
    user: { id: 2, role: "user" },
  })
  const res = createMockRes()

  await controller.deletarUsuario(req, res)

  assert.equal(deletedId, null)
  assert.equal(res.statusCode, 403)
  assert.deepEqual(res.body, {
    error: "Você não tem permissão pra executar esta ação",
  })
})

test("atualizarUsuarios does not allow self role escalation", async () => {
  let updatedPayload
  const controller = createUserController({
    updateUserByIdFn: async (id, payload) => {
      updatedPayload = { id, payload }
    },
    bcryptLib: {
      hash: async (password) => `hashed:${password}`,
    },
  })

  const req = createMockReq({
    params: { id: "5" },
    body: {
      name: "User",
      email: "user@example.com",
      password: "new-password",
      role: "admin",
    },
    user: { id: 5, role: "user" },
  })
  const res = createMockRes()

  await controller.atualizarUsuarios(req, res)

  assert.deepEqual(updatedPayload, {
    id: 5,
    payload: {
      name: "User",
      email: "user@example.com",
      password: "hashed:new-password",
    },
  })
  assert.equal(res.statusCode, 200)
})

test("atualizarUsuarios rejects empty profile fields", async () => {
  let updateCalled = false
  const controller = createUserController({
    updateUserByIdFn: async () => {
      updateCalled = true
    },
    bcryptLib: {
      hash: async () => "hashed",
    },
  })

  const req = createMockReq({
    params: { id: "5" },
    body: {
      name: "   ",
    },
    user: { id: 5, role: "user" },
  })
  const res = createMockRes()

  await controller.atualizarUsuarios(req, res)

  assert.equal(updateCalled, false)
  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { message: "Nome nao pode ser vazio" })
})

test("criarUsuarioAdmin hashes password and preserves requested role", async () => {
  const controller = createUserController({
    findUserByEmailFn: async () => undefined,
    createUserFn: async (payload) => payload,
    bcryptLib: {
      hash: async (password) => `hashed:${password}`,
    },
  })

  const req = createMockReq({
    body: {
      name: "New Admin",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    },
  })
  const res = createMockRes()

  await controller.criarUsuarioAdmin(req, res)

  assert.equal(res.statusCode, 201)
  assert.deepEqual(res.body, {
    name: "New Admin",
    email: "admin@example.com",
    password: "hashed:123456",
    role: "admin",
  })
})

test("criarUsuarioAdmin requires name, email and password", async () => {
  let createUserCalled = false
  const controller = createUserController({
    findUserByEmailFn: async () => undefined,
    createUserFn: async () => {
      createUserCalled = true
    },
    bcryptLib: {
      hash: async () => "hashed",
    },
  })

  const req = createMockReq({
    body: {
      name: "Admin",
      email: "   ",
      password: "   ",
      role: "admin",
    },
  })
  const res = createMockRes()

  await controller.criarUsuarioAdmin(req, res)

  assert.equal(createUserCalled, false)
  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { message: "Nome, email e senha sao obrigatorios" })
})

test("createProjectController trims the name and scopes the project to the user", async () => {
  let receivedPayload
  const controller = createProjectControllerHandlers({
    createProjectFn: async (payload) => {
      receivedPayload = payload
      return { insertId: 12 }
    },
  })

  const req = createMockReq({
    body: { name: "  Trabalho  " },
    user: { id: 8 },
  })
  const res = createMockRes()

  await controller.createProjectController(req, res)

  assert.deepEqual(receivedPayload, {
    name: "Trabalho",
    user_id: 8,
  })
  assert.equal(res.statusCode, 201)
  assert.deepEqual(res.body, {
    id: 12,
    name: "Trabalho",
    user_id: 8,
  })
})

test("createProjectController rejects duplicate names for the same user", async () => {
  const controller = createProjectControllerHandlers({
    createProjectFn: async () => {
      const error = new Error("duplicate")
      error.code = "ER_DUP_ENTRY"
      throw error
    },
  })

  const req = createMockReq({
    body: { name: "Trabalho" },
    user: { id: 8 },
  })
  const res = createMockRes()

  await controller.createProjectController(req, res)

  assert.equal(res.statusCode, 409)
  assert.deepEqual(res.body, { error: "Projeto com esse nome ja existe" })
})

test("getTasks requires a valid project owned by the authenticated user", async () => {
  const controller = createTaskControllerHandlers({
    getProjectByIdFn: async () => undefined,
  })

  const req = createMockReq({
    query: { projectId: "4" },
    user: { id: 99 },
  })
  const res = createMockRes()

  await controller.getTasks(req, res)

  assert.equal(res.statusCode, 404)
  assert.deepEqual(res.body, { error: "Projeto nao encontrado" })
})

test("createTaskController stores the task inside the selected project", async () => {
  let createTaskPayload
  const controller = createTaskControllerHandlers({
    getProjectByIdFn: async (projectId, userId) => ({ id: Number(projectId), user_id: userId }),
    createTaskFn: async (payload) => {
      createTaskPayload = payload
      return { insertId: 22 }
    },
  })

  const req = createMockReq({
    body: { title: "  Revisar contrato  ", projectId: 4 },
    user: { id: 99 },
  })
  const res = createMockRes()

  await controller.createTaskController(req, res)

  assert.deepEqual(createTaskPayload, {
    title: "Revisar contrato",
    project_id: 4,
  })
  assert.equal(res.statusCode, 201)
  assert.deepEqual(res.body, {
    id: 22,
    title: "Revisar contrato",
    completed: false,
    project_id: 4,
  })
})

test("updateTask updates only tasks owned by the authenticated user", async () => {
  let receivedArgs
  const controller = createTaskControllerHandlers({
    updateTaskStatusFn: async (id, userId, completed) => {
      receivedArgs = { id, userId, completed }
      return { affectedRows: 1 }
    },
  })

  const req = createMockReq({
    params: { id: "14" },
    body: { completed: true },
    user: { id: 99 },
  })
  const res = createMockRes()

  await controller.updateTask(req, res)

  assert.deepEqual(receivedArgs, {
    id: "14",
    userId: 99,
    completed: true,
  })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { success: true })
})

test("updateTask returns 404 when the task does not belong to the user", async () => {
  const controller = createTaskControllerHandlers({
    updateTaskStatusFn: async () => ({ affectedRows: 0 }),
  })

  const req = createMockReq({
    params: { id: "14" },
    body: { completed: true },
    user: { id: 99 },
  })
  const res = createMockRes()

  await controller.updateTask(req, res)

  assert.equal(res.statusCode, 404)
  assert.deepEqual(res.body, { message: "Task nao encontrada" })
})

test("deleteTaskController returns 404 when no task is deleted", async () => {
  const controller = createTaskControllerHandlers({
    deleteTaskFn: async () => ({ affectedRows: 0 }),
  })

  const req = createMockReq({
    params: { id: "33" },
    user: { id: 7 },
  })
  const res = createMockRes()

  await controller.deleteTaskController(req, res)

  assert.equal(res.statusCode, 404)
  assert.deepEqual(res.body, { message: "Task nao encontrada" })
})

let passed = 0

for (const { name, fn } of tests) {
  try {
    await fn()
    passed += 1
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    console.error(error)
    process.exitCode = 1
  }
}

console.log(`${passed}/${tests.length} tests passed`)
process.exit(process.exitCode ?? 0)
