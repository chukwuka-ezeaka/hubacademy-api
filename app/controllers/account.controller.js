const Validator = require('../validators/validators.index');
const AccountStore = require('../../app/stores/account.store');
const mediaManagerS3 = require('../services/service.aws.s3');
require('../../config/config.passport');


class AccountController {
    static async register(req, res, next) {
        try {
            await Validator.createUser.validateAsync(req.body)
            try {
                await AccountStore.register(req,res,next);

            } catch(e) {
                next(sendError(400,e.message))
            }
        } catch(e) {
            next(sendError(400,e.message))
        }

    }

    static async getAll(req, res) {
        try {
            let payload = await AccountStore.getAllUsers(req);
            res.send(payload);
        } catch(e) {
            next(sendError(400,e.message))
        }
    }

    static async login(req, res,next) {
        try {
            const {error} = await Validator.userLogin.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }
        await AccountStore.exists(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async forgotPassword(req, res,next) {
        try {
            await AccountStore.forgotPassword(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async resetPassword(req, res,next) {
        try {
            await AccountStore.resetPassword(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async uploadProfilePic(req,res,next){
        try {
            await Validator.profileUpload.validateAsync(req.body)
            mediaManagerS3.uploadImageSingle(req, res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = AccountController;
