const mysqlx = require("@mysql/xdevapi");
const dbConfig = require("../config/db.config");
const jsonFormatter = require("./jsonFormatter");
const likeQueries = require("../queries/like.queries");
const { selectByEmail } = require("../queries/user.queries");

// get like and dislike counts by content id
exports.getCountByContent = async (content_id) => {
  console.info("model.like.getCountByContent");
  let likes = [];
  let dislikes = [];
  let likesMeta = [];
  let dislikesMeta = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then(async (session) => {
      const queryLikes = likeQueries.findLikesByContentId(content_id);
      const queryDislikes = likeQueries.findDislikesByContentId(content_id);

      const likesPromise = session.sql(queryLikes).execute(
        (row) => (likes = row),
        (meta) => (likesMeta = meta)
      );
      const dislikesPromise = session.sql(queryDislikes).execute(
        (row) => (dislikes = row),
        (meta) => (dislikesMeta = meta)
      );
      await Promise.all([likesPromise, dislikesPromise]);
      session.close();

      return {
        ...jsonFormatter.format(likes, likesMeta),
        ...jsonFormatter.format(dislikes, dislikesMeta),
      };
    })
    .then((res) => {
      console.info("model.like.getCountByContent ok");
      return { content_id, ...res };
    })
    .catch((err) => {
      console.warn("model.like.getCountByContent ko");
      console.warn(err);
      throw { message: err.message };
    });
};

// get like and dislike counts by content id for a user
exports.getContentLikesByUser = async (content_id, user_id) => {
  console.info("model.like.getContentLikesByUser");
  let likes = [];
  let likesMeta = [];

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then(async (session) => {
      const queryLikes = likeQueries.findByContentIdAndUserId(
        content_id,
        user_id
      );

      await session.sql(queryLikes).execute(
        (row) => (likes = row),
        (meta) => (likesMeta = meta)
      );
      session.close();

      const result = {
        user_id,
        content_id,
        like: 0,
      };
      if (likes.length != 0) {
        result.like =
          jsonFormatter.format(likes, likesMeta).isLike == 1 ? 1 : -1;
      }

      return result;
    })
    .then((res) => {
      console.info("model.like.getContentLikesByUser ok");
      return { content_id, ...res };
    })
    .catch((err) => {
      console.warn("model.like.getContentLikesByUser ko");
      console.warn(err);
      throw { message: err.message };
    });
};

// get like and dislike counts by content id
exports.like = async (content_id, user_id, like) => {
  console.info("model.like.like");

  return mysqlx
    .getSession(
      `mysqlx://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:33060`
    )
    .then(async (session) => {
      // throw an error if like value is not supported
      if (like != 0 && like != 1 && like != -1) {
        throw { status: 404, message: `Opération non reconnue: like=${like}` };
      }
      // unlike or undislike first
      const unlikeQuery = likeQueries.unlike(content_id, user_id);
      await session.sql(unlikeQuery).execute();
      // then like or dislike
      if (like != 0) {
        const likeQuery = likeQueries.like(
          content_id,
          user_id,
          like == 1 ? 1 : 0
        );
        await session.sql(likeQuery).execute();
      }
      session.close();
    })
    .then(() => {
      switch (like) {
        case 0:
          message = "Contenu correctement unliké";
          break;
        case 1:
          message = "Contenu correctement liké";
          break;
        case -1:
          message = "Contenu correctement disliké";
          break;
        default:
          break;
      }
      console.info("model.like.like ok");
      return { message };
    })
    .catch((err) => {
      console.warn("model.like.like ko");
      console.warn(err);
      throw { status: err.status || 500, message: err.message };
    });
};
