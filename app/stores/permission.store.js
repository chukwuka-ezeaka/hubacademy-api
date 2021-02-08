const models = require('../models/models.index');

class PermissionStore {

    static async create(req, res, next) {

        const {name} = req.body;

        const permission = {
            name
        }
        try {

            return  models.Permission.create(permission)
                .then(permission => {
                    res.send({status:"success", data:permission, message:"Created Permission"});
                })
                .catch(err => {
                    if( err.errors){
                        next(new Error(err.errors[0].message))
                    }else{
                        next(new Error(err.message))
                    }
                })

        } catch (err) {
            console.log(err)
            next(new Error(err.message))
        }
    }

    static async all (req,res, next) {
        models.Permission.findAll({
            attributes: [ 'name', 'id'],
            order: [
                ['createdAt', 'DESC']
            ]
            // ,limit: 10
        }).then( async data => {
            res.send( {data: data, status: "success", message: "Permissions loaded"});
        })
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
                models.Permission.destroy({where:{
                        id
                    }}).then(data=> {
                        if(data){
                            res.send({ status: "success", message:"Permission removed"})
                        }else{
                            res.send({ status: "fail", message:"Permission not found"})
                        }
                    }
                )
                    .catch(err=>{
                        next(new Error(err.message))
                    })
    }

    static async update (req,res, next) {
        const { id } = req.params;
        const { name } = req.body;
        models.Permission.update({name:name},{where:{
                id:id
            }}).then(data=> {
                if(data){
                    if(data[0]) {
                        res.send({status: "success", message: "Permission updated"})
                    }else{
                        res.send({ status: "fail", message:"Permission not found"})
                    }
                }else{
                    res.send({ status: "fail", message:"Permission not found"})
                }
            }
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }


}

module.exports = PermissionStore;