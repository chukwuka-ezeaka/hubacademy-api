const models = require('../models/models.index');
const db = require('../../config/db');
const uuidv4 = require('uuid/v4');
const {paginate} = require("../../helpers");
const {transactionStatus} = require('../../helpers/index');
class WalletStore {

    static async balance(req,res, next) {
        const id = req.params.id ? req.params.id : req.user.id;
        models.Wallet.findOne({where:{holder_id:id}})
            .then(async wallet=>{
            if(wallet) {
                const balance = {
                    balance: new Intl.NumberFormat('en-US').format(wallet.balance),
                }
                const query_deposit =`SELECT SUM(amount) as total_sum from wallet_transactions WHERE payable_id = ${req.user.id} AND wallet_id = ${wallet.id} AND type = 'deposit'`;
                const query_withdraw =`SELECT SUM(amount) as total_sum from wallet_transactions WHERE payable_id = ${req.user.id} AND wallet_id = ${wallet.id} AND type = 'withdraw'`;
                const total_deposit = await db.query(query_deposit, { type: db.QueryTypes.SELECT })
                const total_withdraw = await db.query(query_withdraw, { type: db.QueryTypes.SELECT })

                const user = await models.User.findByPk(id, {attributes: ['id', 'firstname', 'lastname']}).then(user => user).catch(err => next(new Error(err.message)));

                res.send({status: "success", data: {
                    holder:user,
                    balance:{value:wallet.balance,label:balance.balance},
                    total_deposit:total_deposit[0].total_sum ? {value:parseInt(total_deposit[0].total_sum),label:total_deposit[0].total_sum} : {value:0,label:0},
                    total_withdraw:total_withdraw[0].total_sum ? {value:parseInt(total_withdraw[0].total_sum),label:total_withdraw[0].total_sum} : {value:0,label:0}
                    }, message: "Wallet balance"});
            }else{

                 db.transaction( async t => {

                          return  await models.Wallet.create({
                                holder_id: req.user.id,
                                balance: 0,
                                name: 'default',
                                slug: 'default',
                            }, {transaction: t})
                                .then(wallet=>{

                                return models.WalletTransaction.create({
                                    payable_id: req.user.id,
                                    wallet_id: wallet.id,
                                    type: 'deposit',
                                    amount: 0,
                                    confirmed: 1,
                                    uuid: uuidv4(),
                                }, {transaction: t})
                                    .then(result => {
                                        const balance = {
                                            balance:result.balance,
                                        }
                                        res.send({status: "success", data: balance, message: "Wallet created and balance found"});
                                    })
                                    .catch(err => {
                                        console.log(err)
                                        next(new Error(err.message))
                                    });
                            })

                                .catch(err => {
                                    console.log(err)
                                    next(new Error(err.message))
                                });
                })
            }
        })
            .catch((err) => {
                console.log(err)
                next(new Error(err.message))
            })
    }

    static async credit(req,res, next) {
        models.Wallet.findOne({where:{holder_id:req.user.id}}).then( async (wallet,err)=>{
            if (err) {
               return  next(sendError(400,err.message))
            }

            //validate wallet trans ref
            const trans_expired =  await models.WalletTransaction.count({where:{transRef:req.body.trans_ref}})
            if (trans_expired){
                return next(new Error('Invalid Transaction'))
            }
            //Validate Trans
            let transactionValidation = undefined;
            await this.validateTrans(req.body.trans_ref,req.user.id,req.body.amount).then(
                res=>transactionValidation = res
            )

            if (transactionValidation.status === 'failed'){
                next(sendError(400, 'Invalid or Expired Transaction'));
            }else {

                if (wallet) {
                    return db.transaction(async t => {
                        wallet.update(
                            {balance: parseInt(wallet.balance) + parseInt(req.body.amount)},
                            {transaction: t}
                        )
                        models.WalletTransaction.create({
                            payable_id: req.user.id,
                            wallet_id: wallet.id,
                            type: 'deposit',
                            amount: req.body.amount,
                            confirmed: 1,
                            uuid: uuidv4(),
                            transRef: req.body.trans_ref,
                        }, {transaction: t})
                            .then( async result => {
                                const wallet_balance = {
                                    balance: new Intl.NumberFormat('en-US').format(wallet.balance),
                                }
                                //BURN TRANSACTION
                                const query = "UPDATE transactions SET burnt = 1 WHERE transactions.reference = ?";
                                const [results, metadata] = await db.query(query, {replacements: [req.body.trans_ref], type: db.QueryTypes.UPDATE })
                                res.send({
                                    status: "success",
                                    data: {value: wallet.balance, label: wallet_balance.balance},
                                    message: "Wallet credited"
                                });
                            })
                    })

                } else {
                    next(sendError(400, "Failed to credit wallet"))
                }
            }
        })
            .catch((err) => {
                console.log(err)
                next(new Error(err.message))
            })
    }

    static async validateTrans(ref,user_id,amount){
        let response = {status:'failed'};
        // await models.Transaction.findOne({where:{'reference':ref,status:transactionStatus.COMPLETED,amount:amount}})
        await models.Transaction.findOne({where:{'reference':ref,user_id:user_id,status:transactionStatus.COMPLETED,amount:amount,burnt:0}})
            .then(result=>{
            if (result){
                response.status = 'success';
            }else{

            }
        })
            .catch((err) => {
                console.log(err)
            })
        return response
    }

    static async history(req,res,next){
        const id = req.params.id ? req.params.id : req.user.id;
        const {page = 0, limit = 20} = req.query;
        const history = models.WalletTransaction.findAndCountAll({
                where:{payable_id:id},
                attributes: ['id','amount','type',['confirmed','status'],'createdAt',['uuid','reference']],
                paranoid: true,
                order: [['createdAt', 'DESC']],
                ...paginate({page,limit})
            }
        );
       
        await history.then( async data=>{
            if(data.rows.length){
                res.send({
                    data: data.rows,
                    message: "Records found",
                    status:'success',
                    totalRows: data.count,
                    currentPage: parseInt(page)
                })
            }else{
                res.status(400).send(
                    {
                        data: null,
                        message: "No Record",
                        status:'fail'
                    }
                )
            }
        })
            .catch((err) => {
                next(new Error(err.message))
            })
    }

}

module.exports = WalletStore;
