const Validator = require('../validators/validators.index');
const TransactionStore = require('../../app/stores/transaction.store');


class TransactionController {

    static async start(req, res, next) {
        try {
            await Validator.startTransaction.validateAsync(req.body)
            try {
                await TransactionStore.start(req, res, next);

            } catch (e) {
                next(sendError(400, e.message))
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }


        static async close(req, res, next) {
            try {
                await Validator.closeTransaction.validateAsync(req.body)
                try {
                    await TransactionStore.close(req,res,next);

                } catch(e) {
                    next(sendError(400,e.message))
                }
            } catch(e) {
                next(sendError(400,e.message))
            }
        }

    static async history(req, res, next) {
        try {
                await TransactionStore.history(req,res,next);

            } catch(e) {
                next(sendError(400,e.message))
            }
    }

}

module.exports = TransactionController;
