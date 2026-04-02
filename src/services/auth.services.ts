import prisma from "../config/prisma.js"


export const createUser = async(name: String, password: String, email: String) => {
    const user = await prisma.users.create({
        
    })
}
