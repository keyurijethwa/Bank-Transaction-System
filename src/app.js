const express =require('express')
const cookieParser=require('cookie-parser')

const app=express()
app.use(express.json())
app.use(cookieParser())


/**
 * - Routes required
 */
const authRouter=require('./routes/auth.route')
const accountRouter=require('./routes/account.route')
const transactionRouter=require('./routes/transaction.route')

app.get('/',(req,res)=>{
    res.send("Welcome to Bank Transaction API")
})

/**
 * - API Routes
 */
app.use('/api/auth',authRouter)
app.use('/api/accounts',accountRouter)
app.use('/api/transactions',transactionRouter)
module.exports=app