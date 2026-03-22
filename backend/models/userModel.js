import db from "../database/configdb.js"
import { AdicionaUsuario } from "../database/querys.js"


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
    db.query("DELETE FROM users WHERE email = ?",[email],(err)=>{
        if (err){
            console.error("Não foi possível excluir usuario: ", err)
            return
        }
        else{console.log("Usuário deletado")}
    })
}

// export const findUserByEmail = (email) => { Desse jeito nao vai funcionar pq o return vai ser so do callback, terrei q fazer async
//   db.query("SELECT * FROM users WHERE email = ? ",[email],(err,resultado)=>{
//     if(err){return}
//   })
   
// }

// export const findUserByEmail = (email) => {
//   return users.find(u => u.email === email)
// }

