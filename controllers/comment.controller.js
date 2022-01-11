const Content = require("../models/content.model");
const Thread = require("../models/thread.model");
const User = require("../models/user.model");

exports.create = (req, res) => {
  console.info("--");
  console.info("controller.comment.create");

  // create the comment for the thread
  const contentObject = {
    user_id: req.body.user_id,
    thread_id: req.params.id,
    content_type_id: req.body.content_type_id,
    content_text: req.body.content_text,
  };

  (async () => {
    // get the thread to check if it exists
    await Thread.findOne(req.params.id);

    // create the thread main content
    const content = await Content.create(contentObject);
    return { id: content.id, message: content.message };
  })()
    .then((result) => {
      console.info("controller.comment.create ok");
      res.status(200).send({ id: result.id, message: "Commentaire crée !" });
    })
    .catch((err) => {
      console.warn("controller.comment.create ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// update a comment for the given thread
exports.update = (req, res) => {
  console.info("--");
  console.info("controller.comment.update");
  (async () => {
    // get the thread and comment ids
    const thread_id = req.params.id;
    const comment_id = req.params.commentId;

    // get the content in the body
    const contentObject = {};
    if (req.body.content_type_id)
      contentObject.content_type_id = req.body.content_type_id;
    if (req.body.content_text)
      contentObject.content_text = req.body.content_text;

    // get the main content id
    const content = await Content.findOne(comment_id);

    // only the author can delete a thread
    if (req.body.user_id != content.user_id) {
      throw { status: 403, message: "Modification non autorisée" };
    }

    // a user can only update a comment that belongs to the given thread
    if (content.thread_id != thread_id) {
      throw {
        status: 403,
        message:
          "Impossible de modifier ce commentaire car il n'est pas sur le thread séléctionné",
      };
    }

    // update the comment
    return await Content.update(content.id, contentObject);
  })()
    .then((result) => {
      console.info("controller.comment.update ok");
      res.status(200).send({ message: result.message });
    })
    .catch((err) => {
      console.warn("controller.comment.update ko");
      console.warn(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};

// delete a comment with the specified id in the request
exports.delete = (req, res) => {
  console.info("--");
  console.info("controller.comment.delete");
  (async () => {
    // get the thread and comment ids
    const thread_id = req.params.id;
    const comment_id = req.params.commentId;

    // get the main content id
    const thread = await Thread.findOne(thread_id);
    const comment = await Content.findOne(comment_id);

    // only the author can delete a thread
    if (req.body.user_id != comment.user_id) {
      throw { status: 403, message: "Suppression non autorisée" };
    }

    // a user can only delete a comment that belongs to the given thread
    if (comment.thread_id != thread.id) {
      throw {
        status: 403,
        message:
          "Impossible de supprimer ce commentaire car il n'est pas sur le thread séléctionné",
      };
    }

    // delete the comment
    return await Content.delete(comment.id);
  })()
    .then(() => {
      console.info("controller.comment.delete ok");
      res
        .status(200)
        .send({ message: `Commentaire avec id "${req.params.id}" supprimé !` });
    })
    .catch((err) => {
      console.info("controller.comment.delete ko");
      console.info(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};

// moderate a comment for the given thread
exports.moderate = (req, res) => {
  console.info("--");
  console.info("controller.comment.moderate");
  (async () => {
    // get the thread and comment ids
    const thread_id = req.params.id;
    const comment_id = req.params.commentId;
    const user_id = req.body.user_id;

    // get the thread to check if exists
    await Thread.findOne(thread_id);

    // get the comment
    const comment = await Content.findOne(comment_id);

    // get the user that requests a moderation
    const user = await User.findById(user_id);

    // only an admin can delete a thread
    if (user.role != "admin") {
      throw { status: 403, message: "Opération non autorisée" };
    }

    // a user can only moderate a comment that belongs to the given thread
    if (comment.thread_id != thread_id) {
      throw {
        status: 403,
        message:
          "Impossible de modifier ce commentaire car il n'est pas sur le thread séléctionné",
      };
    }

    // moderate the comment
    return await Content.moderate(comment.id);
  })()
    .then((result) => {
      console.info("controller.comment.moderate ok");
      res.status(200).send({ message: result.message });
    })
    .catch((err) => {
      console.warn("controller.comment.moderate ko");
      console.warn(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};

// retrieve all comments for a thread
exports.getCommentsByThreadId = (req, res) => {
  console.info("--");
  console.info("controller.comment.getCommentsByThreadId");
  (async () => {
    // pagination parameters
    const numPerPage = parseInt(req.query.npp, 10) || 10;
    const page = parseInt(req.query.page, 10) || 0;
    const skip = page * numPerPage;
    const limit = skip + "," + numPerPage;

    // other parameters
    const thread_id = req.params.id;

    const numRows = await Content.countByThread(thread_id);
    const numPages = Math.ceil(numRows / numPerPage);
    let comments = await Content.findByThreadPaginated(thread_id, limit);

    // delete the content if it is the main content of the thread
    const mainContent = await Content.findFirstOfThread(thread_id);
    comments = comments.filter((x) => x.id != mainContent.id);

    return {
      current: page,
      perPage: numPerPage,
      previous: page > 0 ? page - 1 : undefined,
      next: page < numPages - 1 ? page + 1 : undefined,
      comments,
    };
  })()
    .then((comments) => {
      console.info("controller.comment.getCommentsByThreadId ok");
      res.status(200).send(comments);
    })
    .catch((err) => {
      console.warn("controller.comment.getCommentsByThreadId ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// retrieve all comments for a thread
exports.findOne = (req, res) => {
  console.info("--");
  console.info("controller.comment.findOne");
  (async () => {
    return await Content.findOne(req.params.commentId);
  })()
    .then((comment) => {
      console.info("controller.comment.findOne ok");
      res.status(200).send(comment);
    })
    .catch((err) => {
      console.warn("controller.comment.findOne ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// retrieve comment count for a thread
exports.getCommentsCountByThreadId = (req, res) => {
  console.info("--");
  console.info("controller.comment.getCommentsCountByThreadId");
  (async () => {
    // get thread id
    const thread_id = req.params.id;

    return await Content.countByThread(thread_id);
  })()
    .then((commentCount) => {
      console.info("controller.comment.getCommentsCountByThreadId ok");
      res.status(200).send({ count: commentCount });
    })
    .catch((err) => {
      console.warn("controller.comment.getCommentsCountByThreadId ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};
