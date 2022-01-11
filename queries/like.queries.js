const dbConfig = require("../config/db.config");

exports.findLikesByContentId = (content_id) => {
  return `select count(*) as likes
        from ${dbConfig.DB}.likes l 
        where l.content_id = ${content_id}
        and l.isLike = 1
        `;
};

exports.findDislikesByContentId = (content_id) => {
  return `select count(*) as dislikes
        from ${dbConfig.DB}.likes l 
        where l.content_id = ${content_id}
        and l.isLike = 0
        `;
};

exports.findByContentIdAndUserId = (content_id, user_id) => {
  return `select l.isLike as isLike
        from ${dbConfig.DB}.likes l 
        where l.content_id = ${content_id}
        and l.user_id = "${user_id}"
        `;
};

exports.like = (content_id, user_id, like) => {
  return `insert into ${dbConfig.DB}.likes (\`user_id\`, \`content_id\`, \`isLike\`)
        values ("${user_id}", ${content_id}, ${like})
        `;
};

exports.unlike = (content_id, user_id) => {
  return `delete from ${dbConfig.DB}.likes l
        where l.content_id = ${content_id}
        and l.user_id = "${user_id}"
        `;
};
