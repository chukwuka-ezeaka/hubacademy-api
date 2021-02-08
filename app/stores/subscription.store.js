const moment = require("moment");
const db = require('../../config/db');
const models = require('../models/models.index');
const {paginate} = require("../../helpers");
const Sequelize = require('sequelize');
const {getSubscriptionExpiry} = require("../../helpers");
const {transactionStatus} = require('../../helpers/index');
class SubscriptionStore {

    static async Subscribe(req, res, next) {
        const payload  = {
            subscription_genus: req.body.subscription_genus,
            subscription_type: req.body.subscription_type,
            authorId: req.body.authorId,
            categoryId: req.body.categoryId,
            contentId: req.body.contentId,
            expiresAt: moment(req.body.expiresAt).format('YYYY-MM-D h:m:s'),
            userId: req.user.id,
            amount: req.body.amount
        }

        if (payload.categoryId === undefined && payload.authorId === undefined && payload.contentId === undefined){
            next(sendError(400, 'one of either categoryId or contentId or authorId field is required'))
        }else if (payload.contentId && payload.authorId === undefined){
                next(sendError(400, 'authorId is required to subscribe to a content'))
        }else if (payload.authorId === undefined){
                next(sendError(400, 'authorId is required to subscribe to an author'))
        }else {
            try {
                if (payload.authorId && payload.contentId){
                    const content = await models.Content.findOne({where:{id:payload.contentId,owner_id:payload.authorId}})
                    if (content){
                        const alreadySubscribed = await models.Subscription.findOne({where:{
                            contentId:payload.contentId,
                                authorId:payload.authorId,
                                expiresAt:{[Sequelize.Op.lt]:moment(new  Date())},
                                subscription_genus: req.body.subscription_genus,
                                subscription_type: req.body.subscription_type,
                        }})
                        if(alreadySubscribed){
                            next(sendError(400, 'You already have this item is your library'))
                        }else {

                            if (content.free === '1') {
                                await models.Subscription.create(payload)
                                    .then((response) => {
                                        res.send({
                                            status: "success",
                                            data: response,
                                            message: "Freebie Subscription successful"
                                        });

                                    })
                                    .catch((err) => {
                                        console.log(err)
                                        next(new Error(err.message))
                                    })
                            } else {

                                await models.Wallet.findOne({where: {holder_id: req.user.id}})
                                    .then(async (wallet, err) => {
                                        if (err) {
                                            next(sendError(400, err.message))
                                        }
                                        if (wallet.balance >= payload.amount) {
                                            return db.transaction(async t => {
                                                wallet.update(
                                                    {balance: wallet.balance - req.body.amount},
                                                    {transaction: t}
                                                )
                                                    .catch((err) => {
                                                        console.log(err)
                                                        next(new Error(err.message))
                                                    })
                                                await models.Subscription.create(payload)
                                                    .then((response) => {
                                                        res.send({
                                                            status: "success",
                                                            data: response,
                                                            message: "Subscription successful"
                                                        });

                                                    })
                                                    .catch((err) => {
                                                        console.log(err)
                                                        next(new Error(err.message))
                                                    })
                                            }).catch((err) => {
                                                console.log(err)
                                                next(new Error(err.message))
                                            })
                                        } else {
                                            next(sendError(400, 'Insufficient wallet balance'))
                                        }
                                    })
                            }
                        }

                    }else{
                        next(sendError(400, 'Content is not available'))
                    }

                }else {

                        const alreadySubscribed = await models.Subscription.findOne({where:{
                                contentId:payload.contentId,
                                authorId:payload.authorId,
                                expiresAt:{[Sequelize.Op.lt]:moment(new  Date())},
                                subscription_genus: req.body.subscription_genus,
                                subscription_type: req.body.subscription_type,
                            }})
                        if(alreadySubscribed){
                            next(sendError(400, 'You already have this item is your library'))
                        }else {
                            await models.Wallet.findOne({where: {holder_id: req.user.id}})
                                .then(async (wallet, err) => {
                                    if (err) {
                                        next(sendError(400, err.message))
                                    }
                                    if (wallet.balance >= payload.amount) {
                                        return db.transaction(async t => {
                                            wallet.update(
                                                {balance: wallet.balance - req.body.amount},
                                                {transaction: t}
                                            )
                                                .catch((err) => {
                                                    console.log(err)
                                                    next(new Error(err.message))
                                                })
                                            await models.Subscription.create(payload)
                                                .then((response) => {
                                                    res.send({
                                                        status: "success",
                                                        data: response,
                                                        message: "Subscription successful"
                                                    });

                                                })
                                                .catch((err) => {
                                                    console.log(err)
                                                    next(new Error(err.message))
                                                })
                                        }).catch((err) => {
                                            console.log(err)
                                            next(new Error(err.message))
                                        })
                                    } else {
                                        next(sendError(400, 'Insufficient wallet balance'))
                                    }
                                })
                        }
                }


            } catch (err) {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
            }
        }
    }

    static async Subscriptions(req,res, next){

        try {
            const {page = 0, limit = 20, subscription_genus, subscription_type, status=null} = req.query;
            if (subscription_genus === undefined || subscription_type === undefined) {
                next(sendError(400, 'both subscription_type and subscription_genus query params are required'))
            } else {
                let query = {subscription_type: subscription_type, subscription_genus: subscription_genus, userId:req.user.id};

                if (status)  {
                    if (status == 'expired'){
                        query = {...query,expiresAt:{[Sequelize.Op.lt]:moment(new Date())}};
                    }else if (status == 'active'){
                        query = {...query,expiresAt:{[Sequelize.Op.gte]:moment(new  Date())}};
                    }
                }
                let extraQuery = null
                if (subscription_genus === 'category'){
                    extraQuery =  {
                        include: [
                            {
                        model:models.ContentCategory,
                        as:'category',
                        attributes: [ 'id', 'name', 'description','image_url','slug']
                            }
                        ]
                    };
                }else if (subscription_genus === 'author'){
                    extraQuery = {
                        include: [
                            {
                                model: models.User,
                                as: 'author',
                                attributes: ['id', 'name', 'firstname', 'lastname', 'email', 'phone', 'online', 'about', 'pitch_video_link', 'years_of_experience', 'photo', 'username', 'country_name', 'birthday', 'createdAt']
                            }
                        ]
                    }
                }
                await models.Subscription.findAndCountAll({
                    where: query,
                    ...extraQuery,
                    attributes: [ 'id', 'subscription_genus', 'subscription_type','subscription_interval','expiresAt','createdAt'],
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    ...paginate({page, limit})
                }).then(async result => {
                    //Transform result
                    const transformed_result = result.rows.map(item=>{

                        return (
                            {
                                subscription_id:item.id,
                                subscription_genus:item.subscription_genus,
                                subscription_type:item.subscription_type,
                                expiresAt:item.expiresAt,
                                createdAt:item.createdAt,
                                isExpired: moment(item.expiresAt).isBefore(new Date()),
                                data:item.subscription_genus === 'category' ? item.category : item.author,

                            }
                        )
                    });
                    res.send({
                        data: transformed_result,
                        status: "success",
                        totalRows:result.count,
                        currentPage:page,
                        message: "Subscriptions found"
                    });
                })
            }
        }
        catch
            (err)
            {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
            }

    }

    static async StorePurchases(req,res, next){
        try {
            const {page = 0, limit = 20, subscription_genus='content', subscription_type='purchase'} = req.query;

            if (subscription_genus === undefined) {
                next(sendError(400, 'subscription_type query param is required'))
            } else {
                await models.Subscription.findAndCountAll({
                    where: {subscription_type: subscription_type, subscription_genus: subscription_genus,userId:req.user.id},
                    include:[
                        {model:models.Content, as: 'content',attributes: [ 'id', 'title', 'description','status','slug'],
                            include: [
                                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                                {model:models.ContentType, as: 'content_type',attributes: [ 'id', 'name', 'slug']},
                                {
                                    model:models.MediaLink,
                                    as: 'content_art',attributes: [ 'id', 'url', 'status'],
                                    include:[
                                        {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                                        {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']}
                                    ]
                                },
                            ],
                        },
                        {
                            model:models.User,
                            as:'author',
                            attributes: [ 'id', 'name', 'firstname','lastname','email','phone','online','about','pitch_video_link','years_of_experience','photo','username','country_name','birthday','createdAt']
                        }
                    ],
                    attributes: [ 'id'],
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    ...paginate({page, limit})
                }).then(async result => {
                    if(result) {
                        if (result.rows.length) {
                            res.send({
                                data: result.rows,
                                status: "success",
                                totalRows: result.count,
                                currentPage: page,
                                message: "Purchases found"
                            });
                        } else {
                            res.send({
                                data: null,
                                status: "success",
                                totalRows: 0,
                                currentPage: 0,
                                message: "Purchases not found"
                            });
                        }
                    }else{
                        res.send({
                            data: null,
                            status: "fail",
                            totalRows: 0,
                            currentPage: 0,
                            message: "Purchases not found"
                        });
                    }

                })
            }
        }
        catch
            (err)
        {
            if (err.errors) {
                next(sendError(400, err.errors[0].message))

            } else {
                next(sendError(400, err.message))

            }
        }

    }

    static async SubscribeToAuthor(req, res,next){
        const payload  = {
            subscription_genus: 'author',
            subscription_type: 'subscription',
            authorId: req.body.authorId,
            expiresAt: getSubscriptionExpiry(req.body.duration),
            userId: req.user.id,
            amount: req.body.amount,
            subscription_interval: req.body.duration,
        }

        if (payload.authorId === undefined){
            next(sendError(400, 'authorId is required to subscribe to an author'))
        }else {
            try {
                const query =`SELECT COUNT(firstname) as doesExist from users JOIN userrole ON userrole.roleId = 99 AND userrole.userId = ${payload.authorId} WHERE users.id = ${payload.authorId}`;
                const results= await db.query(query, { type: db.QueryTypes.SELECT })

                if (results[0].doesExist == 0){
                    return next(sendError(400, 'Author selected is not available'))
                }
                const alreadySubscribed = await models.Subscription.findOne({where:{
                        authorId:payload.authorId,
                        expiresAt:{[Sequelize.Op.lt]:moment(new  Date())},
                        subscription_genus: 'author',
                        subscription_type: 'subscription',
                        subscription_interval: req.body.duration,
                        userId: req.user.id
                    }});

                if(alreadySubscribed && req.body.forceSubscription === 'no'){
                    await models.User.findByPk(payload.authorId,{
                        attributes: [ ['name','fullname'],
                            'firstname', 'lastname', 'email', 'id', 'phone','photo','username', 'country_name','birthday','createdAt','online','years_of_experience','pitch_video_link','about','verified']
                    }).then(result=>{
                        res.send({
                            status: "fail",
                            data: {expiresAt:alreadySubscribed.expiresAt,duration:alreadySubscribed.subscription_interval,author:result},
                            message: "You are currently subscribed to this author"
                        });
                    })
                        .catch((err) => {
                            next(new Error(err.message))
                        })

                }else {
                     models.Wallet.findOne({where: {holder_id: req.user.id}})
                        .then(async (wallet, err) => {
                            if (err) {
                                return next(sendError(400, err.message))
                            }
                            if (wallet.balance >= payload.amount) {
                                return db.transaction(async t => {
                                    wallet.update(
                                        {balance: (wallet.balance - req.body.amount)},
                                        {transaction: t}
                                    )
                                        .catch((err) => {
                                            // console.log(err)
                                            return next(new Error(err.message))
                                        })
                                    await models.Subscription.create(payload)
                                        .then((response) => {
                                            res.send({
                                                status: "success",
                                                data: response,
                                                message: "Subscription successful"
                                            });

                                        })
                                        .catch((err) => {
                                            // console.log(err)
                                            next(new Error(err.message))
                                        })
                                }).catch((err) => {
                                    // console.log(err)
                                    next(new Error(err.message))
                                })
                            } else {
                                next(sendError(400, 'Insufficient wallet balance.'))
                            }
                        })
                }

            } catch (err) {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
            }
        }
    }

    static async SubscribeToCategory(req, res,next){
        const payload  = {
            subscription_genus: 'category',
            subscription_type: 'subscription',
            categoryId: req.body.categoryId,
            expiresAt: getSubscriptionExpiry(req.body.duration),
            userId: req.user.id,
            amount: req.body.amount,
            subscription_interval: req.body.duration,
        }

        if (payload.categoryId === undefined){
            next(sendError(400, 'categoryId is required to subscribe to an author'))
        }else {
            try {
                const query =`SELECT COUNT(name) as doesExist from contentcategories WHERE id = ${payload.categoryId}`;
                const results= await db.query(query, { type: db.QueryTypes.SELECT })

                if (results[0].doesExist == 0){
                    return next(sendError(400, 'Category selected is not available'))
                }
                const alreadySubscribed = await models.Subscription.findOne({where:{
                        categoryId:payload.categoryId,
                        expiresAt:{[Sequelize.Op.lt]:moment(new  Date())},
                        subscription_genus: 'category',
                        subscription_type: 'subscription',
                        subscription_interval: req.body.duration,
                        userId: req.user.id
                    }});

                if(alreadySubscribed && req.body.forceSubscription === 'no'){
                    await models.ContentCategory.findByPk(payload.categoryId,{
                        attributes: ['name', 'slug','description','image_url']
                    }).then(result=>{
                        res.send({
                            status: "fail",
                            data: {expiresAt:alreadySubscribed.expiresAt,duration:alreadySubscribed.subscription_interval,category:result},
                            message: "You are currently subscribed to this category"
                        });
                    })
                        .catch((err) => {
                            next(new Error(err.message))
                        })

                }else {
                     models.Wallet.findOne({where: {holder_id: req.user.id}})
                        .then(async (wallet, err) => {
                            if (err) {
                                return next(sendError(400, err.message))
                            }
                            if (wallet.balance >= payload.amount) {
                                return db.transaction(async t => {
                                    wallet.update(
                                        {balance: (wallet.balance - req.body.amount)},
                                        {transaction: t}
                                    )
                                        .catch((err) => {
                                            // console.log(err)
                                            return next(new Error(err.message))
                                        })
                                    await models.Subscription.create(payload)
                                        .then((response) => {
                                            res.send({
                                                status: "success",
                                                data: response,
                                                message: "Subscription successful"
                                            });

                                        })
                                        .catch((err) => {
                                            // console.log(err)
                                            next(new Error(err.message))
                                        })
                                }).catch((err) => {
                                    // console.log(err)
                                    next(new Error(err.message))
                                })
                            } else {
                                next(sendError(400, 'Insufficient wallet balance.'))
                            }
                        })
                }

            } catch (err) {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
            }
        }
    }

    static async PurchaseContent(req, res,next){
        const payload  = {
            subscription_genus: 'content',
            subscription_type: 'purchase',
            contentId: req.body.contentId,
            authorId: req.body.authorId,
            userId: req.user.id,
            amount: req.body.amount
        }

        if (payload.contentId === undefined && payload.authorId === undefined){
            next(sendError(400, 'contentId and authorId is required to purchase a content'))
        }else {
            try {
                const query =`SELECT * from content WHERE id = ${payload.contentId} AND owner_id = ${payload.authorId} LIMIT 1`;
                const [result] = await db.query(query, { type: db.QueryTypes.SELECT })

                if (!result){
                    return next(sendError(400, 'Content selected is not available'))
                }
                if(parseInt(result.price) != payload.amount){
                    return next(sendError(400, 'Content Price mis-match'))
                }
                const alreadySubscribed = await models.Subscription.findOne({where:{
                        contentId:payload.contentId,
                        authorId:payload.authorId,
                        subscription_genus: 'content',
                        subscription_type: 'purchase',
                        userId: req.user.id
                    }});

                if(alreadySubscribed){
                    await models.Content.findByPk(payload.categoryId,{
                        attributes: ['title', 'slug','description']
                    }).then(result=>{
                        res.send({
                            status: "fail",
                            // data: {expiresAt:alreadySubscribed.expiresAt,duration:alreadySubscribed.subscription_interval,content:result},
                            message: "You have already purchased this content."
                        });
                    })
                        .catch((err) => {
                            next(new Error(err.message))
                        })

                }else {
                    models.Wallet.findOne({where: {holder_id: req.user.id}})
                        .then(async (wallet, err) => {
                            if (err) {
                                return next(sendError(400, err.message))
                            }
                            if (wallet.balance >= payload.amount) {
                                return db.transaction(async t => {
                                    wallet.update(
                                        {balance: (wallet.balance - req.body.amount)},
                                        {transaction: t}
                                    )
                                        .catch((err) => {
                                            // console.log(err)
                                            return next(new Error(err.message))
                                        })
                                    await models.Subscription.create(payload)
                                        .then((response) => {
                                            res.send({
                                                status: "success",
                                                message: "Purchase successful"
                                            });

                                        })
                                        .catch((err) => {
                                            // console.log(err)
                                            next(new Error(err.message))
                                        })
                                }).catch((err) => {
                                    // console.log(err)
                                    next(new Error(err.message))
                                })
                            } else {
                                next(sendError(400, 'Insufficient wallet balance.'))
                            }
                        })
                }

            } catch (err) {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
            }
        }
    }

    static async PurchaseContentDirect(req, res,next){
        const payload  = {
            subscription_genus: 'content',
            subscription_type: 'purchase',
            contentId: req.body.contentId,
            authorId: req.body.authorId,
            userId: req.user.id,
            amount: req.body.amount,
            transaction_ref: req.body.transaction_ref,
        }

            try {

                const query =`SELECT * from content WHERE id = ${payload.contentId} AND owner_id = ${payload.authorId} LIMIT 1`;
                const [result] = await db.query(query, { type: db.QueryTypes.SELECT })

                if (!result){
                    return next(sendError(400, 'Content selected is not available'))
                }
                if(parseInt(result.price) != payload.amount){
                    return next(sendError(400, 'Content Price mis-match'))
                }
                const alreadySubscribed = await models.Subscription.findOne({where:{
                        contentId:payload.contentId,
                        authorId:payload.authorId,
                        subscription_genus: 'content',
                        subscription_type: 'purchase',
                        userId: req.user.id
                    }});

                if(alreadySubscribed){
                    return res.send({
                        status: "fail",
                        message: "You have already purchased this content."
                    });

                }
                //Validate Trans
                let status = false;
                await this.validateTrans(req.body.transaction_ref,req.user.id,payload.amount).then(
                    res=>status = res
                )
                if (!status){
                    return next(new Error('Invalid or Expired Transaction'))
                }
                else {
                    //BURN TRANSACTION
                    const query = "UPDATE transactions SET burnt = 1 WHERE transactions.reference = ?";
                    const [results, metadata] = await db.query(query, {replacements: [payload.transaction_ref], type: db.QueryTypes.UPDATE })

                            await models.Subscription.create(payload)
                                .then(async (response) => {
                                    res.send({
                                        status: "success",
                                        message: "Purchase successful"
                                    });

                                })
                                .catch((err) => {
                                    // console.log(err)
                                    next(new Error(err.message))
                                })


                }

            }
            catch (err) {
                if (err.errors) {
                    next(sendError(400, err.errors[0].message))

                } else {
                    next(sendError(400, err.message))

                }
        }
    }

    static async validateTrans(ref,user_id,amount){
        let status = false;
        await models.Transaction.findOne({where:{'reference':ref,user_id:user_id,status:transactionStatus.COMPLETED,amount:amount,burnt:0}}).then(result=>{
            if (result){
                    status = true;
                }else{

                }
        })
            .catch((err) => {
                console.log(err)
            })
        return status
    }

}

module.exports = SubscriptionStore;
