const models = require('../models/models.index');
const MediaLink = require('../models/models.index').MediaLink;
const paginate = require('../../helpers/index').paginate;

class MediaLinkStore {

    static async create(req, res, next, link,type_id_internal) {
        const { category_id, title, description,tags,status,admin,url, type_id } = req.body;
        const payload = {
            owner_id:admin ? null : req.user.id,
            url:link ? link : url,
            category_id:category_id ? category_id : null,
            type_id:type_id_internal ? type_id_internal : type_id,
            title:title,
            description:description,
            tags:tags,
            status:status,
        }
        try {
            await MediaLink.create(payload).then((response)=>{
                // const result  = {id:response.media_id,owner_id:response.owner_id,url:response.url};
                res.send({status: "success", data: response, message: "Media Created"});
            })
        } catch (err) {
            if (err.errors) {
                next(sendError(400,err.errors[0].message))

            } else {
                next(sendError(400,err.message))

            }
        }
    }

    static async all (req,res, next) {
        let owner = req.user.id;
        const {page = 0, limit = 20,admin, owner_id} = req.query;
        if (owner_id){
            owner = owner_id
        }
        if (admin){
            owner = null
        }

        MediaLink.findAndCountAll({
            where:{owner_id:owner},
            include: [
                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                // {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                //     include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}] },
                {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
            ],
            attributes: [ 'id', 'url', 'title', 'description','tags','status' ],
            paranoid: true,
            order: [['createdAt', 'DESC']],
            ...paginate({page,limit})
        }).then(data=> {
            if (data.rows.length) {
                res.send({
                    data: data.rows,
                    rowCount: data.count,
                    status: "success",
                    message: 'Found media'
                })
            }else{
                res.status(400).send({
                    data: null,
                    status: "fail",
                    rowCount: 0,
                    message: 'No media Found'
                })
            }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async get (req,res, next) {

        MediaLink.findOne({
            where:{
                id:req.params.id
            },
            include: [
                {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                // {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                //     include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}] },
                {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                ],
            attributes: [ 'id', 'url', 'title', 'description','tags','status' ],
            paranoid: true
        }).then(async  response => {
                if (response) {
                    res.send({data: response, status: "success", message:"Media found"})
                } else {
                    res.status(400).send({status: "fail",message:"Media not found"})
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
        MediaLink.destroy({where:{
                id:id
            }}).then(data=> {
                if(data){
                    res.send({ status: "success", message:"Media removed"})
                }else{
                    res.send({ status: "fail", message:"Media not found"})
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

    static async update (req,res, next, link) {
        const { id } = req.params;
        const { category_id,type_id, title, description,tags,status,admin } = req.body;
        let owner = req.user.id;
        if (admin){
            owner = null
        }

        const payload = {
            url:link,
            category_id:category_id ? category_id : null,
            type_id:type_id,
            title:title,
            description:description,
            tags:tags,
            status:status,
        }

        try {
            await MediaLink.update(
                payload, {where: {id: id,owner_id:owner}}
                ).then(async data=>{
                if(data){
                    if(data[0]) {
                        await
                            MediaLink.findOne({
                                where:{media_id:req.params.id},
                                include: [
                                    {model:models.ContentCategory, as: 'category', attributes: [ 'id', 'name', 'slug']},
                                    // {model:models.User, as: 'owner',attributes:[ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone'],
                                    //     include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}], attributes: ['roleId']}] },
                                    {model:models.ContentType, as: 'media_type',attributes: [ 'id', 'name', 'slug']},
                                ],
                                attributes: [  'media_id', 'url'],
                                paranoid: true
                            })
                                .then(data=> {
                                        if (data) {
                                            res.send({status: "success", message: "Media updated", data: data})
                                        } else {
                                            res.status(400).send({data: {}, status: "fail",message:"Media not found"})
                                        }
                                    }
                                )
                                .catch(err=>{
                                    next(sendError(400,err.message))
                                })
                    }else{
                        res.send({status: "fail", message: "Media not found"})
                    }
                }else{
                    res.send({status: "fail", message: "Media not found"})
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
}

module.exports = MediaLinkStore;
