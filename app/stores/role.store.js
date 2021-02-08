const models = require('../models/models.index');
const db = require('../../config/db');

class RoleStore {

    static async create(req, res, next) {

        const {name, permissions} = req.body;

        const role_payload = {
            name,
            permissions
        }
        let transaction;
        try {
            models.Permission.findAll({where:{id:permissions}}).then(async perm_check=>{

                if (perm_check){
                    if (perm_check.length == permissions.length) {
                        transaction = await db.transaction();

                        const role = await models.Role.create(role_payload, {transaction, returning:true});

                        let role_permission = [];

                        await permissions.map( async item => {
                            role_permission.push({roleId: role.id, permissionId: item})
                        });


                        await models.RolePermission.bulkCreate(role_permission, {transaction:transaction, ignoreDuplicates:true});

                        const response = {role: role}

                        res.send({status: "success", data: response, message: "Created Role"});
                        await transaction.commit();

                    }else{
                        res.status(400).send({status:"fail", message:"Permissions unavailable"});
                    }
                }else{
                    res.status(400).send({status:"fail", message:"Permissions unavailable"});
                }
            })
                .catch(error => {
                    transaction.rollback();
                    next(new Error(error.message))
                })

        } catch (err) {
            console.log(err.message)
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))
            }
            if (transaction) await transaction.rollback();
        }
    }

    static async all (req,res, next) {

        models.Role.findAll({
            include: [{model:models.Permission, attributes: [  'id', 'name']}],
            attributes: [  'id', 'name'],
            order: [
                ['createdAt', 'DESC']
            ]
            // ,limit: 10
        }).then(  data => {

           return data.map(  role=>{

                    let permission =  role.Permissions.map(
                        p2=>{ return {id:p2.id,name:p2.name } }
                    )

                return {id:role.id,name:role.name,permissions: permission}

            })


        }).then(data=>
            res.send( {data: data, status: "success"})
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async get (req,res, next) {

        models.Role.findByPk(req.params.id,{
            include: [{model:models.Permission, attributes: [  'id', 'name']}],
            attributes: [  'id', 'name'],
            // ,limit: 10
        }).then(  data => {
            if(data) {


                    let permission = data.Permissions.map(
                        p2 => {
                            return {id: p2.id, name: p2.name}
                        }
                    )

                return {id: data.id, name: data.name, permissions: permission}

            }
            return null;


        }).then(data=> {
                if (data) {
                    res.send({data: data, status: "success", message:"Role found"})
                } else {
                    res.status(400).send({data: {}, status: "fail",message:"Role not found"})
                }
            }
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async delete (req,res, next) {
        const { id } = req.params;
        await models.UserRole.findOne({where:{roleId:id}}).then(data=>{
            if(data){
                res.send({ status: "fail", message:"Cannot delete Role assigned to a User"})
            }else{
                models.Role.destroy({where:{
                        id
                    }}).then(data=> {
                        if(data){
                            res.send({ status: "success", message:"Role removed"})
                        }else{
                            res.send({ status: "fail", message:"Role not found"})
                        }
                    }
                )
                    .catch(err=>{
                        next(new Error(err.message))
                    })
            }
        })
            .catch(err=>{
                next(new Error(err.message))
            })

    }

    static async update (req,res, next) {
        const { id } = req.params;
        const { name } = req.body;
        const { permissions } = req.body;
        let transaction;
        try {
            transaction = await db.transaction();
            await models.Role.update({name:name}, {where: {id: id}, transaction})

            if(permissions) {

                let role_permission = [];

                await permissions.map(item => {
                    role_permission.push({roleId: id, permissionId: item})
                });
                await models.RolePermission.destroy( {where: {permissionId: permissions}, transaction})
                await models.RolePermission.bulkCreate(role_permission, {transaction});
            }


            const updatedData = await models.Role.findOne({where: {id: id}});
            res.send({status: "success", message: "Role updated", data: updatedData})
            await transaction.commit();
        }catch (err) {
            next(new Error(err.message))
        }
    }
}

module.exports = RoleStore;