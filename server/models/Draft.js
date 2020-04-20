const db = require('../db');
const Draft = db.defineModel('draft', {
  title: db.STRING,
  content: db.TEXT,
  userId: db.INTEGER,
  tagsList: db.STRING,
  courseId: {
    type: db.INTEGER,
    allowNull: true,
  },
  isPrivate: db.TINYINT,
});
Draft.associate = models => {
  Draft.belongsTo(models.User)
}
module.exports = Draft;
