const models = require('../models/models.index');
const paginate = require('../../helpers/index').paginate;
const _ = require('lodash');
const { Op } = require("sequelize");
const db = require('../../config/db');
const getInvitationTemplate = require('../services/email_templates/invitation');
const sendEmail = require('../services/email');
const dotenv = require('dotenv').config();

class UserStore {

    // static async All(req) {
    //     try {
    //         return await models.User.findAll()
    //     } catch(exception) {
    //         return exception;
    //     }
    // }
    

    static async AllWithRoles (req,res, next) {
        const { page = 0, limit = 20} = req.query;
         models.User.findAndCountAll({
            include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id'],
                    include: [
                        {model:models.RolePermission, attributes: ['permissionId', 'roleId'],
                            include: [
                                {model:models.Permission, attributes: ['name','id']}
                            ]
                        },
                        ]
            }],
                attributes: ['roleId']},
                {model: models.ContentCategory,as:'category',attributes: ['name', 'id','description', 'image_url', 'slug']},
                {
                    model:models.LikeCounter,
                    as:'likeCount',
                    attributes: ['count']
                },
                {
                    model:models.Subscription
                }
                ],
             attributes: [ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone','photo','username', 'country_name','birthday','createdAt','online','address','years_of_experience','pitch_video_link', 'active','about','verified','verifiedAt']
             ,
            order: [
                ['createdAt', 'DESC']
            ]
            // ,limit: 10
        }).then( async data => {
             await models.Role.findAll({
                attributes: ['name', 'id'],
                 ...paginate({page,limit})
            })
                .then( async roles => {
                    let result = data.rows.map(item=>{
                        return {
                            id: item.id,
                            fullname: item.fullname,
                            firstname: item.firstname,
                            lastname: item.lastname,
                            email: item.email,
                            phone: item.phone,
                            photo: item.photo,
                            username: item.username,
                            country_name: item.country_name,
                            birthday: item.birthday,
                            online: item.online,
                            about: item.about,
                            createdAt: item.createdAt,
                            address: item.address,
                            years_of_experience: item.years_of_experience,
                            pitch_video_link: item.pitch_video_link,
                            active: item.active,
                            verified: item.verified,
                            verifiedAt: item.verifiedAt,
                            UserRole: item.UserRole,
                            category: item.category,
                            likeCount: item.likeCount ? item.likeCount.count : 0
                        }
                    });
                    res.send( {
                        data: result,
                        roles: roles,
                        status: "success",
                        totalRows: data.count,
                        currentPage: parseInt(page)
                    });
                });

        })
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async assignRole (req,res, next) {
        const {user_id, role_id} = req.body;
        const payload = {roleId:role_id,userId:user_id, userRoleId:role_id}
        await models.User.findByPk(user_id).then(model=>{
            if (model){
                return models.Role.findOne({where:{id:role_id}}).then(data=> {
                    if (data) {
                        return models.UserRole.update(payload, {where: {userId: user_id}})
                            .then(async data => {
                                if (data) {
                                    res.send({status: "success", message: "Role assigned"});
                                } else {
                                    models.UserRole.create(payload, {where: {userId: user_id}})
                                        .then(async data => {
                                            res.send({status: "success", message: "Role assigned"});
                                        })
                                        .catch(err => {
                                            if (err.errors) {
                                                next(new Error(err.errors[0].message))

                                            } else {
                                                next(new Error(err.message))

                                            }
                                        })
                                }
                            })
                            .catch(err => {

                                if (err.errors) {
                                    next(new Error(err.errors[0].message))

                                } else {
                                    next(new Error(err.message))

                                }
                            })
                    }else{
                        res.send( {status: "fail", message:"Role not found"})
                    }
                }
                )
            }else{
                res.send( {status: "fail", message:"User not found"});
            }
        })

    }

    static async get (req,res, next) {
        const {id} = req.params;
        await models.User.findByPk(id,{
            include: [
                {model:models.UserRole,include: [
                {model:models.Role,attributes: ['name','id']
                    ,
                    include: [
                        {model:models.RolePermission, attributes: ['permissionId', 'roleId'],
                            include: [
                                {model:models.Permission, attributes: ['name','id']}
                            ]
                        },
                    ]
                }],  attributes: ['roleId']},

                    {model: models.ContentCategory,as:'category',attributes: ['name', 'id','description', 'image_url', 'slug']},
                    {
                        model:models.LikeCounter,
                        as:'likeCount',
                        attributes: ['count']
                    },
                    // {
                    //     model:models.Subscription
                    // },
                //     {
                //         model:models.Follower,
                //         as:'followers',
                //         attributes: [  [
                //             db.literal(`(
                //     SELECT COUNT(*)
                //     FROM followers AS followers_count
                //     WHERE
                //         followers.followableId = ${id}
                //
                // )`),
                //             'followersCount'
                //         ],
                //             [
                //                 db.literal(`(
                //     SELECT COUNT(*)
                //     FROM followers AS user_follow_count
                //     WHERE
                //         followers.followableId = ${id}
                //     AND
                //         followers.followerId = ${req.user.id}
                //
                // )`),
                //                 'isFollowing'
                //             ]
                //         ]
                //     },

                    ],

                attributes: [ ['name','fullname'],
                    'firstname', 'lastname', 'email', 'id', 'phone','photo','username', 'country_name','birthday','createdAt','online','address','years_of_experience','pitch_video_link','about', 'active','verified','verifiedAt']
            }
                ).then(async model=> {
                if (model) {
                    let result = {...model.dataValues};

                    result.likeCount = result.likeCount ? result.likeCount.count : 0
                    // result.subscriptionCount = result.Subscriptions ? Array.isArray(result.Subscriptions) ? result.Subscriptions.length ? result.Subscriptions.length : 0 : 0 : 0;
                    // result.followersCount = Array.isArray(result.followers) ? result.followers[0] ? result.followers[0].dataValues.followersCount : 0 : 0;
                    // result.isFollowing = Array.isArray(result.followers) ? result.followers[0] ? result.followers[0].dataValues.isFollowing : 0 : 0;
                    // result.followers = undefined


                    await Promise.all([
                        models.Subscription.count({where:{authorId:result.id}}),
                        models.Follower.count({where:{followableId:result.id}}),
                        models.Follower.count({where:{followableId:result.id,followerId:req.user.id},limit:1}),
                        models.Likeable.count({
                            where: {
                                likeableType: 'user',
                                likeableId: result.id,
                                userId: req.user.id,
                                typeId: 'like'
                            }
                        }),
                        models.Subscription.count({where:{authorId:result.id,userId:req.user.id},limit:1}),
                        ]
                    ).then( ([subs,follows,isFollowing,userHasLikedProfile,userHasSubscribed] )=>{
                        result.subscriptionCount = subs;
                        result.followersCount = follows;
                        result.isFollowing = isFollowing;
                        result.userHasLikedProfile = userHasLikedProfile ? 1 : 0;
                        result.userHasSubscribed = userHasSubscribed ? 1 : 0;
                        res.send({
                            status: "success",
                            data:result,
                            message: "User Account found"
                        })
                    })

                }else{
                    res.status(400).send({status: "fail", message: "User Account is unavailable"})
                }
            }
            )
                    .catch(err=>{

                        if (err.errors) {
                            next(new Error(err.errors[0].message))

                        } else {
                            next(new Error(err.message))

                        }
                    })

    }

    static async authors (req,res, next) {
        await models.User.scope(['authors']
        ).findAll().then(async model=> {
                if (model) {
                    if (model.length){
                        let result = model.map(item=>{
                            return {
                                id: item.id,
                                fullname: item.fullname,
                                firstname: item.firstname,
                                lastname: item.lastname,
                                email: item.email,
                                phone: item.phone,
                                photo: item.photo,
                                username: item.username,
                                country_name: item.country_name,
                                birthday: item.birthday,
                                about: item.about,
                                online: item.online,
                                createdAt: item.createdAt,
                                address: item.address,
                                years_of_experience: item.years_of_experience,
                                pitch_video_link: item.pitch_video_link,
                                active: item.active,
                                verified: item.verified,
                                verifiedAt: item.verifiedAt,
                                UserRole: item.UserRole,
                                category: item.category,
                                likeCount: item.likeCount ? item.likeCount.count : 0,
                                subscriptionCount: item.Subscriptions ? Array.isArray(item.Subscriptions) ? item.Subscriptions.length ? item.Subscriptions.length : 0 : 0 : 0,

                            }
                        });

                        res.send({status: "success",data:result, message: "Authors found"})
                    }else{
                        res.send({status: "fail",data:model, message: "Authors not found"})
                    }
                }else{
                    res.status(400).send({status: "fail", message: "User Account is unavailable"})
                }
            }
        )
            .catch(err=>{

                if (err.errors) {
                    next(new Error(err.errors[0].message))

                } else {
                    next(new Error(err.message))

                }
            })
    }

    static async authorsByCategory (req,res, next) {
        const {page = 0, limit = 20} = req.query;
        await models.Content.findAll(
            {
                where:{category_id:req.params.id},raw:true,attributes:['owner_id'],
    }
            )
        .then( async model=> {
            if (model) {
                if (model.length){
                    const result = _.uniq(_.map(model, item=>item.owner_id))

                    await models.User.findAll({where:{id:result},
                        include: [
                            {model: models.UserRole, where:{roleId: 99},include:  [{model:models.Role,attributes: ['name','id'],
                                }],  attributes: ['roleId']},
                            {model: models.ContentCategory,as:'category',attributes: ['name', 'id','description', 'image_url', 'slug']},
                            {
                                model:models.LikeCounter,
                                as:'likeCount',
                                attributes: ['count']
                            },
                            {
                                model:models.Subscription
                            }
                        ],
                        order: [['createdAt', 'DESC']],
                        ...paginate({page,limit})
                    }).then(data=>{
                        if (data.length){
                            let result = data.map(responseData=>{
                                const item =  responseData.toJSON()
                                const userHasSubed = _.has(item.Subscriptions.dataValues, item.userId == req.user.id)

                                return {
                                    id: item.id,
                                    fullname: item.fullname,
                                    firstname: item.firstname,
                                    lastname: item.lastname,
                                    email: item.email,
                                    phone: item.phone,
                                    photo: item.photo,
                                    username: item.username,
                                    country_name: item.country_name,
                                    birthday: item.birthday,
                                    online: item.online,
                                    createdAt: item.createdAt,
                                    about: item.about,
                                    address: item.address,
                                    years_of_experience: item.years_of_experience,
                                    pitch_video_link: item.pitch_video_link,
                                    active: item.active,
                                    verified: item.verified,
                                    verifiedAt: item.verifiedAt,
                                    UserRole: item.UserRole,
                                    category: item.category,
                                    likeCount: item.likeCount ? item.likeCount.count : 0,
                                    subscribedToAuthor: userHasSubed,
                                    subscriptionCount: item.Subscriptions ? Array.isArray(item.Subscriptions) ? item.Subscriptions.length ? item.Subscriptions.length : 0 : 0 : 0
                                }
                            });
                            res.send({status: "success",data:result, message: "Authors found"})
                        }else{
                            res.send({status: "success",data:null, message: "Authors not found"})
                        }
                    })
                        .catch(err=>{

                            if (err.errors) {
                                next(new Error(err.errors[0].message))

                            } else {
                                next(new Error(err.message))

                            }
                        })
                }else{
                    res.status(400).send({status: "fail",data:model, message: "No Author available for category"})
                }
            }else{
                res.status(400).send({status: "fail", message: "User Account is unavailable"})
            }
            }
        )
            .catch(err=>{

                if (err.errors) {
                    next(new Error(err.errors[0].message))

                } else {
                    next(new Error(err.message))

                }
            })
    }

    static async All (req,res, next) {
        const { page = 0, limit = 20, role = null, email = null, firstname = null, online = null, category_id = null } = req.query;
        let include = [
            {
                model: models.ContentCategory,
                as: 'category',
                attributes: ['name', 'id', 'description', 'image_url', 'slug']
            },
            {
                model:models.LikeCounter,
                as:'likeCount'
            },
            {
                model:models.Subscription
            },
            {model:models.UserRole,include: [
                    {model:models.Role,attributes: ['name','id'],
                        include: [
                            {model:models.RolePermission, attributes: ['permissionId', 'roleId'],
                                include: [
                                    {model:models.Permission, attributes: ['name','id']}
                                ]
                            },
                        ]
                    }],  attributes: ['roleId']},
            ];

            let query = {
                ...paginate({page,limit}), include:include
            }

            if (role){
                include[3] =  {
                    model: models.UserRole,
                    where: {roleId: role},
                    include: [{model: models.Role, attributes: ['name', 'id']}],
                    attributes: ['roleId'],
                    // limit:1,
                    order: [
                        ['id', 'DESC']
                    ]
                }
                query = {
                    ...query, include: include}
                }

        if (email){
            query = {...query,where:{email:email}}
        }

        if (online){
            query = {...query,where:{online:online}}
        }
        if (category_id){
            query = {...query,where:{category_id:category_id}}
                }

        if (firstname){
            query = {...query,where:{firstname:{[Op.like]: firstname+'%'}},
                attributes: [ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone','photo','username', 'country_name','birthday','createdAt','online','about','address','years_of_experience','pitch_video_link', 'active','verified','verifiedAt']
            }
        }
                            await models.User.findAndCountAll(query).then(data=>{
                                if (data.rows.length){
                                    let result = data.rows.map(item=>{

                                        return {
                                            id: item.id,
                                            fullname: item.fullname,
                                            firstname: item.firstname,
                                            lastname: item.lastname,
                                            email: item.email,
                                            phone: item.phone,
                                            photo: item.photo,
                                            username: item.username,
                                            country_name: item.country_name,
                                            birthday: item.birthday,
                                            about: item.about,
                                            online: item.online,
                                            createdAt: item.createdAt,
                                            address: item.address,
                                            years_of_experience: item.years_of_experience,
                                            pitch_video_link: item.pitch_video_link,
                                            active: item.active,
                                            verified: item.verified,
                                            verifiedAt: item.verifiedAt,
                                            UserRole: item.UserRole,
                                            category: item.category,
                                            likeCount: item.likeCount ? item.likeCount : 0,
                                            subscriptionCount: item.Subscriptions ? Array.isArray(item.Subscriptions) ? item.Subscriptions.length ? item.Subscriptions.length : 0 : 0 : 0,
                                        }
                                    });
                                    res.send({
                                        status: "success",
                                        data:result,
                                        message: "Users found",
                                        totalRows: data.count,
                                        currentPage: parseInt(page)
                                    })
                                }else{
                                    res.status(400).send({status: "fail",data:[], message: "Users not found"})
                                }
                            })
                                .catch(err=>{

                                    if (err.errors) {
                                        next(new Error(err.errors[0].message))

                                    } else {
                                        next(new Error(err.message))

                                    }
                                })
    }

    static async update (req,res, next) {
        const {id } = req.params;
        models.User.update(req.body,{where:{
                id:id
            }}).then(data=> {
                if(data){
                    if(data[0]) {
                        res.send({status: "success", message: "Account updated"})
                    }else{
                        res.send({ status: "fail", message:"Account not found"})
                    }
                }else{
                    res.send({ status: "fail", message:"Account not found"})
                }
            }
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async suspend (req,res, next) {
        const {id } = req.params;
        models.User.update({active:0},{where:{
                id:id
            }}).then(data=> {
                if(data){
                    if(data[0]) {
                        res.send({status: "success", message: "Account Suspended"})
                    }else{
                        res.send({ status: "fail", message:"Failed to suspend Account"})
                    }
                }else{
                    res.send({ status: "fail", message:"Account not found"})
                }
            }
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
        models.User.destroy({where:{
                id
            }}).then(data=> {
                if(data){
                    res.send({ status: "success", message:"Account removed"})
                }else{
                    res.send({ status: "fail", message:"Account not found"})
                }
            }
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async like (req,res, next) {
        const { id,action } = req.body;
        const payload = {
            likeableType:'user',
            likeableId:id,
            userId:req.user.id,
            typeId:'like'
        }

        models.User.count({ where: {'id': id} }).then( async user => {
            if (!user) {
                next(sendError(400, "Profile doesn't exist"));
            }else {
                if (action === 'like') {
                    const vals = {...payload, count: 1};
                    return db.transaction(t => {
                        return models.Likeable.findOrCreate({
                            where: {
                                likeableType: 'user',
                                likeableId: id,
                                userId: req.user.id,
                                typeId: 'like'
                            },
                            defaults: vals,
                            transaction: t
                        }).then(([item, created]) => {
                                if (created) {
                                    return models.LikeCounter.create({...payload, count: 1})
                                } else {
                                    return models.LikeCounter.increment(
                                        'count', {
                                            by: 1,
                                            where: {
                                                likeableType: 'user',
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
                            async (response) => {
                                const like_count = await models.LikeCounter.findAll({
                                    where: {
                                        likeableType: 'user',
                                        likeableId: id,
                                        userId: req.user.id,
                                        typeId: 'like'
                                    },
                                    attributes: ['id', [db.fn('sum', db.col('count')), 'total']],
                                    group: ['id'],
                                    raw: true,
                                    order: db.literal('total DESC')
                                });
                                res.send({
                                    status: "success",
                                    message: "Profile liked",
                                    data: {total_likes: like_count[0].total}
                                })
                            }
                        ).catch(error => {
                            next(sendError(400, error.message))
                        })
                } else {
                    try {
                        let transaction;
                        transaction = await db.transaction();
                        await models.Likeable.destroy({
                                where: {
                                    likeableType: 'user',
                                    likeableId: id,
                                    userId: req.user.id,
                                    typeId: 'like'
                                }
                            },
                            {transaction: transaction}
                        );

                        await models.LikeCounter.destroy({
                                where: {
                                    likeableType: 'user',
                                    likeableId: id,
                                    userId: req.user.id,
                                    typeId: 'like'
                                }
                            }, {transaction: transaction}
                        )
                        res.send({status: "success", message: "Profile UnLiked"})
                        await transaction.commit();
                    } catch (err) {
                        if (err.errors) {
                            next(sendError(400, err.errors[0].message))

                        } else {
                            next(sendError(400, err.message))
                        }
                    }
                }
            }   }
        ).catch (err=> {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))
            }
        })
    }

    static async follow(req,res,next){
        const { id,action } = req.body;
        const payload = {
            followableType:'user',
            followableId:id,
            followerId:req.user.id
        }

        models.User.count({ where: {'id': id} }).then( async user => {
            if (!user) {
                next(sendError(400, "Profile doesn't exist"));
            }else {
                if (action === 'follow') {
                        return models.Follower.findOrCreate({
                            where: {
                                followableType:'user',
                                followableId:id,
                                followerId:req.user.id
                            },
                        }).then(([item, created]) => {
                                if (created) {
                                    res.send({
                                        status: "success",
                                        message: "Profile followed",
                                        data: null
                                    })
                                } else {
                                    res.send({
                                        status: "success",
                                        message: "Profile already followed",
                                        data: null
                                    })
                                }
                            }
                        )
                      .catch(error => {
                            next(sendError(400, error.message))
                        })
                } else {
                    try {
                        await models.Follower.destroy({
                                where: {
                                    followableType:'user',
                                    followableId:id,
                                    followerId:req.user.id
                                }
                            }
                        );

                        res.send({status: "success", message: "Profile UnFollowed"})
                    } catch (err) {
                        if (err.errors) {
                            next(sendError(400, err.errors[0].message))

                        } else {
                            next(sendError(400, err.message))
                        }
                    }
                }
            }   }
        ).catch (err=> {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))
            }
        })
    }

    static async followers(req,res,next){
        const {page = 0, limit = 20} = req.query;
        const {id=req.user.id} = req.params;
        const payload = {
            followableType:'user',
            followableId:id,
        }

        models.Follower.findAndCountAll({
                        where: payload,
            include:[
                {model:models.User,attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone']
            },],
            ...paginate({page,limit})
                    }).then(data => {
                            if (data.rows) {
                                const result = data.rows.map(item=>{
                                    return item.User
                                })
                                res.send({
                                    status: "success",
                                    message: "Followers found",
                                    data: result,
                                    totalRows: data.count,
                                    currentPage: parseInt(page)
                                })
                            } else {
                                res.send({
                                    status: "success",
                                    message: "No followers",
                                    data: null
                                })
                            }
                        }
                    )
                        .catch(error => {
                            next(sendError(400, error.message))
                        })

    }

    static async reviews(req,res,next){
        const {page = 0, limit = 20} = req.query;
        const {id} = req.params;
        const payload = {
            reviewableType:'user',
            reviewableId:id,
        }

        models.Review.findAndCountAll({
                        where: payload,
            include:[
                {
                    as:'reviewBy',
                    model:models.User,
                    attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                    order: [['createdAt', 'DESC']],
            },],
            ...paginate({page,limit})
                    }).then(data => {
                            if (data.rows) {
                                // const result = data.rows.map(item=>{
                                //     return item.User
                                // })
                                res.send({
                                    status: "success",
                                    message: "Reviews found",
                                    data: data.rows,
                                    totalRows: data.count,
                                    currentPage: parseInt(page)
                                })
                            } else {
                                res.send({
                                    status: "success",
                                    message: "No Reviews",
                                    data: null
                                })
                            }
                        }
                    )
                        .catch(error => {
                            next(sendError(400, error.message))
                        })

    }


    static async inviteUser(req, res, next){
        try{
            var params = {
                Destination: { /* required */
                    CcAddresses: [
                        // 'victorighalo@gmail.com',
                        /* more items */
                    ],
                    ToAddresses:
                        [req.body.email]
                    /* more items */
    
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: getInvitationTemplate(req.body.message, req.body.role)
                        },
                        // Text: {
                        //     Charset: "UTF-8",
                        //     Data: "TEXT_FORMAT_BODY"
                        // }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Invitation to join AcademyHub'
                    }
                },
                Source: process.env.AWS_SENDER,
                // ReplyToAddresses: [
                //     req.body.email,
                //     /* more items */
                // ],
            };
    
            await sendEmail(params);
            res.status(200).send({status: "success", message: "Invitation sent successfully"})
        }
        catch(e){
            next(new Error(e.message))
        }
    }
}

module.exports = UserStore;
