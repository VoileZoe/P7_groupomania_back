const mysqlx = require("@mysql/xdevapi");
const dbConfig = require("../config/db.config");
const jsonFormatter = require("./jsonFormatter");
const dateFormatter = require("./dateFormatter");
const contentQueries = require("../queries/content.queries");

/**
 * Create a content with the provided data
 * @param {*} content data
 * @returns
 */
exports.create = async (content) => {
  console.info("model.content.create");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      // get the content table
      const table = session.getSchema(`${dbConfig.DB}`).getTable("content");

      // create the insert query with all values from the content given as parameter
      // then execute it
      return table
        .insert(Object.keys(content))
        .values(Object.values(content))
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then((res) => {
      console.info("model.content.create ok");
      // return the id
      const id = res.getAutoIncrementValue();
      return { id, message: "Contenu créé !" };
    })
    .catch((err) => {
      console.warn("model.content.create ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.findOne = async (id) => {
  console.info("model.content.findOne");
  // create the data and metadata placeholders for the query result
  let data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = contentQueries.selectOneById(id);
      return session
        .sql(query)
        .execute(
          (row) => (data = row),
          (meta) => (metadata = meta)
        )
        .then(() => {
          session.close();
        });
    })
    .then(() => {
      if (data.length == 0) {
        throw { message: `Aucun content trouvé avec l'id "${id}"` };
      }
      // return the formated content as json
      console.info("model.content.findOne ok");
      return jsonFormatter.format(data, metadata);
    })
    .catch((err) => {
      console.warn("model.content.findOne ko");
      console.warn(err);
      throw { message: err.message };
    });
};

/**
 * Retrieve the thread's main content
 * @param {*} thread_id
 * @returns
 */
exports.findFirstOfThread = async (thread_id) => {
  console.info("model.content.findFirstOfThread");

  // create the data and metadata
  let data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = contentQueries.selectFirstOfThread(thread_id);
      return session
        .sql(query)
        .execute(
          (row) => (data = row),
          (meta) => (metadata = meta)
        )
        .then(() => {
          session.close();
        });
    })
    .then(() => {
      console.info("model.content.findFirstOfThread ok");
      if (data.length == 0)
        throw { message: `No thread found with id "${thread_id}"` };
      // return the formated content as json
      return jsonFormatter.format(data, metadata);
    })
    .catch((err) => {
      console.warn("model.content.findFirstOfThread ko");
      console.warn(err);
      throw { message: err.message };
    });
};

/**
 * Retrieve the comments in the given thread
 * @param {*} thread_id
 * @param {*} limit pagination parameters
 * @returns
 */
exports.findByThreadPaginated = async (thread_id, limit) => {
  console.info("model.content.findByThreadPaginated");

  // create the data and metadata
  let data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then(async (session) => {
      const query = contentQueries.selectByThreadIdPaginated(thread_id, limit);
      return session
        .sql(query)
        .execute(
          (row) => data.push(row),
          (meta) => (metadata = meta)
        )
        .then(() => {
          session.close();
        });
    })
    .then(() => {
      if (data.length == 0) {
        throw {
          message: `Aucun commentaire trouvé pour le thread id "${thread_id}"`,
        };
      }

      console.info("model.content.findByThreadPaginated ok");
      return data.map((row) => jsonFormatter.format(row, metadata));
    })
    .catch((err) => {
      console.warn("model.content.findByThreadPaginated ko");
      console.warn(err);
      throw { message: err.message };
    });
};

/**
 * Get the number of comments in a given thread
 * @param {*} thread_id
 * @returns
 */
exports.countByThread = async (thread_id) => {
  console.info("model.content.countByThread");

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const countQuery = contentQueries.selectCountByThreadId(thread_id);
      return session
        .sql(countQuery)
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then((numRows) => {
      console.info("model.content.countByThread ok");
      return numRows.fetchOne()[0] - 1;
    })
    .catch((err) => {
      console.warn("model.content.countByThread ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.update = async (id, content) => {
  console.info("model.content.update");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      // get the content table
      const table = session.getSchema(`${dbConfig.DB}`).getTable("content");

      // create the update query
      var query = table.update().where(`id = "${id}"`);

      // add the fields to update in the query
      let keys = Object.keys(content);
      let values = Object.values(content);
      for (let i = 0; i < keys.length; i++) {
        query.set(keys[i], values[i]);
      }
      // set the date_update field
      query.set("date_update", dateFormatter.format(new Date()));

      // execute the query
      return query.execute().then(() => {
        session.close();
      });
    })
    .then(() => {
      console.info("model.content.update ok");
      return { message: "Commentaire modifié !" };
    })
    .catch((err) => {
      console.warn("model.content.update ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.delete = async (id) => {
  console.info("model.content.delete");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = contentQueries.delete(id);
      return session
        .sql(query)
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then((res) => {
      if (res.getAffectedItemsCount() == 0) {
        throw { message: `Aucun contenu trouvé avec l'id: "${id}"` };
      }
      // return a validation message
      console.info("model.content.delete ok");
      return { message: `Commentaire avec l'id "${id}" supprimé !` };
    })
    .catch((err) => {
      console.info("model.content.delete ko");
      console.info(err);
      throw { message: err.message };
    });
};

exports.moderate = async (id) => {
  console.info("model.content.moderate");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = contentQueries.moderate(id);
      return session
        .sql(query)
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then(() => {
      console.info("model.content.moderate ok");
      return { message: `Commentaire avec l'id "${id}" modéré !` };
    })
    .catch((err) => {
      console.warn("model.content.moderate ko");
      console.warn(err);
      throw { message: err.message };
    });
};
