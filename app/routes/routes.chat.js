const express = require('express');
const router = express.Router();
const acl = require('../../acl/acl.index');
const ChatCtrl = require('../controllers/chat.controller');


router.post('/',acl.isAuthenticated, ChatCtrl.createMsg)
router.get('/conversations', acl.isAuthenticated, ChatCtrl.allConversations)
router.get('/newchat_messages/:id', acl.isAuthenticated, ChatCtrl.newchat_messages)
router.get('/get_chat_status/:id', acl.isAuthenticated, ChatCtrl.get_chat_status)
router.get('/get_chat_seen/:id', acl.isAuthenticated, ChatCtrl.get_chat_seen)
router.get('/message_by_id/:id', acl.isAuthenticated, ChatCtrl.getMessageById)
router.post('/seeChat', acl.isAuthenticated, ChatCtrl.seeChat)
router.post('/call_user', acl.isAuthenticated, ChatCtrl.call_user)
router.post('/video_call_user', acl.isAuthenticated, ChatCtrl.video_call_user)
router.get('/:id', acl.isAuthenticated, ChatCtrl.getMessageById)
router.delete('/message/:id',acl.isAuthenticated, ChatCtrl.delete)

module.exports = function(app) {
    app.use('/api/v1/chat', router);
}
