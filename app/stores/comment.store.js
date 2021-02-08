const models = require('../models/models.index');
const db = require('../../config/db');
const paginate = require('../../helpers/index').paginate;
const Likeable = require('../models/models.index').Likeable;
const LikeCounter = require('../models/models.index').LikeCounter;

class PostCommentStore {
    static async listByPost(req,res,next) {
        const { page = 0, limit = 20 } = req.query;
        await
            models.Comment.findAndCountAll({
                where:{postId:req.params.id, status:"approve"},
                include:[
                    {model:models.User, as: 'commenter', attributes: [ 'id', 'name', 'photo']},
                    {
                        model:models.LikeCounter,
                        as:'likeCount'
                    }
                ]
                ,
                // raw:true,
                nest:true,
                ...paginate({page,limit})
            })
                .then(comments => {
                    if(comments.rows.length) {
                        const transform = comments.rows.map( item=>{

                            let like_count = 0;
                            let liked_by_user = 0;
                            console.log(item.likeCount)
                            if (item.likeCount.length) {
                                item.likeCount.map(like => {
                                    like_count += like.count;

                                    if (like.userId === req.user.id) {
                                        liked_by_user = 1
                                    }
                                });
                            }
                            return {
                                user:item.userId,
                                content:item.content,
                                commenter:item.commenter,
                                createdAt:item.createdAt,
                                updatedAt:item.updatedAt,
                                edited:item.updatedAt > item.createdAt ? 1: 0,
                                like_count:like_count,
                                liked_by_user:liked_by_user
                            }
                        })

                        res.send({
                            status: "success",
                            data: transform,
                            totalRows:comments.
                            count,currentPage:parseInt(page),
                            message: "Found comments"
                        });
                    }else{
                        res.send({status: "success", data: comments, message: "No comments found"});
                    }
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

    static async get(req,res,next) {
        const { id } = req.params;

        await
            models.Post.findOne({
                where: {id: id}
            })
                .then(post => {
                        res.send({status: "success", data: post, message: "Found post"});
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

    static async update(req, res, next) {
        const { id } = req.params;
        const payload  = {
            content: req.body.content,
            status: req.body.status,
            postId: req.body.postId,
            userId: req.user.id
        }

        try {
            await models.Comment.update(payload,{where: {id: id,userId:req.user.id}})
                .then(async (response) => {
                    if(response) {
                        if (response[0]) {
                            await
                                models.Comment.findOne({
                                    where: {id: id}
                                })
                                    .then(post => {
                                            res.send({status: "success", data: post, message: "Updated Comment"});
                                        }
                                    )
                        }
                    }else{
                        res.status(400).send({status: "fail", message: "Comment not found"})
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
        const { id, owner_id } = req.params;
        let owner = false;
        if (owner_id) {
            owner = await models.Post.findOne({where: {id: id, userId: owner_id}})
                .then(async (user, err) => {
                    // const user_role = await user.user_role.getRole().then(d=>d)
                    if (err) {
                        return next(new Error(err.message))
                    } else if (!user) {
                        return false;
                    } else {
                        return true;
                    }
                });
        }

        let cond = {
            id:id,
            userId:req.user.id
        }
        if (owner_id && owner){
           cond = {
                id:id
            }
        }

        await models.Comment.destroy({where:cond})
            .then(data=> {
                if(data){
                    res.send({ status: "success", message:"Comment removed"})
                }else{
                    res.send({ status: "fail", message:"Comment not found"})
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

    static async like (req,res, next) {
        const { id,action } = req.body;
        const payload = {
            likeableType:'comment',
            likeableId:id,
            userId:req.user.id,
            typeId:'like'
        }

         models.Comment.count({ where: {'id': id} }).then( async res => {
            if (!res) {
                next(sendError(400, "Comment doesn't exist"));
            }else{
        if (action === 'like') {
            const vals ={...payload, count: 1};
            return db.transaction(t => {
                return Likeable.findOrCreate({
                    where: {
                        likeableType: 'comment',
                        likeableId: id,
                        userId: req.user.id,
                        typeId: 'like'
                    },
                    defaults:vals,
                    transaction: t
                }).then(([item, created]) => {
                        if (created) {
                            return LikeCounter.create({...payload, count: 1})
                        } else {
                            return LikeCounter.increment(
                                'count',{by:1,
                                    where: {
                                        likeableType: 'comment',
                                        likeableId: id,
                                        userId: req.user.id,
                                        typeId: 'like'
                                    }
                                },
                                {transaction: t}
                            )
                        }
                    }
                )
            })
                .then(
                    async (response)=> {
                        const like_count = await LikeCounter.findAll({
                            where: {
                                likeableType: 'comment',
                                likeableId: id,
                                userId: req.user.id,
                                typeId: 'like'
                            },
                            attributes: ['id', [db.fn('sum', db.col('count')), 'total']],
                            group : ['id'],
                            raw: true,
                            order: db.literal('total DESC')
                        });
                        res.send({status: "success", message: "Comment liked", data:{total_likes: like_count[0].total}})
                    }
                ).catch(error => {
                    next(sendError(400, error.message))
                })
        }else {
            try {
                let transaction;
                transaction = await db.transaction();
                await Likeable.destroy({
                        where: {
                            likeableType: 'comment',
                            likeableId: id,
                            userId: req.user.id,
                            typeId: 'like'
                        }
                    },
                    {transaction: transaction}
                );

                await LikeCounter.destroy({
                        where: {
                            likeableType: 'comment',
                            likeableId: id,
                            userId: req.user.id,
                            typeId: 'like'
                        }
                    },{transaction: transaction}
                )
                res.send({status: "success", message: "Comment UnLiked"})
                await transaction.commit();
            }
            catch (err) {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))
                }
            }
        }
            }
         })
    }

}

module.exports = PostCommentStore;
