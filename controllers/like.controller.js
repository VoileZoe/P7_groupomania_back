const Like = require("../models/like.model");
const Content = require("../models/content.model");
const Thread = require("../models/thread.model");

// get a thread like and dislike counts
exports.getThreadLikes = (req, res) => {
  console.info("--");
  console.info("controller.thread.getThreadLikes");
  (async () => {
    const content = await Content.findFirstOfThread(req.params.id);
    return Like.getCountByContent(content.id);
  })()
    .then((likes) => {
      console.info("controller.thread.getThreadLikes ok");
      res.status(200).send(likes);
    })
    .catch((err) => {
      console.warn("controller.thread.getThreadLikes ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// get a comment like and dislike counts
exports.getCommentLikes = (req, res) => {
  console.info("--");
  console.info("controller.thread.getCommentLikes");
  (async () => {
    const content = await Content.findOne(req.params.commentId);
    return Like.getCountByContent(content.id);
  })()
    .then((likes) => {
      console.info("controller.thread.getCommentLikes ok");
      res.status(200).send(likes);
    })
    .catch((err) => {
      console.warn("controller.thread.getCommentLikes ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// find if a user liked a Thread
exports.getThreadLikesByUser = (req, res) => {
  console.info("--");
  console.info("controller.thread.getThreadLikesByUser");
  (async () => {
    const content = await Content.findFirstOfThread(req.params.id);
    return Like.getContentLikesByUser(content.id, req.params.userId);
  })()
    .then((likes) => {
      console.info("controller.thread.getThreadLikesByUser ok");
      res.status(200).send(likes);
    })
    .catch((err) => {
      console.warn("controller.thread.getThreadLikesByUser ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// find if a user liked a Thread
exports.getCommentLikesByUser = (req, res) => {
  console.info("--");
  console.info("controller.thread.getCommentLikesByUser");
  (async () => {
    const content = await Content.findOne(req.params.commentId);
    return Like.getContentLikesByUser(content.id, req.params.userId);
  })()
    .then((likes) => {
      console.info("controller.thread.getCommentLikesByUser ok");
      res.status(200).send(likes);
    })
    .catch((err) => {
      console.warn("controller.thread.getCommentLikesByUser ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// like a single thread with an id
exports.likeThread = (req, res) => {
  console.info("--");
  console.info("controller.like.likeThread");
  (async () => {
    const content = await Content.findFirstOfThread(req.params.id);
    return Like.like(content.id, req.body.user_id, req.body.like);
  })()
    .then((result) => {
      console.info("controller.like.likeThread ok");
      res.status(200).send(result);
    })
    .catch((err) => {
      console.warn("controller.like.likeThread ko");
      console.warn(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};

// like a thread's comment
exports.likeComment = (req, res) => {
  console.info("--");
  console.info("controller.like.likeComment");
  (async () => {
    // get the thread to check if exists
    await Thread.findOne(req.params.id);
    const content = await Content.findOne(req.params.commentId);

    // a user can only like a comment that belongs to the given thread
    if (content.thread_id != req.params.id) {
      throw {
        status: 403,
        message:
          "Impossible de liker ce commentaire car il n'est pas sur le thread séléctionné",
      };
    }

    return Like.like(content.id, req.body.user_id, req.body.like);
  })()
    .then((result) => {
      console.info("controller.like.likeComment ok");
      res.status(200).send(result);
    })
    .catch((err) => {
      console.warn("controller.like.likeComment ko");
      console.warn(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};
