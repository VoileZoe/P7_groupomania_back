const dbConfig = require("../config/db.config");

exports.selectAll = () => {
  return `select 
              u.id,
              u.name,
              u.email,
              u.password,
              r.name as role,
              s.name as status
          from ${dbConfig.DB}.user u
          join ${dbConfig.DB}.role r on r.id = u.role_id
          join ${dbConfig.DB}.user_status s on s.id = u.status_id`;
};

exports.selectById = (id) => {
  return `select 
              u.id,
              u.name,
              u.email,
              u.password,
              r.name as role,
              s.name as status
          from ${dbConfig.DB}.user u
          join ${dbConfig.DB}.role r on r.id = u.role_id
          join ${dbConfig.DB}.user_status s on s.id = u.status_id
          where u.id = "${id}"`;
};

exports.selectByEmail = (email) => {
  return `select 
              u.id,
              u.name,
              u.email,
              u.password,
              r.name as role,
              s.name as status
          from ${dbConfig.DB}.user u
          join ${dbConfig.DB}.role r on r.id = u.role_id
          join ${dbConfig.DB}.user_status s on s.id = u.status_id
          where u.email = "${email}"`;
};

exports.delete = (id) => {
  return `update ${dbConfig.DB}.user u
          set u.status_id =
            (select s.id 
            from ${dbConfig.DB}.user_status s
            where s.name = "deleted")
          where u.id = "${id}"`;
};
