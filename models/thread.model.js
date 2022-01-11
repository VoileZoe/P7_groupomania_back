const mysqlx = require("@mysql/xdevapi");
const dbConfig = require("../config/db.config");
const jsonFormatter = require("./jsonFormatter");
const dateFormatter = require("./dateFormatter");
const threadQueries = require("../queries/thread.queries");
const likeQueries = require("../queries/like.queries");

exports.create = async (thread) => {
  console.info("model.thread.create");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      // get the thread table
      const table = session.getSchema(`${dbConfig.DB}`).getTable("thread");

      // create the insert query with all values from the thread given as parameter
      // then execute it
      return table
        .insert(Object.keys(thread))
        .values(Object.values(thread))
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then((res) => {
      console.info("model.thread.create ok");
      // return the id
      const id = res.getAutoIncrementValue();
      return { id, message: "Thread créé !" };
    })
    .catch((err) => {
      console.warn("model.thread.create ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.findAllPaginated = async (limit, category_id) => {
  console.info("model.thread.findAllPaginated");
  // create the rows array and the metadata
  const data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = category_id
        ? threadQueries.selectAllByCategoryPaginated(limit, category_id)
        : threadQueries.selectAllPaginated(limit);
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
      console.info("model.thread.findAllPaginated ok");
      return data.map((row) => jsonFormatter.format(row, metadata));
    })
    .catch((err) => {
      console.warn("model.thread.findAllPaginated ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.findOne = async (id) => {
  console.info("model.thread.findOne");
  // create the data and metadata placeholders for the query result
  let data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = threadQueries.selectOneById(id);
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
        throw { message: `Aucun thread trouvé avec l'id "${id}"` };
      }
      // return the formated ${id}thread as json
      console.info("model.thread.findOne ok");
      return jsonFormatter.format(data, metadata);
    })
    .catch((err) => {
      console.warn("model.thread.findOne ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.count = async (category_id) => {
  console.info("model.thread.count");

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const countQuery = category_id
        ? threadQueries.selectCountByCategory(category_id)
        : threadQueries.selectCount();
      return session
        .sql(countQuery)
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then((numRows) => {
      console.info("model.thread.count ok");
      return numRows.fetchOne()[0];
    })
    .catch((err) => {
      console.warn("model.thread.count ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.update = async (id, thread) => {
  console.info("model.thread.update");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      // get the thread table
      const table = session.getSchema(`${dbConfig.DB}`).getTable("thread");

      // create the update query
      var query = table.update().where(`id = "${id}"`);

      // add the fields to update in the query
      let keys = Object.keys(thread);
      let values = Object.values(thread);
      for (let i = 0; i < keys.length; i++) {
        query.set(keys[i], values[i]);
      }

      // execute the query
      return query.execute().then(() => {
        session.close();
      });
    })
    .then(() => {
      console.info("model.thread.update ok");
      return { message: "Thread modifié !" };
    })
    .catch((err) => {
      console.warn("model.thread.update ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.getUserLikeContent = async (contentId, userId) => {
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = likeQueries.getUserLikeContent(contentId, userId);
      return session
        .sql(query)
        .execute()
        .then((res) => {
          session.close();
          return res;
        });
    })
    .then((res) => {
      return res.fetchOne()[0];
    })
    .catch((error) => {
      throw { message: error.message };
    });
};
