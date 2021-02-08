const models = require('../models/models.index');

class ReviewStore {
    static async create(req, res, next) {
        const payload  = {
            content: req.body.content,
            status: req.body.status,
            reviewableId: req.body.reviewableId,
            reviewableType: req.body.reviewableType,
            userId: req.user.id,
        }

        try {
            await models.Review.create(payload).then((response) => {
                res.send({status: "success", data: response, message: "Created Review"});
            })
        } catch (err) {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }
    }

    static async update(req, res, next) {
        const { id } = req.params;
        const payload  = {
            content: req.body.content,
            status: req.body.status,
            reviewableType: req.body.reviewableType,
        }

        try {
            await models.Review.update(payload,{where: {id: id,userId:req.user.id}})
                .then(async (response) => {
                    if(response) {
                        if (response[0]) {
                            await
                                models.Review.findOne({
                                    where: {id: id},
                                    attributes:['id','status', 'reviewableId', 'reviewableType', 'userId', 'content']
                                })
                                    .then(post => {
                                            res.send({status: "success", data: post, message: "Updated Review"});
                                        }
                                    )
                        }
                    }else{
                        res.status(400).send({status: "fail", message: "Review not found"})
                    }
                })
        } catch (err) {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }
    }

    static async delete (req,res, next) {
        const { id } = req.params;

        let cond = {
            id:id,
            userId:req.user.id
        }

        await models.Review.destroy({where:cond})
            .then(data=> {
                    if(data){
                        res.send({ status: "success", message:"Review removed"})
                    }else{
                        res.status(400).send({ status: "fail", message:"Review not found"})
                    }
                }
            )
            .catch(err=>{
                if (err.errors) {
                    next(sendError(400,err.errors[0].message))

                } else {
                    next(sendError(400,err.message))

                }
            })
    }

    static async get(req,res,next) {
        const { id } = req.params;

        await
            models.Review.findOne({
                where: {id: id},
                attributes:['id','status', 'reviewableId', 'reviewableType', 'userId', 'content']
            })
                .then(data => {
                    if (data){
                        res.send({status: "success", data: data, message: "Found Review"});
                    }
                        res.status(400).send({status: "fail", data: data, message: "No data found"});
                    }
                )
                .catch(err=>{
                    if (err.errors) {
                        next(sendError(400, err.errors[0].message))

                    } else {
                        next(sendError(400, err.message))

                    }
                })
    }
}

module.exports = ReviewStore;
