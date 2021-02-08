const Validator = require('../validators/validators.index');
const Conversation = require('../models/models.conversation');
const Message = require('../models/models.message');
const User = require('../models/models.user');
const notify = require('../services/firebase');
const { Op } = require("sequelize");
const Sequelize = require('sequelize');


class chatController {

    static async createMsg(req, res,next) {
        try {
            req.body.from_id = req.user.id
            const {from_id,to_id} = req.body
            const [conversation1] = await Conversation.findOrCreate({
                where: { from_id,to_id },
                defaults: {
                  from_id,
                  to_id
                }
            });
            const [conversation2]  = await Conversation.findOrCreate({
                where: { from_id: to_id, to_id:from_id },
                defaults: {
                  from_id:to_id,
                  to_id:from_id
                }
            });
            const message = await Message.create(req.body);
            await conversation1.update({last_msg_id:message.id})
            await conversation2.update({last_msg_id:message.id})
            const user = await User.findByPk(to_id);
            if (user !== null) {
                if (user.fcmTokenMobile !== null) {
                    await notify.send_notification(message.id,user.fcmTokenMobile,'message')
                }
            }
            res.send({message})
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

   
    static async allConversations(req, res,next) {
        try {
            const from_id = req.user.id
            const conversations = await Conversation.findAll({
                where: {from_id},
                include:[
                    {
                        model: User,
                        as: 'to',
                        where: {
                          id: Sequelize.col('to_id')
                        },
                        attributes: ['name','photo',]
                    },
                    {
                        model: Message,
                        as: 'last_msg',
                        where: {
                          id: Sequelize.col('last_msg_id')
                        },
                        attributes: ['content',]
                    }
                ],
                order: [
                    ['updatedAt', 'DESC']
                ]
            });
            res.send({conversations})
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }
    
    static async getMessageById(req, res,next) {
        try {
            const message = await Message.findOne({
                where: { id: req.params.id  },
                include:[
                    {
                        model: User,
                        as: 'from',
                        where: {
                          id: Sequelize.col('from_id')
                        },
                        attributes: ['name']
                    },
                ],
            });
            const data ={
                seen:'2'
            }
            await Message.update( data,{
                where: {
                    id:req.params.id
                },
            })
            if(!message){
                next(sendError(400,'Invalied message Id'))
            }
            res.send({message})
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    static async getUserMessages(req, res,next) {
        try {
            const seen = await Message.find({
                where: {
                    [Op.or]: [{ 
                        from_id: req.user.id,
                        to_id: req.params.id
                    }, 
                    { 
                        from_id: req.params.id,
                        to_id: req.user.id
                    }],
                    id:{[Op.gt]: req.query.lastseen, },
                    seen:{[Op.lt]: req.query.seen, }
                }
            });
            if(!seen){
                seen = []
            }else{
                seen.forEach( async element => {
                    if(element.to_id == req.user.id){
                        await element.update({seen:3})
                    }
                });
            }
            const message = await Message.find({
                where: {
                    [Op.or]: [{ 
                        from_id: req.user.id,
                        to_id: req.params.id
                    }, 
                    { 
                        from_id: req.params.id,
                        to_id: req.user.id
                    }],
                    id:{[Op.gt]: req.query.lastseen, }
                }
            });
            if(!message){
                res.send({messages:[],seen})
            }
            res.send({message,seen})
        }
        catch (e) {
            next(sendError(400,e.message))
        }
    }

    

    static async newchat_messages(req, res,next) {
        try{
            const userid = req.user.id
            const messages = await Message.findAll({
                where: {
                    [Op.or]: [{ 
                        from_id: userid,
                    }, 
                    { 
                        to_id: userid
                    }],
                    id:{[Op.gt]: req.params.id, },
                },
                include:[
                    {
                        model: User,
                        as: 'from',
                        where: {
                          id: Sequelize.col('from_id')
                        },
                        attributes: ['name']
                    },
                ],
                order: [
                    ['createdAt', 'ASC']
                ]
            })
            const data ={
                seen:'2'
            }
            await Message.update( data,{
                where: {
                    to_id: userid,
                    seen:{[Op.lt]: '2', },
                    id:{[Op.gt]: req.params.id, },
                },
            })
            res.send({messages})
        }catch(e){
            next(sendError(400,e.message))
        }
    }
    
    static async get_chat_status(req, res,next) {
        try{
            const userid = req.user.id
            const messages = await Message.findAll({
                where: {
                    from_id: userid,
                    id:{[Op.gt]: req.params.id, },
                    seen:2
                },
                order: [
                    ['createdAt', 'ASC']
                ]
            })
            res.send({messages})
        }catch(e){
            next(sendError(400,e.message))
        }
    }

    static async get_chat_seen(req, res,next) {
        try{
            const userid = req.user.id
            const messages = await Message.findAll({
                where: {
                    from_id: userid,
                    id:{[Op.gt]: req.params.id, },
                    seen:3
                },
                order: [
                    ['createdAt', 'ASC']
                ]
            })
            res.send({messages})
        }catch(e){
            next(sendError(400,e.message))
        }
    }

    static async seeChat(req, res,next) {
        try{
            const to_id = req.user.id
            const from_id = req.body.from_id
            const data ={
                seen:'3'
            }
            await Message.update( data,{
                where: {
                    to_id,
                    from_id,
                    seen:{[Op.lt]: 3, },
                },
            })
            res.send({messages:'chat seen'})
        }catch(e){
            next(sendError(400,e.message))
        }
    }

    static async call_user(req, res,next) {
        try {      
            const user = await User.findByPk(req.body.receiver);
            await notify.call_notification({
              user: req.user,
              fcmTokenMobile: user.fcmTokenMobile,
            })
            res.send({message:'calling...'})
        } catch (error) {
            next(sendError(400,e.message))
        }
    }

    static async call_user(req, res,next) {
        try {      
            const user = await User.findByPk(req.body.receiver);
            if (user !== null) {
                if (user.fcmTokenMobile !== null) {
                    await notify.call_notification({
                        user: req.user,
                        fcmTokenMobile: user.fcmTokenMobile
                    })
                }
            }
            res.send({message:'calling...'})
        } catch (error) {
            next(sendError(400,e.message))
        }
    }

    static async video_call_user(req, res,next) {
        try {      
            const user = await User.findByPk(req.body.receiver);
            if (user !== null) {
                if (user.fcmTokenMobile !== null) {
                    await notify.video_call_notification({
                        user: req.user,
                        fcmTokenMobile: user.fcmTokenMobile
                    })
                }
            }
            res.send({message:'calling...'})
        } catch (error) {
            next(sendError(400,e.message))
        }
    }

    static async delete(req, res,next) {
        try {      
            const { id } = req.params;
            Message.destroy({where:{
                    id
                }}).then(data=> {
                    if(data){
                        res.send({ status: "success", message:"Message deleted"})
                    }else{
                        res.send({ status: "fail", message:"Message not found"})
                    }
                }
            )
            .catch(err=>{
                if (err.errors) {
                    next(sendError(400,err.errors[0].message))

                } else {
                    next(sendError(400,err.message))

                }
            })
        } catch (error) {
            next(sendError(400,e.message))
        }
    }

    

    
  
}


  

module.exports = chatController;