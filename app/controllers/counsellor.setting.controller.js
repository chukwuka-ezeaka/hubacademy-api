const Validator = require('../validators/validators.index');
const CounsellorSettingStore = require('../stores/counsellor.setting.store');


class CounsellorSettingsController {

    static async update(req, res, next) {
        try {
            const {error} = await Validator.updateCounsellorSettings.validateAsync(req.body); //validate request
            if (error) {
                next(sendError(400, error.message))
            } else {
                await CounsellorSettingStore.upsert(req, res, next)
            }
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

    static async get(req, res, next) {
        try {
                await CounsellorSettingStore.get(req, res, next)
        } catch (e) {
            next(sendError(400, e.message))
        }
    }

}

module.exports = CounsellorSettingsController;
