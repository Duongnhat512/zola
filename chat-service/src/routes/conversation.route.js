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

router.get(
  "/get-private-conversation",
  isAuthExpress,
  ConversationController.findPrivateConversation
);
router.get(
  "/get-group-conversation",
  isAuthExpress,
  ConversationController.getGroupConversationByUserId
);
router.get(
  "/get-conversation-by-id",
  isAuthExpress,
  ConversationController.getConversationById
);
router.get(
  "/get-conversation-recent",
  isAuthExpress,
  ConversationController.getConversationsRecent
);
router.get("/get-common-conversation", isAuthExpress, ConversationController.getCommonGroups);
router.get("/get-messages-type-image-or-video", isAuthExpress, ConversationController.getMessageTypeImageAndVideo);



router.get(
  "/check-is-group/:conversation_id",
  isAuthExpress,
  ConversationController.checkIsGroup
);
module.exports = router;
