const Validator = require('../validators/validators.index');
const PostStore = require('../stores/post.store');

class PostController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createNote.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await PostStore.create(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.createNote.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await PostStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await PostStore.all(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await PostStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await PostStore.delete(req,res,next)
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
                await PostStore.like(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
}

module.exports = PostController;