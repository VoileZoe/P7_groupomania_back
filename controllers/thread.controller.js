const Thread = require("../models/thread.model");
const Content = require("../models/content.model");
const User = require("../models/user.model");
const Like = require("../models/like.model");

// create and Save a new Thread
exports.create = (req, res) => {
  console.info("--");
  console.info("controller.thread.create");

  const resThread = JSON.parse(req.body.thread);

  // create a Thread
  const threadObject = {
    title: resThread.title,
    category_id: resThread.category_id,
  };
  if (resThread.category_id) threadObject.category_id = resThread.category_id;

  const content_type_id = resThread.content.content_type_id;
  let content_text = undefined;
  switch (content_type_id) {
    case 1:
      content_text = resThread.content.content_text;
      break;
    case 2:
      content_text = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
      break;
    case 3:
      content_text = resThread.content.content_text;
      break;
    default:
      content_text = resThread.content.content_text;
      break;
  }
  if (content_text == "") content_text = null;

  // create the main content for the thread
  const contentObject = {
    user_id: req.body.user_id,
    content_type_id,
    content_text,
  };

  (async () => {
    // create thread
    const thread = await Thread.create(threadObject);
    // get the thread id
    contentObject.thread_id = thread.id;
    // create the thread main content
    await Content.create(contentObject);
    return { id: thread.id, message: thread.message };
  })()
    .then((result) => {
      console.info("controller.thread.create ok");
      res.status(200).send({ id: result.id, message: result.message });
    })
    .catch((err) => {
      console.warn("controller.thread.create ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// retrieve all Threads from the database.
exports.findAll = (req, res) => {
  console.info("--");
  console.info("controller.thread.findAll");
  (async () => {
    // pagination parameters
    const numPerPage = parseInt(req.query.npp, 10) || 5;
    const page = parseInt(req.query.page, 10) || 0;
    const skip = page * numPerPage;
    const limit = skip + "," + numPerPage;

    let numRows;
    let numPages;
    let threads;
    numRows = await Thread.count(req.query.categoryId);
    numPages = Math.ceil(numRows / numPerPage);
    if (req.query.categoryId) {
      threads = await Thread.findAllPaginated(limit, req.query.categoryId);
    } else {
      threads = await Thread.findAllPaginated(limit);
    }

    threads = await Promise.all(
      threads.map(async (thread) => {
        const content = await Content.findFirstOfThread(thread.id);
        thread.content = content;
        return thread;
      })
    );

    return {
      current: page,
      perPage: numPerPage,
      previous: page > 0 ? page - 1 : undefined,
      next: page < numPages - 1 ? page + 1 : undefined,
      threads,
    };
  })()
    .then((threads) => {
      console.info("controller.thread.findAll ok");
      res.status(200).send(threads);
    })
    .catch((err) => {
      console.warn("controller.thread.findAll ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// find a single Thread with an id
exports.findOne = (req, res) => {
  console.info("--");
  console.info("controller.thread.findOne");
  (async () => {
    const thread = await Thread.findOne(req.params.id);
    const content = await Content.findFirstOfThread(thread.id);

    // check if the thread is not deleted
    if (content.status != "validated") {
      throw { status: 403, message: "Ce thread n'est plus disponible !" };
    }
    thread.content = content;
    return thread;
  })()
    .then((thread) => {
      console.info("controller.thread.findOne ok");
      res.status(200).send(thread);
    })
    .catch((err) => {
      console.info("controller.thread.findOne ko");
      console.info(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};

// update a Thread by the id in the request
exports.update = (req, res) => {
  console.info("--");
  console.info("controller.thread.update");
  (async () => {
    // get the thread id
    const thread_id = req.params.id;
    const user_id = req.body.user_id;
    const resThread = JSON.parse(req.body.thread);

    // get the user
    const user = await User.findById(user_id);
    // get the main content id
    const content = await Content.findFirstOfThread(thread_id);

    // create a Thread
    const threadObject = {};
    if (resThread.title) threadObject.title = resThread.title;
    if (resThread.category_id) threadObject.category_id = resThread.category_id;

    const content_type_id = resThread.content.content_type_id;
    let content_text = undefined;
    switch (content_type_id) {
      case 1:
        content_text = resThread.content.content_text;
        break;
      case 2:
        content_text = req.file
          ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
          : content.content_text;
        break;
      case 3:
        content_text = resThread.content.content_text;
        break;
      default:
        content_text = resThread.content.content_text;
        break;
    }

    // create the main content for the thread
    const contentObject = {
      user_id: req.body.user_id,
      content_type_id,
      content_text,
    };

    // only the author and an admin can delete a thread
    if (user.id != content.user_id && user.role != "admin") {
      throw { status: 403, message: "Modification non autorisée" };
    }

    // update the thread and its content
    await Content.update(content.id, contentObject);
    return await Thread.update(thread_id, threadObject);
  })()
    .then((result) => {
      console.info("controller.thread.update ok");
      res.status(200).send({ message: result.message });
    })
    .catch((err) => {
      console.warn("controller.thread.update ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};

// delete a Thread with the specified id in the request
exports.delete = (req, res) => {
  console.info("--");
  console.info("controller.thread.delete");
  (async () => {
    // get the thread id
    const thread_id = req.params.id;

    // get the main content id
    const content = await Content.findFirstOfThread(thread_id);

    // only the author can delete a thread
    if (req.body.user_id != content.user_id) {
      throw { status: 403, message: "Suppression non autorisée" };
    }

    // update the thread and its content
    return await Content.delete(content.id);
  })()
    .then(() => {
      console.info("controller.thread.delete ok");
      res
        .status(200)
        .send({ message: `Thread avec id "${req.params.id}" supprimé !` });
    })
    .catch((err) => {
      console.info("controller.thread.delete ko");
      console.info(err);
      res.status(err.status || 500).send({ message: err.message });
    });
};

// moderate a Thread by the id in the request
exports.moderate = (req, res) => {
  console.info("--");
  console.info("controller.thread.moderate");
  (async () => {
    // get the thread and user ids
    const thread_id = req.params.id;
    const user_id = req.body.user_id;

    // get the thread main content
    const content = await Content.findFirstOfThread(thread_id);

    // get the user that requests a moderation
    const user = await User.findById(user_id);

    // only an admin can moderate a thread
    if (user.role != "admin") {
      throw { status: 403, message: "Opération non autorisée" };
    }

    // moderate the content
    return await Content.moderate(content.id);
  })()
    .then(() => {
      console.info("controller.thread.moderate ok");
      res
        .status(200)
        .send({ message: `Thread avec l'id "${req.params.id}" modéré !` });
    })
    .catch((err) => {
      console.warn("controller.thread.moderate ko");
      console.warn(err);
      res.status(500).send({ message: err.message });
    });
};
