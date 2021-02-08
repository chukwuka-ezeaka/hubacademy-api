const Validator = require('../validators/validators.index');
const SettlementStore = require('../stores/settlement.store');

class SettlementController {
    static async banksList(req,res,next){
       await SettlementStore.GetPayStackBanks(req,res,next)
    }

    static async getAccount(req,res,next){
        await SettlementStore.GetAccount(req,res,next)
    }

    static async getPayoutHistory(req,res,next){
        await SettlementStore.GetPayoutHistory(req,res,next)
    }

    static async bankCreate(req,res,next){
        try {
            const {error} = await Validator.createAccount.validateAsync(req.body); //validate request
            if (error) {
                next(error.message)
            }else{
                await SettlementStore.CreateAccount(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }

    }

    static async payoutRequest(req,res,next){
        try {
            const {error} = await Validator.requestPayout.validateAsync(req.body); //validate request
            if (error) {
                next(error.message)
            }else{
                await SettlementStore.RequestPayout(req,res,next)
            }
        }
        catch (e) {
            next(new Error(e.message))
        }

    }
}

module.exports = SettlementController
