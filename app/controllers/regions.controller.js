
const RegionsStore = require('../../app/stores/regioins.store');

class RegionsController {

    static async all(req, res,next) {
        try {
            await RegionsStore.all(req,res,next)
        }
        catch (e) {
            next(new Error(e.message))
        }
    }
}


module.exports = RegionsController;