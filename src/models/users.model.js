const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating an account"],
        unique:[true,"User already exits"],
        trim:true,
        lowercase:true,
        match: [ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address" ]
    },
    name:{
        type:String,
        required:[true,"Name is required"]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[6,"Password must be more than 6 character"]
    },
},{
    timestamp:true
})

userSchema.pre("save",async (next) =>{
    if(!this.isModified("password")){
        return next()
    }
    const hash=await bcrypt.hash(this.password,10)
    this.password=hash
    next()
})

userSchema.methods.comparePassword=async (password)=>{
    return await bcrypt.compare(password,this.password)
}
const userModel=mongoose.model("user",userSchema)

module.exports=userModel