const Validator = require('../validators/validators.index');
const mediaManagerS3 = require('../services/service.aws.s3');
const UserStore = require('../../app/stores/users.store');


class UserController {
    static async uploadProfilePic(req,res,next){
        try {
            mediaManagerS3.uploadImageSingle(req, res,next, 'profile_photo')
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async like(req, res,next) {
        try {
            const {error} = await Validator.Likeable.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await UserStore.like(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async follow(req, res,next) {
        try {
            const {error} = await Validator.Likeable.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await UserStore.follow(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async followers(req, res,next) {
        try {
                await UserStore.followers(req,res,next)
            }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async reviews(req, res,next) {
        try {
            await UserStore.reviews(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async invite(req, res,next) {
        try {
                await UserStore.inviteUser(req,res,next)
            }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = UserController;
