const mongoose=require('mongoose')
const accountModel=require('../models/account.model')
const transactionModel=require('../models/transaction.model')
const emailService=require('../services/email.service') 

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req,res){

    const {fromAccount,toAccount,amount,idempotencyKey}=req.body

     /**
     * 1. Validate request
     */

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"From account, to account, amount and idempotency key are required to create a transaction"
        })
    }

    const fromUserAccount=await accountModel.findOne({
        _id:fromAccount
    })

    const toUserAccount=await accountModel.findOne({
        _id:toAccount
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(404).json({
            message:"From account or to account not found"
        })
    }

     /**
     * 2. Validate idempotency key
     */

    const isIdempotencyKeyExists=await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })

    if(isIdempotencyKeyExists){
        if(isIdempotencyKeyExists.status==="COMPLETED"){
            return res.status(200).json({
                message:"Transaction already processed",
                transaction:isIdempotencyKeyExists
            })
        }
        if(isIdempotencyKeyExists.status==="PENDING"){
            return res.status(200).json({
                message:"Transaction with same idempotency key is already in process",
            })
        }
        if(isIdempotencyKeyExists.status==="FAILED"){
            return res.status(500).json({
                message:"Previous transaction processing failed, please try again",
            })
        }
        if(isIdempotencyKeyExists.status==="REVERSED"){
            return res.status(500).json({
                message:"Previous transaction was reversed, please try again",
            })
        }
    }
      /**
     * 3. Check account status
     */

    if(fromUserAccount.status!=="ACTIVE" || toUserAccount.status!=="ACTIVE"){
        return res.status(400).json({
            message:"Both from account and to account must be active to process a transaction"
        })
    }
    /**
     * 4. Derive sender balance from ledger
     */
    const balance=await fromUserAccount.getBalance()

    if(balance<amount){
        return res.status(400).json({
            message:`Insufficient balance.Current balance is ${balance}. Required balance is ${amount}.`
        })
    }
    /**
    * - 5. Create transaction (PENDING)
    * - 6. Create DEBIT ledger entry
    * - 7. Create CREDIT ledger entry
    * - 8. Mark transaction COMPLETED
    * - 9. Commit MongoDB session
    */

    //all 4 instrunction are complete or none of then for consistency of data
    //mongo db provide transaction session to perform transactional operation
    const session=await mongoose.startSession()
    session.startTransaction()

    const transaction=await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    },{session})

    const debitLedgerEntry=await ledgerModel.create({
        account: fromAccount,
        amount,
        transaction:transaction._id,
        type:"DEBIT"
    },{session})

    const creditLedgerEntry=await ledgerModel.create({
        account: toAccount,
        amount,
        transaction:transaction._id,
        type:"CREDIT"
    },{session})

    transaction.status="COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    /**
     * 10. Send email notification
     */

    await emailService.sendTransactionNotification(
        req.user.email,
        req.user.name,
        amount,
        toAccount
    )

    return res.status(201).json({
        message:"Transaction processed successfully",
        transaction
    })
    

}

module.exports={createTransaction}