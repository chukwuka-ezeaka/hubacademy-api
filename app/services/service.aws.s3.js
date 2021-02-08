const UserStore = require("../stores/user.store");
const MediaLinkStore = require("../stores/medialink.store");

const UUID = require('uuid/v4');
const AWS = require('aws-sdk/clients/s3');
const s3 = new AWS({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const multer  = require('multer');
const multerS3 = require('multer-s3');

const limits = {
    image: {fileSize: 1000 * 50000},
    audio: {fileSize: 1000 * 50000},
    video: {fileSize: 1000 * 50000},
    pdf: {fileSize: 1000 * 50000},
}

const imageFileFilter =  (req, file, cb) =>{
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
        const msg =  'Invalid file format. Only .png, .jpg and .jpeg formats are allowed!'
        return cb( sendError(400,msg));
    }
}

const audioFileFilter =  (req, file, cb) =>{

    if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
        cb(null, true);
    } else {
        cb(null, false);
        const msg =  'Invalid file format. Only .mp3 format is allowed!'
        return cb( sendError(400,msg));
    }
}

const videoFileFilter =  (req, file, cb) =>{

    if (file.mimetype === "video/mp4" || file.mimetype === "application/mp4") {
        cb(null, true);
    } else {
        cb(null, false);
        const msg =  'Invalid file format. Only .mp4 format is allowed!'
        return cb( sendError(400,msg));
    }
}

const pdfFileFilter =  (req, file, cb) =>{

    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(null, false);
        const msg =  'Invalid file format. Only .pdf format is allowed!'
        return cb( sendError(400,msg));
    }
}


const uploadImageSingle = (req,res,next,type, type_id = null)=>{

    const userId = UUID();
    let file_key = "";

    const imageStorage = multerS3({
        s3: s3,
        bucket: `${process.env.AWS_S3_BUCKET}images`,
        ACL:'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { name: file.fieldname });
        },
        key: function (req, file, cb) {
            file_key = userId+ '-' +file.originalname.replace(/ /g,"_");
            cb(null,file_key )
        }
    })
    multer({storage:imageStorage, fileFilter:imageFileFilter, limits:limits.image})
        .single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if('code' in err){
                //Handle File size error
                if (err.code === 'LIMIT_FILE_SIZE'){
                    const msg = `File size to large. It is above the size limit of ${limits.image.fileSize/1000}KB`
                    return next(sendError(400,msg))
                }
            }

        } else if (err) {
            return next(sendError(400,err.message))
        }else if ('file' in req){
            if (type === 'profile_photo'){

                UserStore.updateProfilePhoto(req,res,next,file_key)
            }
            else if (type === 'image_upload'){
                MediaLinkStore.create(req,res,next,file_key,type_id)
            }
        }else{
             next(sendError(400,'No file sent'))
        }


    })
}

const uploadAudioSingle = (req,res,next,type, type_id = null)=>{
    const userId = UUID();
    let file_key  = "";

    const audioStorage = multerS3({
        s3: s3,
        bucket: `${process.env.AWS_S3_BUCKET}audio`,
        ACL:'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { name: file.fieldname });
        },
        key: function (req, file, cb) {
            file_key = userId+ '-' +file.originalname.replace(/ /g,"_");

            cb(null, file_key)
        }
    })

    multer({storage:audioStorage, fileFilter:audioFileFilter, limits:limits.audio})
        .single('audio')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                if('code' in err){
                    //Handle File size error
                    if (err.code === 'LIMIT_FILE_SIZE'){
                        const msg = `File size to large. It is above the size limit of ${limits.audio.fileSize/1000}KB`
                        return next(sendError(400,msg))
                    }
                }

            } else if (err) {
                return next(sendError(400,err.message))
            }else if ('file' in req){
                    MediaLinkStore.create(req,res,next,file_key,type_id)
            }else{
                next(sendError(400,'No file sent'))
            }

        })
}

const uploadVideoSingle = (req,res,next,type, type_id = null)=>{
    const userId = UUID();
    let file_key  = "";

    const videoStorage = multerS3({
        s3: s3,
        bucket: `${process.env.AWS_S3_BUCKET}video`,
        ACL:'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { name: file.fieldname });
        },
        key: function (req, file, cb) {
            file_key = userId+ '-' +file.originalname.replace(/ /g,"_");

            cb(null, file_key)
        }
    })

    multer({storage:videoStorage, fileFilter:videoFileFilter, limits:limits.video})
        .single('video')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                if('code' in err){
                    //Handle File size error
                    if (err.code === 'LIMIT_FILE_SIZE'){
                        const msg = `File size to large. It is above the size limit of ${limits.video.fileSize/1000}KB`
                        return next(sendError(400,msg))
                    }
                }

            } else if (err) {
                return next(sendError(400,err.message))
            }else if ('file' in req){
                MediaLinkStore.create(req,res,next,file_key,type_id)
            }else{
                next(sendError(400,'No file sent'))
            }

        })
}

const uploadPdfSingle = (req,res,next,type, type_id = null)=>{
    const userId = UUID();
    let file_key  = "";
    console.log('uploading... pdf')

    const pdfStorage = multerS3({
        s3: s3,
        bucket: `${process.env.AWS_S3_BUCKET}document`,
        ACL:'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { name: file.fieldname });
        },
        key: function (req, file, cb) {
            file_key = userId+ '-' +file.originalname.replace(/ /g,"_");

            cb(null, file_key)
        }
    })

    multer({storage:pdfStorage, fileFilter:pdfFileFilter, limits:limits.pdf})
        .single('pdf')(req, res, function (err) {
            console.log(err)
            console.log('upload complete')
            if (err instanceof multer.MulterError) {
                if('code' in err){
                    //Handle File size error
                    if (err.code === 'LIMIT_FILE_SIZE'){
                        const msg = `File size to large. It is above the size limit of ${limits.pdf.fileSize/1000}KB`
                        return next(sendError(400,msg))
                    }
                }

            } else if (err) {
                return next(sendError(400,err.message))
            }else if ('file' in req){
                MediaLinkStore.create(req,res,next,file_key,type_id)
            }else{
                next(sendError(400,'No file sent'))
            }

        })
}

const uploadImageMultiple = (req,res,next,type)=>{
    // multer({storage:imageStorage, fileFilter:fileFilter, limits:limits})
    //     .array('images', 3)
    //     (req, res, function (err) {
    //         if (err instanceof multer.MulterError) {
    //             if('code' in err){
    //                 //Handle File size error
    //                 if (err.code === 'LIMIT_FILE_SIZE'){
    //                     const msg = `File size to large. It is above the size limit of ${config.fileSizeLimit/1000}KB`
    //                     return next(sendError(400,msg))
    //                 }
    //             }
    //
    //         } else if (err) {
    //             return next(sendError(400,err.message))
    //         }else if ('files' in req){
    //             if (type === 'profile_photo'){
    //                 // UserStore.updateProfilePhoto(req,res,next,req.file.key)
    //             }
    //         }else{
    //             next(sendError(400,'No file sent'))
    //         }
    //         res.send({data: [], message:'Object uploaded'})
    //
    //     })
}

const getImage = (req,res,next)=>{
    var params = {
        Bucket:`${process.env.AWS_S3_BUCKET}images`,
        Key: req.params.key
    };
    s3.getObject(params, function(err, data) {
        if (err) next(sendError(400,err.message));
        else {
            const {ContentType} =data;
            let base64data = data.Body.toString('base64');
            res.send({data:{image:base64data, type:ContentType}, message:'Object found'})

        }
    });
}

const getAudio = (req,res,next)=>{
    var params = {
        Bucket:`${process.env.AWS_S3_BUCKET}audio`,
        Key: req.params.key
    };


    const s3Stream = s3.getObject(params).createReadStream();
    // Listen for errors returned by the service
    s3Stream.on('error', function(err) {
        // NoSuchKey: The specified key does not exist
        console.error(err);
    });

    res.setHeader('Content-Type', 'audio/mpeg')
    s3Stream
        .on('error', function(err) {
            // capture any errors that occur when writing data to the file
            console.error('File Stream:', err);
        }).on('end', function() {
        // console.log('Done.');
    })
        .on('finish', function() {
            // console.log('Done.');
        }).
    on('data', function (data) {
        // console.log("Got data");
    })
    s3Stream.pipe(res)

}

module.exports = {
    uploadImageSingle,
    uploadImageMultiple,
    uploadAudioSingle,
    uploadVideoSingle,
    uploadPdfSingle,
    getImage,
    getAudio
}
