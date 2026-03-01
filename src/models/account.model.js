const mongoose=require('mongoose');
const ledgerModel=require('./ledger.model');
const { $where } = require('./users.model');

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

accountSchema.methods.getBalance=async function (){
    //aggrigation pipeline to calculate balance from ledger entries
    //aggregation allow you to perform your own quiries on the data and transform it in various ways before returning the result
    const balanceData=await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDabit:{
                    $sum:{
                        $cond:[
                        {$eq:["$type","DEBIT"]},
                        "$amount",
                        0
                        ]
                    }
                },
                totalDabit:{
                    $sum:{
                        $cond:[
                        {$eq:["$type","CREDIT"]},
                        "$amount",
                        0
                        ]
                    }   
                }
            }
        },
        {
            $project:{
                _id:0,
                balance:{  
                    $subtract:["$totalCredit","$totalDabit"] 
                } 
            }
        }
    ])

    if(balanceData.length===0){
        return 0
    }

    return balanceData[0].balance
}


const accountModel=mongoose.model("account",accountSchema)

module.exports=accountModel