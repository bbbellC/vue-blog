const Sequelize = require('sequelize');
const config = require('./config');
var dateFormat = require('dateformat');

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

function defineModel(name, attributes, desc) {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    let timestamps = !(desc && !desc.timestamps);
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: timestamps,  //Sequelize的自动添加timestamp
        deletedAt: false,
        freezeTableName: true,   //关闭默认给表名加s
        hooks: {
            beforeValidate: function (obj) {
                // sequelize 存取时间是按照 UTC标准时间,要想存储北京时间设置timezone为-8:00
                let now = dateFormat(Date.now() - (-8 * 3600 * 1000), "yyyy.mm.dd HH:MM:ss")   
                if (obj.isNewRecord) {
                    obj.createdAt = now;
                    obj.updatedAt = now;
                } else {
                    obj.updatedAt = now;
                }
            }
        }
    });
}

const TYPES = ['STRING', 'INTEGER', 'TINYINT', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

var exp = {
    defineModel: defineModel,
    sync: () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            sequelize.sync({ force: true });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.sequelize = sequelize;

module.exports = exp;
