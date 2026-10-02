const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { user } =require('../moduls');
const User = require('../src/modules/user/models/User');

const login =async(req , res) => {
    try {
        const{
            username,
            password
        }=req.body;
        if(!username || !password)
        {
            return res.status(400).json({
                success: false,
                message:'Username and password are required'
            });
        }
        const user=await User.findOne({
            where:{
                username : username
            }
        });
        if(!user)
        {
            return res.status(401).json({
                success : false,
                message : 'Invalid username or password'
            });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );
        if(!passwordMatch)
        {
            return res.status(401).json({
                success: false,
                message:'Invalid username or password'
            });
        }
        const token = jwt.sign(
            {
                user_id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn : process.env.JWT_EXPIRES_IN || '1d'
            }
        );
        return res.status(200).json({
            success : true,
            message : 'Login successful',
            data:{
                user:{
                    id : user.id,
                    username : user.username,
                    status_id : user.status_id
                },
                token : token
            }
        });
    }
    catch(error)
    {
        console.error('Authentication login error: ',error);
        return res.status(500).json({
            success : flase , 
            message : 'Internal server error'
        });
    }
};

module.exports ={
    login
};
