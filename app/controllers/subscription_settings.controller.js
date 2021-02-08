const Validator = require('../validators/validators.index');
const SubscriptionSettingStore = require('../stores/subscription_setting.store');


class SubscriptionSettingsController {

    static async update(req, res, next) {
        try {
            const {error} = await Validator.updateSubscriptionSettings.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400, error.message))
            } else {
                await SubscriptionSettingStore.upsert(req, res, next)
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async get(req, res, next) {
        try {
                await SubscriptionSettingStore.get(req, res, next)
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

}

module.exports = SubscriptionSettingsController;
