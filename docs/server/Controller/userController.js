const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');   
const validator = require('validator'); 
const jwt = require('jsonwebtoken');

const userToken = ( _id ) => {
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({_id}, jwtkey, {expiresIn: '3d'})

};


const registerUser = async ( req, res ) => {

    try{
            const { name, email,  password } = req.body;
        
        let user = await userModel.findOne({ email })
    
        if(user) return res.status(400).json({ message: "User with the given e-mail already exists..." })
    
        if(!name || !email || !password) return res.status(400).json({ message: "All fields are required..." })
    
        if(!validator.isEmail(email)) return res.status(400).json({ message: "Invalid e-mail..." })
    
        if(!validator.isStrongPassword(password)) return res.status(400).json({ message: "Password must be a strong password..." })
    
        user = new userModel({name, email, password})
    
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
    
        await user.save()
        const token = userToken(user._id)
    
        res.status(200).json({ _id: user._id, name: user.name, email: user.email, token })
}
catch(error){
    console.log(error);
    res.status(500).json(error)
}
};

const loginUser = async ( req, res ) => {
    const { email, password } = req.body;

    try{
        let user = await userModel.findOne({ email });
        if(!user) return res.status(400).json({ message: "User with the given e-mail does not exist..." })

        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword) return res.status(400).json({ message: "Invalid password..." })
        
        const token = userToken(user._id)
        res.status(200).json({ _id: user._id, name: user.name, email: user.email, token })
    }catch(error){}
}

const findUser = async ( req, res ) => {
    const userId = req.params.userId;
    try{
        const user = await userModel.findById(userId); 
        res.status(200).json(user)
        }catch(error){
        console.log(error);
        res.status(500).json({message:"ERROR FINDING USER"})    
    }
};

const getUsers = async ( req, res ) => {
try{
    const user = await userModel.find(); 
    res.status(200).json(user)
}catch{
    console.log(error);
    res.status(500).json({message: "ERROR GETTING USERS..."})    
}
};

 
module.exports = {registerUser, loginUser, findUser, getUsers}
