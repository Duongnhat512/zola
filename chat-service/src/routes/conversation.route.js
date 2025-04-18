const router = require("express").Router();
const ConversationController = require("../controllers/conversation.controller");
const { isAuthExpress } = require("../middlewares/auth.middleware");

router.get(
  "/get-conversations",
  isAuthExpress,
  ConversationController.getConversationsByUserId
);
// router.post("/create", isAuthExpress, ConversationController.create);
// router.get(
//   "/get-all-user-in-conversation",
//   isAuthExpress,
//   ConversationController.getAllUserInConversation
// );

// router.get(
//   "/get-private-conversation",
//   isAuthExpress,
//   ConversationController.findPrivateConversation
// );

module.exports = router;
