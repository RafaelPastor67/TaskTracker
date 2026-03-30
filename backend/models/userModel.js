import db from "../database/configdb.js"

function AdicionaUsuario(user){
  db.query("INSERT INTO users (name,email,password) VALUES(?,?,?)",
  [user.name,user.email,user.password],(err,resultado)=>{
  if(err){
    console.error("Nao foi possível adicionar usuário: ", err);
    return;
  }else{
    console.log("Usuario adicionado ao banco: ",resultado.insertId)}
  })
}

export const createUser = (user) => {
  AdicionaUsuario(user)
  return user
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

export function deleteUser(email){
  return new Promise((resolve,reject)=> {
    db.query("DELETE FROM users WHERE email = ?",[email],(err,result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

