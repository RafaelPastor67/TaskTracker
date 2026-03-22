import db from "./configdb.js"
//CRUD BANCO

const tabela = "";



// Printa no console todos os usuarios
// db.query("SELECT * FROM users", (err, results) => {
//     if (err) {
//         console.error(err)
//         return
//     }

//     console.log(results)
// })

export function AdicionaUsuario(user){
db.query("INSERT INTO users (name,email,password) VALUES(?,?,?)",[user.name,user.email,user.password],(err,resultado)=>{if(err){console.error("Nao foi possível adicionar usuário: ", err);return;}else{console.log("Usuario adicionado ao banco: ",resultado.insertId)}}) // Query adicionar usuario ao banco
}

// const joao = {
//     nome: "Joao",
//     email: "jottaP@gmail.com",
//     senha: "c9d8a7f6b5e4d3c2a1f0a9b8c7d6e5f4"
// }
// AdicionaUsuario(joao)

export function DeletaTodosUsuarios(){

    db.query("DELETE * FROM users",(err)=>{
    if(err){console.error("Nao foi possível deletar")}
    
    else{console.log("Tabela de usuários limpa com sucesso")}
    })    
}



