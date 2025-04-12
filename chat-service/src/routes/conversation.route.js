const router = require('express').Router();
const ConversationController = require('../controllers/conversation.controller');
const { isAuthExpress } = require('../middlewares/auth.middleware');

router.get('/', isAuthExpress, ConversationController.get);
router.post('/', isAuthExpress, ConversationController.create);
router.delete('/:id', isAuthExpress, ConversationController.delete);
router.put('/:id', isAuthExpress, ConversationController.update);

module.exports = router;