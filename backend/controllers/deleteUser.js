import {deleteUser, findUserByEmail} from "../models/userModel.js"
export async function deletarUsuario(req,res){
    const {email} = req.body
    const userExists = await findUserByEmail(email)
    if(req.user.role == 'admin'){

        if (!userExists){
            return res.status(404).json({ message: "Email Nao encontrado" })
        }
        try{
                await deleteUser(email)
                res.json({message: "Usuário Deletado",})
            }   

        catch{
            res.status(500).json({ error: "Erro ao deletar usuário" })
        }
    
}
    else{
        res.status(403).json({ error: "Você não tem permissão pra executar esta ação" })
    }
}
