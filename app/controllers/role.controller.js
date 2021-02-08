const Validator = require('../validators/validators.index');
const RoleStore = require('../../app/stores/role.store');

class RoleController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createRole.validateAsync(req.body); //validate request
            if (error) {
                next(error.message)
            }else{
                await RoleStore.create(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.updateRole.validateAsync(req.body); //validate request
            if (error) {
                next(error.message)
            }else{
                await RoleStore.update(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await RoleStore.all(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async get(req, res,next) {
        try {
            await RoleStore.get(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await RoleStore.delete(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }
}

module.exports = RoleController;