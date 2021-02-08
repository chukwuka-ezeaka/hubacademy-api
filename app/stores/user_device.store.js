const moment = require("moment");
const db = require('../../config/db');
const UserDevice = require('../models/models.index').UserDevice;
const {paginate} = require("../../helpers");
const Sequelize = require('sequelize');
const {getSubscriptionExpiry} = require("../../helpers");



class UserDeviceStore {

     static async link(req, res, next){
         const payload  = {
             deviceId: req.body.device_id,
             fcmToken: req.body.fcm_token,
             status: req.body.hasOwnProperty('status') ? req.user.status : 1,
         }
         const [updated] = await UserDevice.update(payload, {
             where: {
                 userId: req.user.id
             }
         });

        if (updated){
            await UserDevice.findOne({where:{userId:req.user.id}})
                .then( result =>{

                    const response = {
                        device_id: result.deviceId,
                        fcm_token: result.fcmToken,
                        status: result.active ? "active" : "inactive",
                    }
                    res.send({
                        data: response,
                        message: "Device link updated",
                        status:'success',
                    })
                }).catch(err=>{
                    next(sendError(400,err.message))
                })
        }else{
            payload.userId = req.user.id;
            payload.status = req.user.hasOwnProperty('status')  ? req.user.status : 1;
            await UserDevice.create(payload)
                .then( result =>{
                    const response = {
                        device_id: result.deviceId,
                        fcm_token: result.fcmToken,
                        status: result.active ? "active" : "inactive"
                    }
                    res.send({
                        data: response,
                        message: "Device linked successfully",
                        status:'success',
                    })
                }).catch(err=>{
                    next(sendError(400,err.message))
                })
        }

    }

}

module.exports = UserDeviceStore;
