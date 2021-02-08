const Validator = require('../validators/validators.index');
const MediaLinkStore = require('../stores/medialink.store');

class MediaLinkController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createMediaLink.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await MediaLinkStore.create(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.createMediaLink.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await MediaLinkStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await MediaLinkStore.all(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await MediaLinkStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await MediaLinkStore.delete(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = MediaLinkController;