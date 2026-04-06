import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config({ path: ".env" })
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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