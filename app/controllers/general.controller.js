class GeneralController {
    static async home(req, res) {
            res.send({status:200, message:"Welcome to LifeStyle Hub"});
    }
}

module.exports = GeneralController;