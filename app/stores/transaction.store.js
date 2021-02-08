const models = require('../models/models.index');
const https = require('https');
const shortid = require('shortid');
const {paginate} = require("../../helpers");
const {transactionStatus} = require('../../helpers/index');
const { Op } = require("sequelize");
class TransactionStore {

    static async close(req, res, next) {

        try {
            // const wallet = await req.user.getWallets().then(data=>{
            //     return data[0]
            // })


            // if (wallet){
            //
            //     if (wallet.balance < req.body.amount){
            //         res.status(400).send({
            //             status: "fail",
            //             data: {balance:wallet.balance},
            //             message: 'Insufficient funds'
            //         });
            //     }else {
                    await models.Transaction.findOne({where: {reference: req.body.trans_ref,burnt:0,user_id:req.user.id,amount:req.body.amount}})
                        .then(async trans => {
                            if (trans === null) {
                                res.status(400).send({
                                    status: "fail",
                                    data: {},
                                    message: 'Transaction does not exist'
                                });
                            } else {

                                const options = {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${process.env.PS_SKEY}`
                                    }
                                }

                                const result = await https.get(`https://api.paystack.co/transaction/verify/${req.body.trans_ref}`, options, (response) => {
                                    let resp_str = ''
                                    response.on('data', (data) => {
                                        resp_str += data
                                    });

                                    response.on('end', async (data) => {

                                        if (response.statusCode == 200) {
                                            const responseBody = JSON.parse(resp_str);

                                            if (responseBody.status == true) {

                                                if (responseBody.data.amount !== req.body.amount * 100) {
                                                    res.status(400).send({
                                                        status: "fail",
                                                        data: {},
                                                        message: "Invalid Amount"
                                                    })
                                                } else {
                                                    const {
                                                        currency, reference, gateway_response, message, channel, plan_object,
                                                        ip_address, log, customer, plan, fees, authorization, history, order_id, paidAt, createdAt, transaction_date
                                                    } = responseBody.data;

                                                    const transaction = {
                                                        currency,
                                                        status: transactionStatus.COMPLETED,
                                                        reference,
                                                        gateway_response,
                                                        message,
                                                        channel,
                                                        ip_address,
                                                        plan,
                                                        fees,
                                                        order_id,
                                                        paidAt,
                                                        createdAtPS: createdAt,
                                                        transaction_date: transaction_date,
                                                        log: JSON.stringify(log),
                                                        customer: JSON.stringify(customer),
                                                        authorization: JSON.stringify(authorization),
                                                        history: JSON.stringify(history),
                                                        plan_object: JSON.stringify(plan_object)
                                                    }


                                                    await models.Transaction.update(transaction, {where: {reference: req.body.trans_ref}})
                                                        .then(
                                                            () => {
                                                                            res.send({
                                                                                status: "success",
                                                                                message: "Transaction Successful"
                                                                            })
                                                            }
                                                        )
                                                        .catch(err => {
                                                            if (err.errors) {
                                                                next(sendError(400, err.errors[0].message))

                                                            } else {
                                                                next(sendError(400, err.message))

                                                            }
                                                        })

                                                }

                                            } else {
                                                res.status(400).send({
                                                    status: "fail",
                                                    data: JSON.parse(resp_str),
                                                    message: res.message
                                                })
                                            }
                                        } else {
                                            const response = JSON.parse(resp_str);
                                            next(sendError(400, response.message))
                                        }

                                    });

                                });

                                result.on('error', (error) => {
                                    next(sendError(400, 'Failed to reach PayStack'))
                                })

                            }
                        })
                        .catch(err => {
                            if (err.errors) {
                                next(sendError(400, err.errors[0].message))

                            } else {
                                next(sendError(400, err.message))

                            }
                        })
        }catch (err) {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }


    }

    static async start(req, res, next) {
         const {amount} = req.body;
         const trans_ref = shortid.generate();
         const transaction = {
             amount: amount,
             reference:trans_ref,
             user_id:req.user.id,
             user_email:req.user.email,
             status: transactionStatus.STARTED,
             burnt: 0,
         }
        await models.Transaction.create(transaction)
            .then(
            transaction=> {
                res.send({
                    status: "success",
                    data: transaction,
                    message: "Transaction created"
                })
            }
        )
            .catch(err=>{
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
            })

    }

    static async history(req,res,next){
        const {page = 0, limit = 20} = req.query;
        const history = models.Transaction.findAndCountAll({
                where:{user_id:req.user.id, [Op.or]:[ {status:transactionStatus.COMPLETED},{status:transactionStatus.FAILED},{status:transactionStatus.INCOMPLETE}]},
                attributes: ['id','amount','status','channel','fees','createdAt','reference'],
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

module.exports = TransactionStore
