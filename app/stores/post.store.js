const slugify = require('slugify');
const models = require('../models/models.index');
const db = require('../../config/db');
const paginate = require('../../helpers/index').paginate
const Likeable = require('../models/models.index').Likeable;
const LikeCounter = require('../models/models.index').LikeCounter;

class PostStore {

    static async create(req, res, next) {
       const payload  = {
           tags: req.body.tags,
           content: req.body.content,
           status: req.body.status,
           slug: slugify(req.body.content, {
               replacement: '-',
               remove: /[*+~.()'"!:@#]/g,
               lower: true,
           }),
           userId: req.user.id
       }

        try {
            await models.Post.create(payload).then((response) => {
                res.send({status: "success", data: response, message: "Created post"});
            })
        } catch (err) {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }
    }

    static async all(req,res,next) {
        const { page = 0, limit = 20 } = req.query;
        await
            models.Post.findAndCountAll({
                include:[
                    {model:models.Comment,
                        // separate:true,
                        // required: true,
                        as: 'comments',
                        // attributes: [ 'id', 'content', 'createdAt', 'updatedAt',[models.Comment.sequelize.fn("COUNT", models.Comment.sequelize.col("comments.id")), "commentsCount"]],
                        limit:1,
                        order:[
                            ['id', 'DESC']
                        ],
                        // group: ['id', 'content', 'createdAt','updatedAt'],
                        include:[
                            {model:models.User, as: 'commenter', attributes: [ 'id', 'name','email', 'photo']},
                            {
                                model:models.LikeCounter,
                                as:'likeCount'
                            }
                            ]
                    },
                    {
                        model:models.LikeCounter,
                        as:'likeCount'
                    },
                ],
                attributes: [ 'id', 'content','createdAt','updatedAt'],
                // group: ['Post.id', 'Post.content', 'Post.createdAt','Post.updatedAt'],
                // raw:true,
                // nest:true,
                visible: true,
                ...paginate({page,limit})
            })
                .then(async posts => {

                     posts.rows.every(  async post=>{
                         try {
                             let result = []
                             // let like_count = 0;
                             // let liked_by_user = 0;
                             // await post.likeCount.map(like => {
                             //     like_count += like.count;
                             //
                             //     if (like.userId === req.user.id) {
                             //         liked_by_user = 1
                             //     }
                             // });

                             // let like_count_comment = 0;
                             // let liked_by_user_comment = 0;
                             //
                             let last_comment = null;
                             if (post.comments.length) {
                                 last_comment = {
                                     id:post.comments[0].dataValues.id,
                                     status:post.comments[0].dataValues.status,
                                     postId:post.comments[0].dataValues.postId,
                                     userId:post.comments[0].dataValues.userId,
                                     content:post.comments[0].dataValues.content,
                                     createdAt:post.comments[0].dataValues.createdAt,
                                     updatedAt:post.comments[0].dataValues.updatedAt,
                                     commenter:post.comments[0].dataValues.commenter,
                                     like_count:post.comments[0].dataValues.likeCount ? post.comments[0].dataValues.likeCount.count : 0,
                                 }
                             }


                             await post.getComments().then(count => {
                                 result.push({
                                         id: post.id,
                                         content: post.content,
                                         createdAt: post.createdAt,
                                         updatedAt: post.updatedAt,
                                         last_comment: post.comments.length ? last_comment : null,
                                         comment_count: count.length ? count.length : 0,
                                         like_count:post.likeCount ? post.likeCount.count : 0
                                     }
                                 )
                             })
                                 .catch(err => {
                                     if (err.errors) {
                                         next(sendError(400, err.errors[0].message))

                                     } else {
                                         next(sendError(400, err.message))

                                     }
                                 })

                             res.send({
                                 status: "success",
                                 data: result,
                                 message: "Found posts",
                                 totalRows: posts.count,
                                 currentPage: parseInt(page)
                             });
                         }catch (err) {
                                 if (err.errors) {
                                     next(sendError(400, err.errors[0].message))

                                 } else {
                                     next(sendError(400, err.message))

                                 }
                         }
                    })


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
                where: {id: id},
                include:[
                    {model:models.Comment,
                        as: 'comments',
                        // attributes: [ 'id', 'content', 'createdAt', 'updatedAt',[models.Comment.sequelize.fn("COUNT", models.Comment.sequelize.col("comments.id")), "commentsCount"]],
                        limit:1,
                        order:[
                            ['id', 'DESC']
                        ],
                        // group: ['id', 'content', 'createdAt','updatedAt'],
                        include:[
                            {model:models.User, as: 'commenter', attributes: [ 'id', 'name','email', 'photo']},
                            {
                                model:models.LikeCounter,
                                as:'likeCount'
                            }
                        ]
                    },
                    {
                        model:models.LikeCounter,
                        as:'likeCount'
                    },
                ],
                attributes: [ 'id', 'content','createdAt','updatedAt'],
            })
                .then(async post => {
                        if (post) {

                            let result = null;
                            let last_comment = null;

                            if (post.comments.length) {
                                last_comment = {
                                    id: post.comments[0].dataValues.id,
                                    status: post.comments[0].dataValues.status,
                                    postId: post.comments[0].dataValues.postId,
                                    userId: post.comments[0].dataValues.userId,
                                    content: post.comments[0].dataValues.content,
                                    createdAt: post.comments[0].dataValues.createdAt,
                                    updatedAt: post.comments[0].dataValues.updatedAt,
                                    commenter: post.comments[0].dataValues.commenter,
                                    like_count: post.comments[0].dataValues.likeCount ? post.comments[0].dataValues.likeCount.count : 0,
                                }
                            }

                                result = {
                                        id: post.id,
                                        content: post.content,
                                        createdAt: post.createdAt,
                                        updatedAt: post.updatedAt,
                                        last_comment: post.comments.length ? last_comment : null,
                                        comment_count: post.comments.length ? post.comments.length : 0,
                                        like_count: post.likeCount ? post.likeCount.count : 0
                                    }
                            res.send({status: "success", data: result, message: "Found post"});
                        }else {
                            res.send({status: "fail", data: null, message: "No Post Found"});
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

    static async update(req, res, next) {
        const { id } = req.params;
        const payload  = {
            tags: req.body.tags,
            content: req.body.content,
            status: req.body.status,
            slug: slugify(req.body.content, {
                replacement: '-',
                remove: /[*+~.()'"!:@#]/g,
                lower: true,
            }),
            userId: req.user.id
        }

        try {
            await models.Post.update(payload,{where: {id: id}})
                .then(async (response) => {
                    if(response) {
                        if (response[0]) {
                            await
                                models.Post.findOne({
                                    where: {id: id}
                                })
                                    .then(post => {
                                            res.send({status: "success", data: post, message: "Updated post"});
                                        }
                                    )
                        }
                    }else{
                        res.status(400).send({status: "fail", message: "Post not found"})
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
        await models.Post.destroy({where:{
                id:id,
                userId:req.user.id
            }}).then(data=> {
                if(data){
                    res.send({ status: "success", message:"Post removed"})
                }else{
                    res.send({ status: "fail", message:"Post not found"})
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
            likeableType:'post',
            likeableId:id,
            userId:req.user.id,
            typeId:'like'
        }

        models.Post.count({ where: {'id': id} }).then( async res => {
            if (!res) {
                next(sendError(400, "Post doesn't exist"));
            }else{
        if (action === 'like') {
            const vals ={...payload, count: 1};
            return db.transaction(t => {
                return Likeable.findOrCreate({
                    where: {
                        likeableType: 'post',
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
                                        likeableType: 'post',
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
                                likeableType: 'post',
                                likeableId: id,
                                userId: req.user.id,
                                typeId: 'like'
                            },
                            attributes: ['id', [db.fn('sum', db.col('count')), 'total']],
                            group : ['id'],
                            raw: true,
                            order: db.literal('total DESC')
                        });
                        res.send({status: "success", message: "Post liked", data:{total_likes: like_count[0].total}})
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
                            likeableType: 'post',
                            likeableId: id,
                            userId: req.user.id,
                            typeId: 'like'
                        }
                    },
                    {transaction: transaction}
                );

                await LikeCounter.destroy({
                        where: {
                            likeableType: 'post',
                            likeableId: id,
                            userId: req.user.id,
                            typeId: 'like'
                        }
                    },{transaction: transaction}
                )
                res.send({status: "success", message: "Post UnLiked"})
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
        }).catch (err=> {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))
            }
        })
    }


}

module.exports = PostStore;
