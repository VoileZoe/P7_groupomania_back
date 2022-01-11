const mysqlx = require("@mysql/xdevapi");
const dbConfig = require("../config/db.config");
const jsonFormatter = require("./jsonFormatter");

exports.findAll = async () => {
  console.info("model.contentType.findAll");
  // create the rows array and the metadata
  const rows = [];
  let metadata = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then((session) => {
      // get the content_type table
      const table = session
        .getSchema(`${dbConfig.DB}`)
        .getTable("content_type");

      return table
        .select()
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
      // for each row, push a formated content_type as json in the results
      for (const data of rows) {
        res.push(jsonFormatter.format(data, metadata));
      }
      console.info("model.contentType.findAll ok");
      return res;
    })
    .catch((err) => {
      console.warn("model.contentType.findAll ko");
      console.warn(err);
      throw { message: err.message };
    });
};
