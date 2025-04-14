const router = require('express').Router();
const MessageController = require('../controllers/message.controller');
const { isAuthExpress } = require('../middlewares/auth.middleware');

router.get("/get-conversation-messages/:conversation_id", isAuthExpress, MessageController.getConversationMessages)
router.put("/delete-message", isAuthExpress, MessageController.deleteMessage)
router.put("/set-hidden-message", isAuthExpress, MessageController.setHiddenMessage)

module.exports = router;