const router = require('express').Router();
const MessageController = require('../controllers/message.controller');
const { isAuthExpress } = require('../middlewares/auth.middleware');

router.get("/get-conversation-messages", isAuthExpress, MessageController.getConversationMessages)

module.exports = router;