const dbConfig = require("../config/db.config");

exports.selectOneById = (id) => {
  return `select 
            c.id,
            c.thread_id,
            c.user_id,
            c.content_type_id,
            c.content_text,
            s.status ,
            c.date_creation as date_creation,
            c.date_update
        from ${dbConfig.DB}.content c
        join ${dbConfig.DB}.content_status s on s.id = c.content_status_id
        where c.id = ${id}`;
};

exports.selectFirstOfThread = (thread_id) => {
  return `select 
            c.id,
            c.thread_id,
            c.user_id,
            c.content_type_id,
            c.content_text,
            s.status,
            c.date_creation as date_creation,
            c.date_update
        from ${dbConfig.DB}.content c
        join ${dbConfig.DB}.content_status s on s.id = c.content_status_id
        where c.thread_id = ${thread_id}
        order by date_creation asc
        limit 1`;
};

exports.selectCountByThreadId = (thread_id) => {
  return `select count(*)
        from ${dbConfig.DB}.content c
        join ${dbConfig.DB}.content_status s on s.id = c.content_status_id
        and s.status = "validated"
        where c.thread_id = ${thread_id}`;
};

exports.selectByThreadIdPaginated = (thread_id, limit) => {
  return `select 
            c.id,
            c.thread_id,
            c.user_id,
            c.content_type_id,
            c.content_text,
            s.status ,
            c.date_creation as date_creation,
            c.date_update
        from ${dbConfig.DB}.content c
        join ${dbConfig.DB}.content_status s on s.id = c.content_status_id
        where c.thread_id = ${thread_id}
        and s.status = "validated"
        order by date_creation desc
        limit ${limit}`;
};

exports.delete = (id) => {
  return `update ${dbConfig.DB}.content c
        set 
            c.content_status_id =
                (select s.id 
                from ${dbConfig.DB}.content_status s
                where s.status = "deleted"),
            c.date_update = now()    
        where c.id = "${id}"`;
};

exports.moderate = (id) => {
  return `update ${dbConfig.DB}.content c
        set 
            c.content_status_id =
                (select s.id 
                from ${dbConfig.DB}.content_status s
                where s.status = "moderated"),
            c.date_update = now()    
        where c.id = "${id}"`;
};
