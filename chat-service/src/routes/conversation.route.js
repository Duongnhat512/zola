const router = require("express").Router();
const ConversationController = require("../controllers/conversation.controller");
const { isAuthExpress } = require("../middlewares/auth.middleware");

router.get(
  "/get-conversations",
  isAuthExpress,
  ConversationController.getConversationsByUserId
);
// router.get('/', isAuthExpress, ConversationController.get);
router.post("/create", ConversationController.create);
// router.delete('/:id', isAuthExpress, ConversationController.delete);
// router.put('/:id', isAuthExpress, ConversationController.update);

module.exports = router;
