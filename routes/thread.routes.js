const express = require("express");
const threadCtrl = require("../controllers/thread.controller");
const commentCtrl = require("../controllers/comment.controller");
const likeCtrl = require("../controllers/like.controller");
const auth = require("../middlewares/auth.middleware");
const multer = require("../middlewares/multer-config");

const router = express.Router();

// thread routes
router.get("/", auth, threadCtrl.findAll);
router.get("/:id", auth, threadCtrl.findOne);
router.post("/", auth, multer.single("image"), threadCtrl.create);
router.put("/:id", auth, multer.single("image"), threadCtrl.update);
router.delete("/:id", auth, threadCtrl.delete);

// comment routes
router.get("/:id/comments", auth, commentCtrl.getCommentsByThreadId);
router.post("/:id/comments", auth, commentCtrl.create);
router.get("/comments/:commentId", auth, commentCtrl.findOne);
router.put("/:id/comments/:commentId", auth, commentCtrl.update);
router.delete("/:id/comments/:commentId", auth, commentCtrl.delete);
router.get("/:id/comments/count", auth, commentCtrl.getCommentsCountByThreadId);

// like routes
router.get("/:id/like", auth, likeCtrl.getThreadLikes);
router.get("/:id/like/:userId", auth, likeCtrl.getThreadLikesByUser);
router.get("/:id/comments/:commentId/like", auth, likeCtrl.getCommentLikes);
router.get(
  "/:id/comments/:commentId/like/:userId",
  auth,
  likeCtrl.getCommentLikesByUser
);
router.post("/:id/like", auth, likeCtrl.likeThread);
router.post("/:id/comments/:commentId/like", auth, likeCtrl.likeComment);

// moderation routes
router.delete("/:id/moderate", auth, threadCtrl.moderate);
router.delete("/:id/comments/:commentId/moderate", auth, commentCtrl.moderate);

module.exports = router;
