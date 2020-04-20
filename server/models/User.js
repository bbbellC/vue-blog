const db = require('../db');

const User = db.defineModel('user', {
    username: db.STRING,
    password: db.STRING,
    phone: db.STRING,
    avatar: {
        type: db.STRING,
        allowNull: true,
    },
    major: {
        type: db.STRING,
        allowNull: true,
    },
    message: {
        type: db.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
})
User.associate = models => {
    User.hasMany(models.Comment);
    User.hasMany(models.Reply);
    User.hasMany(models.Article);
}
module.exports = User;
