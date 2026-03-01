const mongoose=require('mongoose');

const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        index: true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","INACTIVE"],
            message:"Status must be either ACTIVE, FROZEN or INACTIVE"
        },
        default:"ACTIVE"
        
    },
    currency:{
        type:String,
        required:[true,"Currency is required for creating an account"],
        default:"INR"
    }
},{
    timestamps:true
})

accountSchema.index({ user: 1 ,status: true });//cpmpaund index for user and status



const accountModel=mongoose.model("account",accountSchema)

module.exports=accountModel