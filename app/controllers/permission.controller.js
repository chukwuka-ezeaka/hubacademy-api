const Validator = require('../validators/validators.index');
const PermissionStore = require('../../app/stores/permission.store');

class PermissionController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createPermission.validateAsync(req.body); //validate request
            if (error) {
                next(error)
            }
            else{
                await PermissionStore.create(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async update(req, res,next) {
        try {
            const {error} = await Validator.updatePermission.validateAsync(req.body); //validate request
            if (error) {
                next(error)
            }
            else{
                await PermissionStore.update(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async all(req, res,next) {
        try {
            await PermissionStore.all(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async delete(req, res,next) {
        try {
            await PermissionStore.delete(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }
}

module.exports = PermissionController;