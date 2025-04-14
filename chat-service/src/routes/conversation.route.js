const router = require("express").Router();
const ConversationController = require("../controllers/conversation.controller");
const { isAuthExpress } = require("../middlewares/auth.middleware");

router.get('/get-conversations/:user_id', isAuthExpress, ConversationController.getConversationsByUserId);
// router.get('/', isAuthExpress, ConversationController.get);
router.post("/", ConversationController.create);
// router.delete('/:id', isAuthExpress, ConversationController.delete);
// router.put('/:id', isAuthExpress, ConversationController.update);

module.exports = router;
