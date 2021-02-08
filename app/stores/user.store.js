const models = require('../models/models.index');


class UserStore {
    static async updateProfilePhoto(req,res,next,photo) {
        try {
            const id = req.params.id ? req.params.id : req.user.id
            models.User.findByPk(id)
                .then(async (user,err) => {
                    if (err) {
                        next(sendError(400,err.message))
                    }
                    if (!user) {
                        next(sendError(400,"User is not registered"))
                    } else {
                        user.update({
                            photo
                        }).then((data) => {
                            // var params = {
                            //     Bucket:`${process.env.AWS_S3_BUCKET}images`,
                            //     Key: photo
                            // };
                            // s3.getObject(params, function(err, data) {
                            //     if (err) next(sendError(400,err.message));
                            //     else {
                            //         let base64data = data.Body.toString('base64');
                            //         res.send({data: data.Body, image:base64data})
                            //
                            //     }
                            // });
                            const result  = {
                                fullname:data.name,
                                firstname:data.firstname,
                                lastname:data.lastname,
                                phone:data.phone,
                                photo:data.photo,
                            }
                            res.json({
                                status: 'success',
                                message: 'Profile updated',
                                data:result
                            });
                        })
                            .catch((err) => {
                                    next(new Error(err.message))
                                }
                            )
                    }
                })
                .catch((err) => {
                        next(new Error(err.message))
                    }
                )

        }catch(e){
            next(new Error(e.message))
        }

    }

    
}

module.exports = UserStore;
