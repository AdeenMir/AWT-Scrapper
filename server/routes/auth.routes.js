const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const { signup, login, logout, me } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

module.exports = router;
