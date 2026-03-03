const {Router}=require('express')
const authMiddleware=require('../middleware/auth.middleware')
const transactionController=require('../controllers/transaction.contoller')

const transactionRouter=Router()
/**
 * - create new transaction
 * - POST /api/transactions/
 */
transactionRouter.post('/',authMiddleware.authMiddleware,transactionController.createTransaction)

/**
 * - POST /api/transactions/system/intial-funds
 * - Create initial funds transaction from system user 
 */
transactionRouter.post('/system/intial-funds',authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)
module.exports=transactionRouter