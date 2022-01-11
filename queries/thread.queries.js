const dbConfig = require("../config/db.config");

exports.selectOneById = (thread_id) => {
  return `select 
              t.id as id,
              t.title as title,
              t.category_id as category_id
          from ${dbConfig.DB}.thread t
          where t.id = ${thread_id}`;
};

exports.selectAllPaginated = (limit) => {
  return `select 
              t.id as id,
              t.title as title,
              t.category_id as category_id
          from ${dbConfig.DB}.thread t
          join ${dbConfig.DB}.content c on 
              c.id = (
                  select c1.id 
                  from ${dbConfig.DB}.content c1
                  where t.id = c1.thread_id
                  order by c1.id limit 1
              )
          where c.content_status_id = (
              select s.id
              from ${dbConfig.DB}.content_status s
              where s.status = "validated"
          )
          order by id desc
          limit ${limit}`;
};

exports.selectAllByCategoryPaginated = (limit, category_id) => {
  return `select 
                t.id as id,
                t.title as title,
                t.category_id as category_id
            from ${dbConfig.DB}.thread t
            join ${dbConfig.DB}.content c on 
                c.id = (
                    select c1.id 
                    from ${dbConfig.DB}.content c1
                    where t.id = c1.thread_id
                    order by c1.id limit 1
                )
            where c.content_status_id = (
                select s.id
                from ${dbConfig.DB}.content_status s
                where s.status = "validated"
            )
            and t.category_id = ${category_id}
            order by id desc
            limit ${limit}`;
};

exports.selectCount = () => {
  return `select count(*)
          from ${dbConfig.DB}.thread t
          join ${dbConfig.DB}.content c on 
              c.id = (
                  select c1.id 
                  from ${dbConfig.DB}.content c1
                  where t.id = c1.thread_id
                  order by c1.id limit 1
              )
          where c.content_status_id = (
              select s.id
              from ${dbConfig.DB}.content_status s
              where s.status = "validated"
          )`;
};

exports.selectCountByCategory = (category_id) => {
  return `select count(*)
          from ${dbConfig.DB}.thread t
          join ${dbConfig.DB}.content c on 
              c.id = (
                  select c1.id 
                  from ${dbConfig.DB}.content c1
                  where t.id = c1.thread_id
                  order by c1.id limit 1
              )
          where c.content_status_id = (
              select s.id
              from ${dbConfig.DB}.content_status s
              where s.status = "validated"
          )
          and t.category_id = ${category_id}`;
};
