import mysql from "mysql2"

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"taskflow"
})

db.connect((error)=>{
if(error){
    console.error("Erro ao conectar: ",error);
}
else{
    console.log("Conexão estabelecida com banco MYSQL")
}

})



export default db