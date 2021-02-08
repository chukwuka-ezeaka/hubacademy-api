const Validator = require('../validators/validators.index');
const UserDeviceStore = require('../stores/user_device.store');

class UserDeviceController {


    static async link(req, res,next) {
        try {
            const {error} = await Validator.linkDevice.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await UserDeviceStore.link(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    // static async all(req, res,next) {
    //     try {
    //         await MediaLinkStore.all(req,res,next)
    //     }
    //     catch (e) {
    //         next(sendError(400,e.message))
    //     }
    // }
    //
    // static async get(req, res,next) {
    //     try {
    //         await MediaLinkStore.get(req,res,next)
    //     }
    //     catch (e) {
    //         next(sendError(400,e.message))
    //     }
    // }
    //
    // static async delete(req, res,next) {
    //     try {
    //         await MediaLinkStore.delete(req,res,next)
    //     }
    //     catch (e) {
    //         next(sendError(400,e.message))
    //     }
    // }
}

module.exports = UserDeviceController;
