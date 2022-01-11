const mysqlx = require("@mysql/xdevapi");
const dbConfig = require("../config/db.config");
const jsonFormatter = require("./jsonFormatter");
const userQueries = require("../queries/user.queries");

exports.create = async (user) => {
  console.info("model.user.create");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      // get the user table
      const table = session.getSchema(`${dbConfig.DB}`).getTable("user");

      // create the insert query with all values from the user given as parameter
      // then execute it
      return table
        .insert(Object.keys(user))
        .values(Object.values(user))
        .execute()
        .then(() => {
          session.close();
        });
    })
    .then(() => {
      console.info("model.user.create ok");
      return { message: "Utilisateur créé !" };
    })
    .catch((err) => {
      console.warn("model.user.create ko");
      switch (err.info.code) {
        case 1062:
          throw { message: "Cet email appartient déjà à un compte" };
        case 5014:
          throw { message: "Données insuffisantes pour créer un compte" };
        default:
          throw { message: err.message };
      }
    });
};

exports.findAll = async () => {
  console.info("model.user.findAll");
  // create the rows array and the metadata
  const rows = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = userQueries.selectAll();
      return session
        .sql(query)
        .execute(
          (row) => rows.push(row),
          (meta) => (metadata = meta)
        )
        .then(() => {
          session.close();
        });
    })
    .then(() => {
      // create the results array
      const res = [];
      // for each row, push a formated user as json in the results
      for (const data of rows) {
        res.push(jsonFormatter.format(data, metadata));
      }
      console.info("model.user.findAll ok");
      return res;
    })
    .catch((err) => {
      console.warn("model.user.findAll ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.findById = async (id) => {
  console.info("model.user.findById");
  // create the data and metadata for the query result
  let data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = userQueries.selectById(id);
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
      // if data is empty throw an error
      if (data.length == 0) {
        throw {
          status: 404,
          message: `Aucun utilisateur trouvé avec l'id "${id}"`,
        };
      }
      // return the formated user as json
      console.info("model.user.findById ok");
      return jsonFormatter.format(data, metadata);
    })
    .catch((err) => {
      console.warn("model.user.findById ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.findByEmail = async (email) => {
  console.info("model.user.findByEmail");
  // create the data and metadata for the query result
  let data = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = userQueries.selectByEmail(email);
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
      // if data is empty throw an error
      if (data.length == 0) {
        console.info("model.user.findByEmail ko");
        throw {
          status: 404,
          message: `Aucun utilisateur trouvé avec l'email "${email}"`,
        };
      }
      // return the formated user as json
      return jsonFormatter.format(data, metadata);
    })
    .catch((err) => {
      console.warn("model.user.findByEmail ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.update = async (id, user) => {
  console.info("model.user.update");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then(async (session) => {
      // get the user table
      const table = session.getSchema(`${dbConfig.DB}`).getTable("user");

      // create the update query
      var query = table.update().where(`id = "${id}"`);

      // add the fields to update in the query
      let keys = Object.keys(user);
      let values = Object.values(user);
      for (let i = 0; i < keys.length; i++) {
        query.set(keys[i], values[i]);
      }

      // execute the query
      await query.execute();
      session.close();
    })
    .then(() => {
      console.info("model.user.update ok");
      return { message: "Utilisateur modifié !" };
    })
    .catch((err) => {
      console.warn("model.user.update ko");
      console.warn(err);
      throw { message: err.message };
    });
};

exports.delete = async (id) => {
  console.info("model.user.delete");
  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      const query = userQueries.delete(id);
      return session.sql(query).execute();
    })
    .then((res) => {
      if (res.getAffectedItemsCount() == 0) {
        throw { message: `Aucun utilisateur trouvé avec l'id "${id}"` };
      }
      // return a validation message
      console.info("model.user.delete ok");
      return { message: `L'utilisateur avec l'id "${id}" supprimé` };
    })
    .catch((err) => {
      console.warn("model.user.delete ko");
      console.warn(err);
      throw { message: err.message };
    });
};
