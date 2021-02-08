const models = require('../models/models.index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const db = require('../../config/db');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const sendEmail = require('../services/email');
const getForgotTemplate =  require('../services/email_templates/forgot.password');
const getTemplate =  require('../services/email_templates/forgot.password.complete');
const Device = require('../models/models.user_device');
const User = require('../models/models.user');


class AccountStore {

    static async register(req,res, next) {
        const {firstname, lastname, email, role,password,phone,photo,country_id,birthday} = req.body;

        const user ={
            name: `${firstname} ${lastname}`,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password:password,
            phone:phone,
            photo:photo,
            country_id:country_id,
            birthday:birthday,
        }

            await models.User.findOne({
                where: {
                    email: user.email
                }
            })
                .then((user_data) => {

                    if (user_data) {
                         res.status(400).send({status:"fail",message: "Account already exists"})
                    }else{
                         models.Role.findOne({where:{id:role}}).then(data=> {

                                if (!data) {
                                    return res.send({status: "fail", message: "Invalid Role"})
                                } else {

                                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt,
                                        (err, hash) => {
                                            if (err) {
                                                throw err
                                            } else {
                                                user.password = hash;
                                                return db.transaction(t => {

                                                    // chain all your queries here. make sure you return them.
                                                    return models.User.create(user, {transaction: t}).then( async user_res => {
                                                        await models.UserRole.create({
                                                            userId: user_res.id,
                                                            roleId: role,
                                                            userRoleId: role,
                                                        }, {transaction: t});

                                                        await models.Wallet.create({
                                                        holder_id: user_res.id,
                                                        balance: 0,
                                                        name: 'default',
                                                        slug: 'default',
                                                    }, {transaction: t}).then(wallet=>{
                                                        //console.log('wallet')
                                                       // console.log(wallet)
                                                        return models.WalletTransaction.create({
                                                            payable_id: user_res.id,
                                                            wallet_id: wallet.id,
                                                            type: 'deposit',
                                                            amount: 0,
                                                            confirmed: 1,
                                                            uuid: uuidv4(),
                                                        }, {transaction: t});
                                                    })
                                                }

                                                    );

                                                }).then(result => {
                                                    try {
                                                        models.User.findOne({
                                                            where: {
                                                                email: req.body.email
                                                            },

                                                        })
                                                            .then(async (user,err) => {
                                                                // const user_role = await user.user_role.getRole().then(d=>d)
                                                                if (err) {
                                                                    next(new Error(err.message))
                                                                }
                                                                if (!user) {
                                                                    next(new Error("User is not registered"))
                                                                } else {
                                                                    await bcrypt.compare(req.body.password, user.password, async (err, isMatch) => {
                                                                        if (err) {
                                                                            next(new Error(err.message))
                                                                        }
                                                                        if (isMatch) {
                                                                            const payload  = {email:user.email,firstname:user.firstname}
                                                                            const expiry = 60*60;
                                                                            await jwt.sign(payload, process.env.SECRET,
                                                                                async (err, token) => {
                                                                                    if (err){
                                                                                        next(new Error(err.message))
                                                                                    }else{
                                                                                        const user_role_pivot = await user.getUserRole().then(d=>d)
                                                                                        const user_role_data = await user_role_pivot.getRole()

                                                                                        const role_permissions = await user_role_data.getPermissions()
                                                                                            .then(p=>p.map(p=> {
                                                                                                return {id:p.id,name:p.name };
                                                                                            }))

                                                                                        const user_role =  {id:user_role_data.id,name:user_role_data.name}
                                                                                        if(req.body.hasOwnProperty('fcmToken')){
                                                                                            let device = {
                                                                                                deviceId: token,
                                                                                                fcmToken: req.body.fcmToken?req.body.fcmToken:'',
                                                                                                userId: user.id,
                                                                                            }
                                                                                            await Device.update({ active: 0 }, {
                                                                                                where: {
                                                                                                    userId: user.id
                                                                                                }
                                                                                            });
                                                                                            await Device.create(device);
                                                                                            await User.update({ fcmTokenMobile: token }, {
                                                                                                where: {
                                                                                                    id: user.id
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                        let user_response = {
                                                                                            id:user.id,
                                                                                            fullname:user.name,
                                                                                            firstname:user.firstname,
                                                                                            lastname:user.lastname,
                                                                                            email:user.email,
                                                                                            phone:user.phone,
                                                                                            photo:user.photo,
                                                                                            birthday:user.birthday,
                                                                                            username:user.username,
                                                                                            role: user_role,
                                                                                            permissions: role_permissions,
                                                                                        }
                                                                                        // console.log(jwt.decode(token))
                                                                                        res.json({
                                                                                            status: 'success',
                                                                                            token: token,
                                                                                            expires_in: jwt.decode(token).exp,
                                                                                            data:user_response
                                                                                        });
                                                                                    }
                                                                                });
                                                                        } else {
                                                                            next(new Error("Password/Username Incorrect"))
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                            .catch((err) => {
                                                                    console.log(err)
                                                                    next(new Error(err.message))
                                                                }
                                                            )

                                                    }catch(e){
                                                        next(new Error(err.message))
                                                    }


                                                    // res.send({status: "success", message: "User Created"})
                                                }).catch(err => {
                                                    console.log(err)
                                                    next(new Error(err.message))
                                                });

                                            }
                                        }
                                    ))
                                }
                            }
                        )
                    }

                })
                .catch((err) => {
                    //console.log(err)
                     next(new Error(err.message))
                })
    }

    static async exists(req,res,next) {

        try {
            models.User.findOne({
                where: {
                    email: req.body.email
                },
                // include: [{model:models.UserRole,include: [{model:models.Role,attributes: ['name','id']}],
                //     attributes: ['roleId']},
                //     ],
                // attributes: ['name', 'firstname','lastname', 'email', 'createdAt','id','password'],
                // raw : true,
                // nest : true
            })
                .then(async (user,err) => {
                    // const user_role = await user.user_role.getRole().then(d=>d)
                    if (err) {
                        next(sendError(401,err.message))
                    }
                    if (!user) {
                        next(sendError(401,"User is not registered"))
                    } else {
                        if (user.active == 0) {
                            next(sendError(401,"Your account has been suspended. If you believe this is a mistake. Kindly reach out to support."))
                        }else {
                            await bcrypt.compare(req.body.password, user.password, async (err, isMatch) => {
                                if (err) {
                                    next(sendError(401, err.message))
                                }
                                if (isMatch) {
                                    const payload = {email: user.email, firstname: user.firstname}
                                    const expiry = 120 * 60;
                                    await jwt.sign(payload, process.env.SECRET,
                                        async (err, token) => {
                                            if (err) {
                                                next(sendError(401, err.message))
                                            } else {
                                                const user_role_pivot = await user.getUserRole().then(d => d)
                                                const user_role_data = await user_role_pivot.getRole()
                                                // console.log(user_role_pivot)
                                                // console.log(user_role_data)

                                                const role_permissions = await user_role_data.getPermissions()
                                                .then(p => p.map(p => {
                                                    return {id: p.id, name: p.name};
                                                }))
                                                const user_role = {id: user_role_data.id, name: user_role_data.name}
                                                if(req.body.hasOwnProperty('fcmToken')){
                                                    let device = {
                                                        deviceId: token,
                                                        fcmToken: req.body.fcmToken?req.body.fcmToken:'',
                                                        userId: user.id,
                                                    }
                                                    await Device.update({ active: 0 }, {
                                                        where: {
                                                            userId: user.id
                                                        }
                                                    });
                                                    await Device.create(device);
                                                    await User.update({ fcmTokenMobile: req.body.fcmToken?req.body.fcmToken:'' }, {
                                                        where: {
                                                            id: user.id
                                                        }
                                                    });
                                                }
                                                let user_response = {
                                                    id: user.id,
                                                    fullname: user.name,
                                                    firstname: user.firstname,
                                                    lastname: user.lastname,
                                                    email: user.email,
                                                    active: user.active,
                                                    verified: user.verified,
                                                    verifiedAt: user.verifiedAt,
                                                    role: user_role,
                                                    permissions: role_permissions,
                                                }
                                                // console.log(jwt.decode(token))
                                                res.json({
                                                    status: 'success',
                                                    token: token,
                                                    expires_in: jwt.decode(token).exp,
                                                    data: user_response
                                                });
                                            }
                                        });
                                } else {
                                    next(sendError(401, "Password/Username Incorrect"))
                                }
                            })
                        }
                    }
                })
                .catch((err) => {
                        // console.log(err)
                        next(new Error(err.message))
                    }
                )

    }catch(err){
            next(new Error(err.message))
    }

    }

    static async forgotPassword(req,res, next) {
        if (!req.body.email){
            res.status(400).send({status:"fail",message: "Email is required"})
        }
        await models.User.findOne({
            where: {
                email: req.body.email
            }
        })
            .then(async (user_data) => {

                if (!user_data) {
                    res.status(400).send({status:"fail",message: "Account not found"})
                }else{
                    const token = crypto.randomBytes(20).toString('hex');
                     user_data.resetPasswordToken = token;
                     user_data.resetPasswordExpires = Date.now() + 3600000;
                    await user_data.save().then(data=>{
                        //Send Email
                        var params = {
                            Destination: { /* required */
                                CcAddresses: [
                                    // 'victorighalo@gmail.com',
                                    /* more items */
                                ],
                                ToAddresses:
                                    [req.body.email]
                                /* more items */

                            },
                            Message: { /* required */
                                Body: { /* required */
                                    Html: {
                                        Charset: "UTF-8",
                                        Data: getForgotTemplate(token)
                                    },
                                    // Text: {
                                    //     Charset: "UTF-8",
                                    //     Data: "TEXT_FORMAT_BODY"
                                    // }
                                },
                                Subject: {
                                    Charset: 'UTF-8',
                                    Data: 'Password Reset AcademyHub'
                                }
                            },
                            Source: process.env.AWS_SENDER,
                            // ReplyToAddresses: [
                            //     req.body.email,
                            //     /* more items */
                            // ],
                        };

                        sendEmail(params)
                        return res.send({status: "success", message: "An Email has been sent with instructions to reset your password"})
                    })
                        .catch((err) => {
                            next(new Error(err.message))
                        })
                }

            })
            .catch((err) => {
                console.log(err)
                next(new Error(err.message))
            })
    }

    static async resetPassword(req,res, next) {

        if (!req.body.token){
            res.status(400).send({status:"fail",message: "Token is required"})
        }
        if (!req.body.password){
            res.status(400).send({status:"fail",message: "Password is required"})
        }
        if (!req.body.confirmPassword){
            res.status(400).send({status:"fail",message: "Confirm Password is required"})
        }
        if (req.body.confirmPassword !== req.body.password){
            res.status(400).send({status:"fail",message: "Passwords do not match"})
        }
        await models.User.findOne({where:{resetPasswordToken: req.body.token, resetPasswordExpires: {[Sequelize.Op.gt]: Date.now()}} })
            .then(async (user_data) => {

                if (!user_data) {
                    res.status(400).send({status:"fail",message: "Password reset token is invalid or has expired."})
                }else{
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(req.body.password, salt,
                        async (err, hash) => {
                            if (err) {
                                throw err
                            } else {
                                user_data.password = hash;
                                user_data.resetPasswordToken = null;
                                user_data.resetPasswordExpires = null;
                                await user_data.save().then(data => {
                                    //Send Email
                                    var params = {
                                        Destination: { /* required */
                                            CcAddresses: [
                                                // 'victorighalo@gmail.com',
                                                /* more items */
                                            ],
                                            ToAddresses:
                                                [user_data.email]
                                            /* more items */

                                        },
                                        Message: { /* required */
                                            Body: { /* required */
                                                Html: {
                                                    Charset: "UTF-8",
                                                    Data: getTemplate(user_data.firstname)
                                                },
                                                // Text: {
                                                //     Charset: "UTF-8",
                                                //     Data: "TEXT_FORMAT_BODY"
                                                // }
                                            },
                                            Subject: {
                                                Charset: 'UTF-8',
                                                Data: 'Password Reset AcademyHub'
                                            }
                                        },
                                        Source: process.env.AWS_SENDER,
                                        // ReplyToAddresses: [
                                        //     req.body.email,
                                        //     /* more items */
                                        // ],
                                    };

                                    sendEmail(params)
                                    return res.send({status: "success", message: "Password Reset Successful"})
                                })
                                    .catch((err) => {
                                        next(new Error(err.message))
                                    })
                            }
                        })
                    )
                }

            })
            .catch((err) => {
                console.log(err)
                next(new Error(err.message))
            })
    }

}

module.exports = AccountStore;
