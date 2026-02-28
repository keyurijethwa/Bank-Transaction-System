const mongoose=require('mongoose')

function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Database connected successfully");
        
    })
    .catch(err=>{
        console.log("Error connecting to db: ",err);
        process.exit(1)
    })
}

module.exports=connectDB