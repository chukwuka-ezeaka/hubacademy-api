const MediaLinkStore = require('../../app/stores/medialink.store');
const mediaManagerS3 = require('../services/service.aws.s3');

class MediaManagerController {

    static async uploadSingle(req, res,next) {

        try {

            if (!'type' in req.params){
               next(sendError(400,'No media type specified'))
            }else if(req.params.type === 'image'){
                await mediaManagerS3.uploadImageSingle(req, res,next, 'image_upload', 3)
            }
            else if(req.params.type === 'audio'){
                await mediaManagerS3.uploadAudioSingle(req, res,next, 'audio_upload', 5)
            }
            else if(req.params.type === 'video'){
                await mediaManagerS3.uploadVideoSingle(req, res,next, 'video_upload', 1)
            }else if(req.params.type === 'pdf'){
                await mediaManagerS3.uploadPdfSingle(req, res,next, 'pdf_upload', 4)
            }

        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
    static async updateMedia(req, res,next) {
        try {
            if (! 'type' in req.params){
               next(sendError(400,'No media type specified'));
            }else {
                await MediaLinkStore.update(req, res,next);
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async uploadImageMultiple(req, res,next) {
        try {
            // await Validator.imageUpload.validateAsync(req.body)
            await mediaManagerS3.uploadImageMultiple(req, res,next)
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async getObjectSingle(req, res,next) {
        try {

            if(req.params.type === 'image'){
                await mediaManagerS3.getImage(req, res,next)
            }else if(req.params.type === 'audio'){
                await mediaManagerS3.getAudio(req, res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async getMedia(req, res,next) {
        try {
            if (req.params.hasOwnProperty('type')){
                next(sendError(400,'No media type specified'))
            }else if(req.params.type === 'image'){
                await MediaLinkStore.get(req, res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async getAllMediaByOwner(req, res,next) {
        try {
            if (! 'type' in req.params){
                next(sendError(400,'No media type specified'))
            }else if(req.params.type === 'image'){
               await MediaLinkStore.all(req, res,next)
            }
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

}

module.exports = MediaManagerController;