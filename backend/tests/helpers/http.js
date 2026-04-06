export function createMockReq({
  body = {},
  params = {},
  headers = {},
  user = undefined,
} = {}) {
  return { body, params, headers, user }
}

export function createMockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
    send(payload) {
      this.body = payload
      return this
    },
  }
}
