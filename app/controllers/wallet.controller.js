const Validator = require('../validators/validators.index');
const WalletStore = require('../stores/wallet.store');

class WalletController {

    static async balance(req, res,next) {
        try {
            await WalletStore.balance(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async history(req, res,next) {
        try {
            await WalletStore.history(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async credit(req, res,next) {
        try {
            const {error} = await Validator.creditWallet.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400,error.message))
            }
            await WalletStore.credit(req,res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

}

module.exports = WalletController;
