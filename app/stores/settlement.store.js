
const paginate = require('../../helpers/index').paginate;;
const uuidv4 = require('uuid/v4');
const {bankList,createRecipient,requestPayout} = require("../services/service.paystack");
const models = require('../models/models.index');
const {walletStatus} = require("../../helpers");

class SettlementStore {
    static async CreateAccount(req,res,next){
        const payload = {
            "type": "nuban",
            "name": req.user.firstname,
            "description": "Settlement Account",
            "account_number": req.body.account_number,
            "bank_code": req.body.bank_code,
            "bank_name": req.body.bank_name,
            "currency": "NGN"
        }
       createRecipient(payload)
           .then(response=>{
           const update_payload = {
               "bank_account": req.body.account_number,
               "bank_code": req.body.bank_code,
               "bank_name": req.body.bank_name,
               "recipient_code": response.data.data.recipient_code,
           }
            models.User.update(update_payload,{where:{
                    id:req.user.id
                }}).then(data=> {
                    if(data){
                        if(data[0]) {
                            res.send({status: "success", message: "Account updated",data:response.data.data.details})
                        }else{
                            res.status(400).send({ status: "fail", message:"Account not found"})
                        }
                    }else{
                        res.status(400).send({ status: "fail", message:"Account not found"})
                    }
                }
            )
                .catch(err=>{
                    next(sendError(err.message))
                })

        }).catch( (err) => {
           next(new Error(err.message))
        })

    }

    static async GetAccount(req,res,next){
        const id = req.params.id ? req.params.id : req.user.id;
        models.User.findByPk(id,{attributes:['bank_account', 'bank_code', 'bank_name']})
        .then(user => {
            res.send({status: "success", message: "Account found",data:user})
        })
        .catch( (err) => {
            next(new Error(err.message))
         })
    }

    static async GetPayStackBanks(req,res,next){
        bankList(function (response) {
            let resp_str = ''
            response.on('data', (data) => {
                resp_str += data
            });

            response.on('end', (data) => {
                if(response.statusCode == 200){
                    res.send({
                        status: "success",
                        data: JSON.parse(resp_str).data,
                        message: "Found banks"
                    });
                }else{
                    throw new Error('Failed to reach PayStack')
                }

            });

            response.on('error', (error) => {
                next( sendError('Failed to reach PayStack - '+error.message) )
            })
        })
    }

    static async RequestPayout(req,res,next){
        const payload = {
            "source": "balance",
            "reason": "Settlement Request",
            "amount": req.body.amount,
            "recipient": req.user.recipient_code
        }

        this._checkBalanceAndDebit(req.user.id,req.body.amount)
            .then(actionReport=>{
            if (actionReport.status){
                requestPayout(payload).then( (response)=>{
                    this._recordSettlement(response.data.data,req.user.id,actionReport.walletId)
                        .then(settlementStatus=>{
                        if (settlementStatus){
                            res.send({status: "success", message: "Settlement request is being processed",data:
                                    {
                                        reference:response.data.data.reference,
                                        amount:response.data.data.amount,
                                        reason:response.data.data.reason,
                                    }
                            })
                        }else{
                            res.status(400).send({ status: "fail", message:"Error recording settlement"})
                        }
                    }).catch(err=>{
                        res.status(400).send({ status: "fail", message:err.message})
                    })
                })
                    .catch( (err) => {
                        next(new Error(err.response.data.message))
                    })
            }else{
                res.status(400).send({ status: "fail", message:"Amount greater than account balance"})
            }
        }).catch( (err) => {
            next(new Error(err.message))
        })


    }

    static async GetPayoutHistory(req,res,next){
        const {page = 0, limit = 20} = req.query;
        const settlement = models.Settlement.findAndCountAll({
            where:{user_id:req.user.id},
                attributes: ['id','reference','amount','reason','status','createdAt'],
                paranoid: true,
                order: [['createdAt', 'DESC']],
                ...paginate({page,limit})
            }
            );

        await settlement.then( async data=>{
            if(data.rows.length){
                res.send({
                    data: data.rows,
                    message: "Contents found",
                    status:'success',
                    totalRows: data.count,
                    currentPage: parseInt(page)
                })
            }else{
                res.status(400).send(
                    {
                        data: null,
                        message: "No Content",
                        status:'fail'
                    }
                )
            }
        }) .catch((err) => {
            next(new Error(err.message))
        })
    }

    static async _checkBalanceAndDebit(userId, amount){
        return await models.Wallet.findOne({where:{holder_id:userId}})
            .then( async  wallet_model=> {
                let actionReport = {status:false, walletId:wallet_model.id}
                if (wallet_model.balance >= amount){
                    await wallet_model.update(
                        {balance: (wallet_model.balance - parseInt(amount) )},
                    ).then( status=>{
                        if (status){
                            actionReport.status = true;
                        }
                    })
                        .catch((err) => {

                        })
                }
                return actionReport;
            })
    }

    static async _recordSettlement(response,userId,walletId){
        const payload = {
            "reference": response.reference,
            "integration": response.integration,
            "domain": response.domain,
            "amount": response.amount,
            "currency": response.currency,
            "source": response.balance,
            "reason": response.reason,
            "recipient": response.recipient,
            "status": response.status,
            "transfer_code": response.transfer_code,
            "ps_id": response.id,
            "user_id": userId,
        }
        const settlement = models.Settlement.create(payload);

        return settlement.then( async data=>{
            await models.WalletTransaction.create({
                payable_id: userId,
                wallet_id: walletId,
                type: walletStatus.WITHDRAW,
                amount: response.amount,
                confirmed: 1,
                uuid: uuidv4(),
                transRef: response.reference,
            })
            return !!data;
        })
    }
}

module.exports = SettlementStore;
