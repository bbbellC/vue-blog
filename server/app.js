const Koa = require('koa');
const controller = require('./controller');
const cors = require('koa2-cors')

const app = new Koa();

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});


// add router middleware:

app.use(cors());

const koaBody = require('koa-body');
app.use(koaBody({
    multipart: true, // 支持文件上传
    formidable: {
      maxFieldsSize: 2 * 1024 * 1024, // 支持最大文件大小
      multipart: true, // 支持 multipart-formdate 的表单
      uploadDir: 'public/images', // 保存图片的文件夹
      keepExtensions: true  //  保留图片的扩展名
    }
}));

const path = require('path');
const static = require('koa-static');
app.use(static(path.join(__dirname, '/public'))); // 通过链接访问图片的文件夹

app.use(controller());

app.listen(8086, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.info("服务器起动成功..");
    }
})
console.log('app started at port 8086...');
