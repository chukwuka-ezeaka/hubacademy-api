const slugify = require('slugify');
const models = require('../models/models.index');
const db = require('../../config/db');
const paginate = require('../../helpers/index').paginate;
const shortid = require('shortid');
const Content = require('../models/models.index').Content;
const Likeable = require('../models/models.index').Likeable;
const LikeCounter = require('../models/models.index').LikeCounter;
const GlobalSetting = require('../models/models.index').GlobalSetting;
const Sequelize = require('sequelize');
const { Op } = require("sequelize");
class ContentStore {

    static async create(req, res, next) {
        const { title,description,owner_id,url,category_id,content_type_id,art_id,status,price,sale_price,currency,free,content_media_id } = req.body;
        console.log(req.body)
        const payload = {
            title,
            slug: slugify(title.replace("#", "").toLowerCase())+shortid.generate(),
            description,
            owner_id,
            url,
            category_id,
            contenttype_id:content_type_id,
            art_id,
            status,
            price,
            sale_price,
            currency,
            free,
            content_media_id
        }
        try {
            await Content.create(payload).then((response)=>{
                res.send({status: "success", data: response, message: "Created Content"});
            })
        } catch (err) {
            if (err.errors) {
                next(sendError(400,err.errors[0].message))

            } else {
                next(sendError(400,err.message))

            }
        }
    }


    static async allCount (req,res, next) {
        const {owner_id} = req.query;

        let query = {};
        if (owner_id)  {
            query ={ owner_id:owner_id};
        }

        Content.findAndCountAll({
            where: query,
            //group:[['contenttype_id']],
        }).then(async data=> {
            const contentCategory = await models.ContentType.findAll({attributes: [ 'id', 'name', 'slug']});
                if(data.rows.length){
                    res.send({
                        message: "Contents found",
                        totalRows: data.count,
                        data: contentCategory
                    })
                }else{
                    res.status(400).send(
                        {
                        data: null,
                        message: "No Content",
                        status:'fail'
                        }
                    )
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async all (req,res, next) {
        const config = await GlobalSetting.findOne();
        console.log(config.toJSON())
        const {page = 0, limit = 20,owner_id,category_id,type_id,free=null} = req.query;

        let query = {};
        if (owner_id)  {
            query ={ owner_id:owner_id};
        }

        if(category_id){
            query = {...query,category_id:category_id}
        }

        if(type_id){
            query = {...query,contenttype_id:type_id}
        }

        if(free){
            if (free == 'yes'){
                query = {...query,free: '1'}
            }else{
                query = {...query,price: {[Op.not]: null}}
            }

        }

        Content.findAndCountAll({
            where:query,
            include: [
                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                {model:models.ContentType, as: 'content_type',attributes: [ 'id', 'name', 'slug']},
                {model:models.MediaLink, as: 'content_media',
                    attributes:  [ 'id', 'id', 'description', 'tags', 'status','url','owner_id','category_id','createdAt'],
                    include:[{model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']}]
                },
                {
                    model:models.LikeCounter,
                    as:'likeCount'
                },
                {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                    include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}]
                },
                {
                    model:models.MediaLink,
                    as: 'content_art',attributes: [ 'id', 'url', 'status'],
                    include:[
                        {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                        {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']}
                    ]
                },
            ],
            attributes: [  'id', 'title', 'description', 'status', 'slug', 'free',
                'sale', 'price', 'sale_price','currency', 'createdAt', 'updatedAt'],
            paranoid: true,
            order: [['createdAt', 'DESC']],
            //group:[['contenttype_id']],
            // raw:true,
            ...paginate({page,limit})

        }).then(async data=> {
                let result = []
                await data.rows.map( async item=>{
                    const amount = config.toJSON().collection_fee_percent * item.price
                    result.push({
                    id:item.id,
                    title:item.title,
                        slug:item.slug,
                        description:item.description,
                        free:item.free,
                        status:item.status,
                        fee:amount,
                        price:item.price,
                        sale_price:item.sale_price,
                        currency:item.currency,
                        createdAt:item.createdAt,
                        updatedAt:item.updatedAt,
                        category:item.category,
                        content_type:item.content_type,
                        content_media:item.content_media,
                        owner:item.owner,
                        content_art:item.content_art,
                        like_count:data.likeCount ? data.likeCount.count : 0
                    })

                })

                if(data.rows.length){
                    res.send({
                        data: result,
                        message: "Contents found",
                        status:'success',
                        totalRows: data.count,
                        currentPage: parseInt(page)
                    })
                }else{
                    res.status(400).send(
                        {
                        data: null,
                        message: "No Content",
                        status:'fail'
                        }
                    )
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async free (req,res, next) {
        const config = await GlobalSetting.findOne();
        console.log(config.toJSON())
        const {page = 0, limit = 20,owner_id,category_id,type_id,free=null} = req.query;

        let query = {};
        if (owner_id)  {
            query ={ owner_id:owner_id};
        }

        if(category_id){
            query = {...query,category_id:category_id}
        }

        if(type_id){
            query = {...query,contenttype_id:type_id}
        }

       
        query = {...query,free: '1'}
            

        Content.findAndCountAll({
            where:query,
            include: [
                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                {model:models.ContentType, as: 'content_type',attributes: [ 'id', 'name', 'slug']},
                {model:models.MediaLink, as: 'content_media',
                    attributes:  [ 'id', 'id', 'description', 'tags', 'status','url','owner_id','category_id','createdAt'],
                    include:[{model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']}]
                },
                {
                    model:models.LikeCounter,
                    as:'likeCount'
                },
                {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                    include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}]
                },
                {
                    model:models.MediaLink,
                    as: 'content_art',attributes: [ 'id', 'url', 'status'],
                    include:[
                        {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                        {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']}
                    ]
                },
            ],
            attributes: [  'id', 'title', 'description', 'status', 'slug', 'free',
                'sale', 'price', 'sale_price','currency', 'createdAt', 'updatedAt'],
            paranoid: true,
            order: [['createdAt', 'DESC']],
            //group:[['contenttype_id']],
            // raw:true,
            ...paginate({page,limit})

        }).then(async data=> {
                let result = []
                await data.rows.map( async item=>{
                    const amount = config.toJSON().collection_fee_percent * item.price
                    result.push({
                    id:item.id,
                    title:item.title,
                        slug:item.slug,
                        description:item.description,
                        free:item.free,
                        status:item.status,
                        fee:amount,
                        price:item.price,
                        sale_price:item.sale_price,
                        currency:item.currency,
                        createdAt:item.createdAt,
                        updatedAt:item.updatedAt,
                        category:item.category,
                        content_type:item.content_type,
                        content_media:item.content_media,
                        owner:item.owner,
                        content_art:item.content_art,
                        like_count:data.likeCount ? data.likeCount.count : 0
                    })

                })

                if(data.rows.length){
                    res.send({
                        data: result,
                        message: "Contents found",
                        status:'success',
                        totalRows: data.count,
                        currentPage: parseInt(page)
                    })
                }else{
                    res.status(400).send(
                        {
                        data: null,
                        message: "No Content",
                        status:'fail'
                        }
                    )
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async store (req,res, next) {
        const {page = 0, limit = 20,owner_id,category_id,type_id,free=null} = req.query;

        let query = {price:{[Sequelize.Op.not]:null}};
        if (owner_id)  {
            query ={ owner_id:owner_id};
        }

        if(category_id){
            query = {...query,category_id:category_id}
        }

        if(type_id){
            query = {...query,contenttype_id:type_id}
        }

        if(free){
            if (free == 'yes'){
                query = {...query,free: '1'}
            }else{
                query = {...query,price: {[Op.not]: null}}
            }

        }

        Content.findAndCountAll({
            where:query,
            include: [
                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                {model:models.ContentType, as: 'content_type',attributes: [ 'id', 'name', 'slug']},
                {model:models.MediaLink, as: 'content_media',
                    attributes:  [ 'id', 'id', 'description', 'tags', 'status','url','owner_id','category_id','createdAt'],
                    include:[{model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']}]
                },
                {
                    model:models.LikeCounter,
                    as:'likeCount'
                },
                {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                    include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}]
                },
                {
                    model:models.MediaLink,
                    as: 'content_art',attributes: [ 'id', 'url', 'status'],
                    include:[
                        {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                        {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']}
                    ]
                },
            ],
            attributes: [  'id', 'title', 'description', 'status', 'slug', 'free',
                'sale', 'price', 'sale_price','currency', 'createdAt', 'updatedAt','art_id'],
            paranoid: true,
            order: [['createdAt', 'DESC']],
            // raw:true,
            ...paginate({page,limit})

        }).then(async data=> {
                let result = []
                await data.rows.map( async item=>{
                    result.push({
                    id:item.id,
                    title:item.title,
                        slug:item.slug,
                        description:item.description,
                        status:item.status,
                        free:item.free,
                        price:item.price,
                        sale_price:item.sale_price,
                        currency:item.currency,
                        createdAt:item.createdAt,
                        updatedAt:item.updatedAt,
                        category:item.category,
                        content_type:item.content_type,
                        content_media:item.content_media,
                        owner:item.owner,
                        content_art:item.content_art,
                        like_count:data.likeCount ? data.likeCount.count : 0
                    })

                })

                if(data.rows.length){
                    res.send({
                        data: result,
                        message: "Contents found",
                        status:'success',
                        totalRows: data.count,
                        currentPage: parseInt(page)
                    })
                }else{
                    res.status(400).send(
                        {
                        data: null,
                        message: "No Content",
                        status:'fail'
                        }
                    )
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async get (req,res, next) {
        Content.findOne({
            where:{id:req.params.id},
            include: [
                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                {model:models.ContentType, as: 'content_type',attributes: [ 'id', 'name', 'slug']},
                {
                    model:models.LikeCounter,
                    as:'likeCount'
                },
                {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                    include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}] },
                {
                    model:models.MediaLink,
                    as: 'content_art',attributes: [ 'id', 'url', 'status'],
                    include:[
                        {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                        {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']}
                        ]
                },
            ],
            attributes: [  'id', 'title', 'description', 'status', 'slug', 'free', 'sale', 'price', 'sale_price','currency', 'createdAt', 'updatedAt'],
            paranoid: true
        }).then( async data=> {
                if (data) {
                    let result ={
                            id:data.id,
                            title:data.title,
                            slug:data.slug,
                            description:data.description,
                            status:data.status,
                            free:data.free,
                            price:data.price,
                            sale_price:data.sale_price,
                            currency:data.currency,
                            createdAt:data.createdAt,
                            updatedAt:data.updatedAt,
                            category:data.category,
                            content_type:data.content_type,
                            owner:data.owner,
                            content_art:data.content_art,
                            like_count:data.likeCount ? data.likeCount.count : 0
                        }

                    let userHasLikedContent = await models.Likeable.findAndCountAll({
                        where: {
                            likeableType: 'content',
                            likeableId: result.id,
                            userId: req.user.id,
                            typeId: 'like'
                        }
                    })

                    result.liked_by_user = userHasLikedContent ? userHasLikedContent.count : 0

                    res.send({data: result, status: "success", message:"Content found"})
                } else {
                    res.status(400).send({data:null, status: "fail",message:"Content not found"})
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
        Content.destroy({where:{
                id:id
            }}).then(data=> {
                if(data){
                    res.send({ status: "success", message:"Content removed"})
                }else{
                    res.send({ status: "fail", message:"Content not found"})
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

    static async update (req,res, next) {
        const { id } = req.params;
        const { title,description,owner_id,url,category_id,content_type_id,art_id,status,price,sale_price,currency,free } = req.body;
        const payload = { title,slug: slugify(title.replace("#", "").toLowerCase()),description,owner_id,url,category_id,contenttype_id:content_type_id,art_id,status,price,sale_price,currency,free }
        try {
            await Content.update(
                payload, {where: {id: id}}
            ).then(async data=>{

                if(data){
                    if(data[0]) {
                        await
                            Content.findOne({
                                where:{id:id},
                                include: [
                                    {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                                    {model:models.ContentType, as: 'content_type',attributes: [ 'id', 'name', 'slug']},
                                    {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                                        include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}] },
                                    {
                                        model:models.MediaLink,
                                        as: 'content_art',attributes: [ 'media_id', 'url', 'status'],
                                        include:[
                                            {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                                            {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']}
                                        ]
                                    },
                                ],
                                attributes: [  'id', 'title', 'description', 'status', 'slug', 'free', 'sale', 'price', 'sale_price','currency', 'createdAt', 'updatedAt'],
                                paranoid: true
                            })
                                .then(data=> {
                                        if (data) {
                                            res.send({status: "success", message: "Content updated", data: data})
                                        } else {
                                            res.status(400).send({data: {}, status: "fail",message:"Content not found"})
                                        }
                                    }
                                )
                                .catch(err=>{
                                    next(sendError(400,err.message))
                                })
                    }else{
                        res.status(400).send({status: "fail", message: "Content not found"})
                    }
                }else{
                    res.status(400).send({status: "fail", message: "Content not found"})
                }
            })

        }catch (err) {
            if (err.errors) {
                next(sendError(400,err.errors[0].message))

            } else {
                next(sendError(400,err.message))

            }
        }
    }

    static async like (req,res, next) {
        const { id,action } = req.body;
        const payload = {
            likeableType:'content',
            likeableId:id,
            userId:req.user.id,
            typeId:'like'
        }

        models.Content.count({ where: {'id': id} }).then( async res => {
            if (!res) {
                next(sendError(400, "Content doesn't exist"));
            }else {
                if (action === 'like') {
                    const vals = {...payload, count: 1};
                    return db.transaction(t => {
                        return Likeable.findOrCreate({
                            where: {
                                likeableType: 'content',
                                likeableId: id,
                                userId: req.user.id,
                                typeId: 'like'
                            },
                            defaults: vals,
                            transaction: t
                        }).then(([item, created]) => {
                                if (created) {
                                    return LikeCounter.create({...payload, count: 1})
                                } else {
                                    return LikeCounter.increment(
                                        'count', {
                                            by: 1,
                                            where: {
                                                likeableType: 'content',
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
                                const like_count = await LikeCounter.findAll({
                                    where: {
                                        likeableType: 'content',
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
                                    message: "Content liked",
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
                        await Likeable.destroy({
                                where: {
                                    likeableType: 'content',
                                    likeableId: id,
                                    userId: req.user.id,
                                    typeId: 'like'
                                }
                            },
                            {transaction: transaction}
                        );

                        await LikeCounter.destroy({
                                where: {
                                    likeableType: 'content',
                                    likeableId: id,
                                    userId: req.user.id,
                                    typeId: 'like'
                                }
                            }, {transaction: transaction}
                        )
                        res.send({status: "success", message: "Content UnLiked"})
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
}

module.exports = ContentStore;
