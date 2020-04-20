const db = require('../db');
const Article = db.defineModel('article', {
    title: db.STRING,
    content: db.TEXT,
    userId: db.INTEGER,
    tagsList: {
        type: db.STRING,
        allowNull: true,
    },
    courseId: {
        type: db.INTEGER,
        allowNull: true,
    },
    likeCount: db.INTEGER,
    isQ: db.INTEGER,
    isPrivate: db.TINYINT,
    solvedId: db.INTEGER,
    viewCount: db.INTEGER,
});
Article.associate = models => {
    Article.hasMany(models.ArticleTag)
    Article.hasMany(models.Comment)
    Article.hasMany(models.Like)
    Article.belongsTo(models.Course)
    Article.belongsTo(models.User)
}
module.exports = Article;