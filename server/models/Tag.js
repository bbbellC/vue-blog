const db = require('../db');

const Tag = db.defineModel('tag', {
    name: db.STRING,
}, {
    timestamps: false,
});
Tag.associate = models => {
    Tag.hasMany(models.ArticleTag);
}
module.exports = Tag;
