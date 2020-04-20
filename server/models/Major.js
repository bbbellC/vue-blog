const db = require('../db');
const Major = db.defineModel('major', {
    name: db.STRING,
});
Major.associate = models => {
    Major.hasMany(models.Course)
}
module.exports = Major;