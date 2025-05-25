const express = require("express");
const router = express.Router();
const { isAuth } = require("../middlewares/auth.middlewares");
const { UserController } = require("../controllers/user.controller");

router.get("/profile", isAuth, async (req, res) => {
  res.json({
    status: "success",
    message: "Lấy thông tin user thành công",
    user: req.user,
  });
});
router.post("/update", isAuth, UserController.updateUser);
router.post("/update-avt", isAuth, UserController.updateAvt);
router.get("/get-user", isAuth, UserController.getUserById);
router.get("/get-user-by-username", isAuth, UserController.getUserByUsername);
router.put("/update-status", isAuth, UserController.updateUserStatus);
router.get("/get-users-by-list-user-id", isAuth, UserController.getUsersByListUserId);

module.exports = router;
