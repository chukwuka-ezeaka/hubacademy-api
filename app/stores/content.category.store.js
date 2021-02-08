const slugify = require('slugify');
const ContentCategory = require('../models/models.index').ContentCategory;

class ContentCategoryStore {

    static async create(req, res, next) {
        const { name,description,image_url } = req.body;
        const payload = {
            name:name, slug: slugify(name.replace("#", "").toLowerCase()),
            description:description,
            image_url:image_url
        }
        try {
            await ContentCategory.create(payload).then((response)=>{
                const result  = {id:response.id,name:response.name,slug:response.slug};
                res.send({status: "success", data: result, message: "Created Category"});
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
        ContentCategory.findAll({
        }).then(data=> {
                const result = data.map((item) => {
                        return {
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            slug: item.slug,
                            image_url: item.image_url
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
        ContentCategory.findByPk(req.params.id,{
        }).then(data=> {
                if (data) {
                    const result  = {
                        id:data.id,
                        name:data.name,
                        description:data.description,
                        slug:data.slug,
                        image_url: data.image_url
                    };
                    res.send({data: result, status: "success", message:"Category found"})
                } else {
                    res.status(400).send({data: {}, status: "fail",message:"Category not found"})
                }
            }
        )
            .catch(err=>{
                next(sendError(400,err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
        ContentCategory.destroy({where:{
                id
            }}).then(data=> {
                if(data){
                    res.send({ status: "success", message:"Category removed"})
                }else{
                    res.send({ status: "fail", message:"Category not found"})
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
        const { name,description,image_url } = req.body;
        const payload = {
            name:name, slug: slugify(name.replace("#", "").toLowerCase()),
            description:description,
            image_url:image_url
        }
        try {
            await ContentCategory.update(
                payload, {where: {id: id}}).then(async data=>{
                if(data){
                    if(data[0]) {
                        const updatedData = await ContentCategory.findByPk(id);
                        const result  = {
                            id:updatedData.id,
                            name:updatedData.name,
                            slug:updatedData.slug,
                            image_url:updatedData.image_url
                        };
                        res.send({status: "success", message: "Category updated", data: result})
                    }else{
                        res.send({status: "fail", message: "Category not found"})
                    }
                }else{
                    res.send({status: "fail", message: "Category not found"})
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

module.exports = ContentCategoryStore;
