const Validator = require('../validators/validators.index');
const CommentStore = require('../stores/comment.store');

class CommentController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createComment.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await CommentStore.create(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.createComment.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await CommentStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async listByPost(req, res,next) {
        try {
            await CommentStore.listByPost(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await CommentStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await CommentStore.delete(req,res,next)
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
                await CommentStore.like(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = CommentController;