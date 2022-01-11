const express = require("express");
const userCtrl = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", auth, userCtrl.findAll);
router.get("/:id", auth, userCtrl.findOne);
router.put("/:id", auth, userCtrl.update);
router.delete("/:id", auth, userCtrl.delete);

module.exports = router;
