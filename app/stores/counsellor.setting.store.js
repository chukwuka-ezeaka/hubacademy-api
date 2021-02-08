const models = require('../models/models.index');
const db = require('../../config/db');


class CounsellorSettingtore {

    static async upsert(req, res, next) {

        try {
            await models.CounsellorSetting.findOne({}).then( async setting =>{
                if(setting){
                    await setting.update({
                        chat_price : req.body.chat_price,
                        video_price : req.body.video_price,
                        call_price : req.body.call_price,
                        share_percentage : req.body.share_percentage,
                    }).then( async (response) => {
                        await models.CounsellorSetting.findOne().then( setting =>{
                            res.send({status: "success", data: setting, message: "Settings updated"});
                        }).catch(err=>{
                            next(sendError(400,err.message))
                        })
                    })
                        .catch(err=>{
                            next(sendError(400,err.message))
                        })
                        
                }else{
                    await models.CounsellorSetting.create({
                        chat_price : req.body.chat_price,
                        video_price : req.body.video_price,
                        call_price : req.body.call_price,
                        share_percentage : req.body.share_percentage,
                    }).then(async (response) => {
                        await models.CounsellorSetting.findOne().then(  setting =>{ res.send({status: "success", data: setting, message: "Settings updated"}); })
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
            await models.CounsellorSetting.findOne({}).then( async setting =>{
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

module.exports = CounsellorSettingtore;
