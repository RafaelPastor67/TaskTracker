import db from "../database/configdb.js"

export async function createUser(user) {
  const result = await new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (name,email,password,role) VALUES(?,?,?,?)",
      [user.name, user.email, user.password, user.role || "user"],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })

  return {
    id: result.insertId,
    name: user.name,
    email: user.email,
    role: user.role || "user",
  }
}

export async function findUserByEmail(email){
  const results = await new Promise((resolve,reject)=> {
    db.query("SELECT * FROM users WHERE email = ?",[email],
      (err, results) => {
        
        if(err) return reject(err) 
          resolve(results)
      }
    )
  }) 

   return results[0]
}

export async function findUserById(id) {
  const results = await new Promise((resolve,reject)=>{
    db.query("SELECT * FROM users WHERE id = ?",[id],
      (err,results)=>{
        if(err) return reject(err)
          resolve(results)
      })
  })
  return results[0]
}

export function deleteUser(id){
  return new Promise((resolve,reject)=> {
    db.query("DELETE FROM users WHERE id = ?",[id],(err,result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export async function getAllUsers() {
  const results = await new Promise((resolve,reject)=>{
    db.query("SELECT id, name, email, role, created_at FROM users",
      (err,results)=>{
        if(err) return reject(err)
          resolve(results)
      })
  })
  return results

}

export async function updateUserById(id, userData) { // Vai dar update so onde tiver algum valor
  const campos = []
  const valores = []

  if (userData.name !== undefined) {
    campos.push("name = ?")
    valores.push(userData.name)
  }
  if (userData.email !== undefined) {
    campos.push("email = ?")
    valores.push(userData.email)
  }
  if (userData.password !== undefined) {
    campos.push("password = ?")
    valores.push(userData.password)
  }
  if (userData.role !== undefined) {
    campos.push("role = ?")
    valores.push(userData.role)
  }
  if (campos.length === 0) {
    return null
  }

  valores.push(id)

  const result = await new Promise((resolve, reject) => {
    db.query(
      `UPDATE users SET ${campos.join(", ")} WHERE id = ?`, // Monta a query com os campos de cima
      valores,
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })

  return result
}

