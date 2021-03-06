import bcrypt from 'bcrypt'
import connectDB from '../../../config/db'
import Users from '../../../models/userModel'
import validator from '../../../services/validator'

connectDB()

export default async (req, res) => {
    switch(req.method) {
        case "POST":
            await register(req, res)
            break
    }
}

const register = async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body
        
        const errMsg = validator(name, email, password, confirm_password)
        if(errMsg) return res.status(400).json({err: errMsg})

        const user = await Users.findOne({ email })
        if(user) return res.status(400).json({err: 'This email already exists.'})

        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = new Users({
            name,
            email,
            password: passwordHash,
            confirm_password
        })

        await newUser.save()
        res.json({msg: "Register Success!"})
    } catch(err){
        return res.status(500).json({err: err.message})
    }
}