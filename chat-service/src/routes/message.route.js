const router = require('express').Router();
const MessageController = require('../controllers/message.controller');
const { isAuthExpress } = require('../middlewares/auth.middleware');

router.get("/get-conversation-messages/:conversation_id", isAuthExpress, MessageController.getConversationMessages)
router.post("/delete-message", isAuthExpress, MessageController.deleteMessage)

module.exports = router;