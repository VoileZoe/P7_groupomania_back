const express = require("express");
const contentStatusCtrl = require("../controllers/contentStatus.controller");

const router = express.Router();

router.get("/", contentStatusCtrl.findAll);

module.exports = router;
