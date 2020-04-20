const db = require('../db');
const Like = db.defineModel('like', {
  userId: db.INTEGER,
  articleId: {
    type: db.INTEGER,
    allowNull: true,
  },
  commentId: {
    type: db.INTEGER,
    allowNull: true,
  },
});
Like.associate = models => {
  Like.belongsTo(models.Article);
  Like.belongsTo(models.User);
  Like.belongsTo(models.Comment);
}
module.exports = Like;