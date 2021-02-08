const ReflectionStore = require('../../app/stores/reflection.store');
const Validator = require('../validators/validators.index');

class ReflectionController {

    static async create(req, res,next) {
        try {
            const {error} = await Validator.createReflection.validateAsync(req.body); //validate request
            if (error) {
                next(error)
            }
            else{
                await ReflectionStore.create(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }
    }

    static async all(req, res,next) {
        try {
         await ReflectionStore.all(req,res,next);
        } catch(err) {
                next(new Error(err.message))
        }
    }

    static async allAdmin(req, res,next) {
        try {
         await ReflectionStore.allAdmin(req,res,next);
        } catch(err) {
                next(new Error(err.message))
        }
    }

    static async get(req, res,next) {
        try {
            return await ReflectionStore.get(req,res,next);
        } catch(err) {
            //console.log(err)
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    

    static async getToday(req, res,next) {
        try {
            return await ReflectionStore.getToday(req,res,next);
        } catch(err) {
            //console.log(err)
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async update(req, res,next) {
        try {
            return await ReflectionStore.update(req,res,next);
        } catch(err) {
           // console.log(err)
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }


    static async delete(req, res,next) {
        try {
            await ReflectionStore.delete(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }



}

module.exports = ReflectionController;