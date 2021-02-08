const Validator = require('../validators/validators.index');
const ReviewStore = require('../stores/review.store');

class PostController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createReview.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ReviewStore.create(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.updateReview.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }else{
                await ReviewStore.update(req,res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    // static async all(req, res,next) {
    //     try {
    //         await PostStore.all(req,res,next)
    //     }
    //     catch (e) {
    //         next(sendError(400,e.message))
    //     }
    // }
    //
    static async get(req, res,next) {
        try {
            await ReviewStore.get(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await ReviewStore.delete(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }



}

module.exports = PostController;
