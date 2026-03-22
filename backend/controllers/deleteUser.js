import {deleteUser, findUserByEmail} from "../models/userModel.js"

export async function deletarUsuario(req,res){

    const {email} = req.body
    const userExists = await findUserByEmail(email)
    if (!userExists){
        return res.status(404).json({ message: "Email Nao encontrado" })
    }
    try{
        await deleteUser(email)
        res.json({message: "Usuário Deletado"})
    }
    catch{
        res.status(500).json({ error: "Erro ao deletar usuário" })
    }
}

