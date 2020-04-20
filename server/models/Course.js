const db = require('../db');
const Course = db.defineModel('course', {
    name: db.STRING,
    majorId: db.INTEGER
}, {
    timestamps: false,
});
Course.associate = models => {
    Course.belongsTo(models.Major);
    Course.hasMany(models.Article);
}
module.exports = Course;