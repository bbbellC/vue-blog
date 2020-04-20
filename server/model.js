const fs = require('fs');

let files = fs.readdirSync(__dirname + '/models');

let js_files = files.filter((f) => {
    return f.endsWith('.js');
}, files);

let models = {}
for (let f of js_files) {
    let name = f.substring(0, f.length - 3);
    models[name] = require(__dirname + '/models/' + f);
}
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models)
    }
})

module.exports = models