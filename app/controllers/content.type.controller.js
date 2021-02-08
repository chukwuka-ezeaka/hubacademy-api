const Validator = require('../validators/validators.index');
const ContentTypeStore = require('../../app/stores/content.type.store');

class ContentTypeController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createContentCategory.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ContentTypeStore.create(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.updateContentCategory.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ContentTypeStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await ContentTypeStore.all(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await ContentTypeStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await ContentTypeStore.delete(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = ContentTypeController;