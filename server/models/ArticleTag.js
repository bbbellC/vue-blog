const db = require('../db');

const ArticleTag = db.defineModel('articleTag', {
  articleId: db.INTEGER,
  tagId: db.INTEGER,
}, {
  timestamps: false,
});
ArticleTag.associate = models => {
  ArticleTag.belongsTo(models.Article);
  ArticleTag.belongsTo(models.Tag);
}

module.exports = ArticleTag;
