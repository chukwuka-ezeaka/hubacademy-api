const Validator = require('../validators/validators.index');
const ContentStore = require('../stores/content.store');

class ContentCategoryController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createContent.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ContentStore.create(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.updateContent.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ContentStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await ContentStore.all(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async free(req, res,next) {
        try {
            await ContentStore.free(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async allCount(req, res,next) {
        try {
            await ContentStore.allCount(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async store(req, res,next) {
        try {
            await ContentStore.store(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await ContentStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await ContentStore.delete(req,res,next)
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
                await ContentStore.like(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = ContentCategoryController;
