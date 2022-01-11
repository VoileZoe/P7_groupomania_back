const express = require("express");
const contentTypeCtrl = require("../controllers/contentType.controller");

const router = express.Router();

router.get("/", contentTypeCtrl.findAll);

module.exports = router;
