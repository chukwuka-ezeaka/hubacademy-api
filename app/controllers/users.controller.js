const UserStore = require('../../app/stores/users.store');
const Validator = require('../validators/validators.index');

class UsersController {
    static async All(req, res,next) {
        try {
            let payload = await UserStore.All(req,res,next);
            res.send(payload);
        } catch(err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async Authors(req, res,next) {
        try {
            let payload = await UserStore.authors(req,res,next);
            res.send(payload);
        } catch(err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async AuthorsByCategory(req, res,next) {
        try {
            let payload = await UserStore.authorsByCategory(req,res,next);
            res.send(payload);
        } catch(err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async AllWithRoles(req, res,next) {
        try {
            return await UserStore.AllWithRoles(req,res,next);
        } catch(err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async assignRole(req, res,next) {
        try {
            const {error} = await Validator.assignRole.validateAsync(req.body);
            if (error) {
                //console.log(error)
                next(error)
            }else{
                return await UserStore.assignRole(req,res,next);
            }
        } catch(err) {
            //console.log(err)
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async get(req, res,next) {
        try {
                return await UserStore.get(req,res,next);
        } catch(err) {
            //console.log(err)
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async usersByRole(req, res,next) {
        try {
            return await UserStore.usersByRole(req,res,next);
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
            return await UserStore.update(req,res,next);
        } catch(err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async suspend(req, res,next) {
        try {
            return await UserStore.suspend(req,res,next);
        } catch(err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async delete(req, res,next) {
        try {
            await UserStore.delete(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }
}

module.exports = UsersController;
