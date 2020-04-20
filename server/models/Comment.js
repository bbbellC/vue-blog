const db = require('../db');
const Comment = db.defineModel('comment', {
    content: db.TEXT,
    userId: db.INTEGER,
    articleId: db.INTEGER,
    likeCount: {
        type: db.INTEGER,
        allowNull: true,
    },
    isA: db.TINYINT,
});
Comment.associate = models => {
    Comment.belongsTo(models.Article);
    Comment.belongsTo(models.User);
    Comment.hasMany(models.Reply);
    Comment.hasMany(models.Like);
}
module.exports = Comment;