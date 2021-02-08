const slugify = require('slugify');
const ContentType = require('../models/models.index').ContentType;

class ContentTypeStore {

    static async create(req, res, next) {
        const { name } = req.body;
        const payload = {name:name, slug: slugify(name.replace("#", "").toLowerCase()),}
        try {
            await ContentType.create(payload).then((response)=>{
                const result  = {id:response.id,name:response.name,slug:response.slug};
                res.send({status: "success", data: result, message: "Created Content type"});
            })
        } catch (err) {
            console.log(err)
            if (err.errors) {
                next(sendError(400,err.errors[0].message))

            } else {
                next(sendError(400,err.message))

            }
        }
    }

    static async all (req,res, next) {
        ContentType.findAll({
        }).then(data=> {
                const result = data.map((item) => {
                        return {
                            id: item.id,
                            name: item.name,
                            slug: item.slug
                        }
                    }
                )
                res.send({data: result, status: "success"})
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async get (req,res, next) {
        ContentType.findByPk(req.params.id,{
        }).then(data=> {
                if (data) {
                    const result  = {id:data.id,name:data.name,slug:data.slug};
                    res.send({data: result, status: "success", message:"Content type found"})
                } else {
                    res.status(400).send({data: {}, status: "fail",message:"Content type not found"})
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
        ContentType.destroy({where:{
                id
            }}).then(data=> {
                if(data){
                    res.send({ status: "success", message:"Content type removed"})
                }else{
                    res.send({ status: "fail", message:"Content type not found"})
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

        try {
            await ContentType.update(
                {
                    name:req.body.name,
                    slug: slugify(req.body.name.replace("#", "").toLowerCase())
                }, {where: {id: id}}).then(async data=>{
                if(data){
                    if(data[0]) {
                        const updatedData = await ContentType.findByPk(id);
                        const result  = {id:updatedData.id,name:updatedData.name,slug:updatedData.slug};
                        res.send({status: "success", message: "Content type updated", data: result})
                    }else{
                        res.send({status: "fail", message: "Content type not found"})
                    }
                }else{
                    res.send({status: "fail", message: "Content type not found"})
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

module.exports = ContentTypeStore;