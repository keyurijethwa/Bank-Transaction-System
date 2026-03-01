const accountModel=require('../models/account.model')

async function createAccountController(req,res){

    const user=req.user

    const accout=await accountModel.create({
        user:user._id
    })

    res.status(201).json({
        message:"Acoount created successfully",
        accout
    })

}

module.exports={createAccountController}