const models = require('../models/models.index');
const db = require('../../config/db');


class SubscriptionSettingStore {

    static async upsert(req, res, next) {

        try {
            await models.SubscriptionSettings.findOne({}).then( async setting =>{
                if(setting){
                    await setting.update({
                        global_subscription_status : req.body.global_subscription_status,
                        global_subscription_promo_amount : req.body.global_subscription_promo_amount,
                        global_subscription_amount : req.body.global_subscription_amount,
                        global_subscription_interval : req.body.global_subscription_interval,
                        global_subscription_promo_type : req.body.global_subscription_promo_type,
                        global_subscription_by : req.body.global_subscription_by,
                    }).then( async (response) => {
                        await models.SubscriptionSettings.findOne().then( setting =>{
                            res.send({status: "success", data: setting, message: "Settings updated"});
                        }).catch(err=>{
                            next(sendError(400,err.message))
                        })
                    })
                        .catch(err=>{
                            next(sendError(400,err.message))
                        })
                }else{
                    await models.SubscriptionSettings.create({
                        global_subscription_status : req.body.global_subscription_status,
                        global_subscription_promo_amount : req.body.global_subscription_promo_amount,
                        global_subscription_amount : req.body.global_subscription_amount,
                        global_subscription_interval : req.body.global_subscription_interval,
                        global_subscription_promo_type : req.body.global_subscription_promo_type,
                        global_subscription_by : req.body.global_subscription_by,
                    }).then(async (response) => {
                        await models.SubscriptionSettings.findOne().then(  setting =>{ res.send({status: "success", data: setting, message: "Settings updated"}); })
                    })
                        .catch(err=>{
                            next(sendError(400,err.message))
                        })
                }
            })
                .catch(err=>{
                    next(sendError(400,err.message))
                })

        } catch (err) {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }
    }

    static async get(req,res, next){
        try {
            await models.SubscriptionSettings.findOne({}).then( async setting =>{
                res.send({status: "success", data: setting, message: "Settings found"});
            })
        }catch (err) {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }
    }

}

module.exports = SubscriptionSettingStore;
