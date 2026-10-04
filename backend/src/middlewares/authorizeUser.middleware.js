import {prisma}   from '../../prisma/config.js';
import jwt from 'jsonwebtoken';




export const authorizeUser = async (req,res,next) =>{
 

    const accessToken=req.cookies?.userAccessToken;

    if(!accessToken)
    {
        return res.status(401).json({message:"Token not found"});
    }

    const secret=process.env.JWT_SECRET;

    try{
  
 const decode = jwt.verify(accessToken,secret);

  if(decode.role!='USER')
 {
    return res.status(401).json({message:"Unauthorized Access"});
 }


 const user= await prisma.user.findUnique({ where:{id:decode.userId} });

 if(!user)
 {
    return res.status(401).json({message:"Invalid Access Token"});
 }

 req.user=user;

 next();

    }
    catch(err)
    {
             return res.status(401).json({message:"Invalid Access Token"})
    }




}