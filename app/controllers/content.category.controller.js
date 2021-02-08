const Validator = require('../validators/validators.index');
const ContentCategoryStore = require('../stores/content.category.store');

class ContentCategoryController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createContentCategory.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ContentCategoryStore.create(req,res,next)
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
                await ContentCategoryStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await ContentCategoryStore.all(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await ContentCategoryStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await ContentCategoryStore.delete(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = ContentCategoryController;