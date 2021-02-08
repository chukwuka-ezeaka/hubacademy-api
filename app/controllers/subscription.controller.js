const Validator = require('../validators/validators.index');
const SubscriptionStore = require('../stores/subscription.store');


class SubscriptionController {

    // static async subscribe(req, res, next) {
    //     try {
    //         const {error} = await Validator.subscribe.validateAsync(req.body); //validate request
    //         if (error) {
    //             next(sendError(400, error.message))
    //         } else {
    //             await SubscriptionStore.Subscribe(req, res, next)
    //         }
    //     } catch (e) {
    //         next(sendError(400, e.message))
    //     }
    // }

    static async subscribeToAuthor(req, res, next) {
        try {
            const {error} = await Validator.subscribeToAuthor.validate(req.body); //validate request
            if (error) {
                next(sendError(400, error.message))
            } else {
                await SubscriptionStore.SubscribeToAuthor(req, res, next)
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async subscribeToCategory(req, res, next) {
        try {
            const {error} = await Validator.subscribeToCategory.validate(req.body); //validate request
            if (error) {
                next(sendError(400, error.message))
            } else {
                await SubscriptionStore.SubscribeToCategory(req, res, next)
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async subscribeToContent(req, res, next) {
        try {
            const {error} = await Validator.subscribeToContent.validate(req.body); //validate request
            if (error) {
                next(sendError(400, error.message))
            } else {
                await SubscriptionStore.PurchaseContent(req, res, next)
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async purchaseContentDirect(req, res, next) {
        try {
            const {error} = await Validator.purchaseContentDirect.validate(req.body); //validate request
            if (error) {
                next(sendError(400, error.message))
            } else {
                await SubscriptionStore.PurchaseContentDirect(req, res, next)
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async subscriptions(req, res, next) {
        try {
            await SubscriptionStore.Subscriptions(req, res, next)
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async store(req, res, next) {
        try {
            await SubscriptionStore.StorePurchases(req, res, next)
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

}

module.exports = SubscriptionController;
