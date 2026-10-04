import {prisma}   from '../../prisma/config.js';
import jwt from 'jsonwebtoken';

export const authorizeStoreOwner = async (req,res,next) =>{
 

    const accessToken=req.cookies.storeOwnerAccessToken;

    if(!accessToken)
    {
        return res.status(401).json({message:"Token not found"});
    }

    const secret=process.env.JWT_SECRET;

    try{
  
 const decode = jwt.verify(accessToken,secret);

  if(decode.role!='STORE_OWNER')
 {
    return res.status(401).json({message:"Unauthorized Access"});
 }


 const storeOwner = await prisma.user.findUnique({ where:{id:decode.userId} });

 if(!storeOwner)
 {
    return res.status(401).json({message:"Invalid Access Token"});
 }

 req.storeOwner=storeOwner;

 next();

    }
    catch(err)
    {
             return res.status(401).json({message:"Invalid Access Token"})
    }




}