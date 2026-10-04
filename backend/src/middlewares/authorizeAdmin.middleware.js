import {prisma} from '../../prisma/config.js';
import jwt from 'jsonwebtoken';




export const authorizeAdmin = async (req,res,next) =>{


    const accessToken=req.cookies.adminAccessToken;

    if(!accessToken)
    {
        return res.status(401).json({message:"Token not found"});
    }

    const secret=process.env.JWT_SECRET;

    try{
  
 const decode = jwt.verify(accessToken,secret);

  if(decode.role!='ADMIN')
 {
    return res.status(401).json({message:"Unauthorized Access"});
 }


 const admin= await prisma.user.findUnique({ where:{id:decode.userId} });

 if(!admin)
 {
    return res.status(401).json({message:"Invalid Access Token"});
 }

 req.admin=admin;

 next();

    }
    catch(err)
    {
             return res.status(401).json({message:"Invalid Access Token"})
    }

} 