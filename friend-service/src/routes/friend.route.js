const router = require("express").Router();
const FriendController = require("../controllers/friend.controller");
const { isAuthExpress } = require("../middlewares/auth.middleware");

router.get("/", isAuthExpress, FriendController.findUserByPhoneNumber);

module.exports = router;
