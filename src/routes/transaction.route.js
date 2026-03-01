const {Router}=require('express')
const authMiddleware=require('../middleware/auth.middleware')
const transactionController=require('../controllers/transaction.contoller')

const transactionRouter=Router()
/**
 * - create new transaction
 * - POST /api/transactions/
 */
transactionRouter.post('/',authMiddleware,transactionController.createTransaction)

module.exports=transactionRouter