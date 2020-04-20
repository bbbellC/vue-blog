const { createToken, decodeToken } = require('../lib/token');
const model = require('../model');
let User = model.User;
let Article = model.Article;
let Comment = model.Comment;


// 登录
const login = async (ctx) => {
  const { phone, password } = ctx.request.body;
  const user = await User.findOne({ where: { phone } });
  let response;
  if (!user) {
    response = { code: 400, message: '该用户不存在！' };
  } else {
    const isMatch = password == user.password;
    if (!isMatch) {
      response = { code: 400, message: '密码不正确！' };
    } else {
      const { id, username, avatar, major, message } = user;
      const token = createToken({ username, userId: id }); // 生成 token
      
      response = { code: 200, username, token, avatar, major, message };
    }
  }
  ctx.body = response;
};

//注册
const register = async (ctx) => {
  const { phone, username, password } = ctx.request.body;
  if (phone && username && password) {
    const checkUser = await User.findOne({ where: { username } });
    const checkPhone = await User.findOne({ where: { phone } });
    let response;
    if (checkPhone) {
      response = { code: 400, message: '该手机号已被注册！' };
    } else if (checkUser) {
      response = { code: 400, message: '用户名已被注册！' }
    } else {
      await User.create({ phone, username, password });
      response = { code: 200, message: '注册成功！' };
    }
    ctx.body = response;
  }
}; 

// 上传头像
const upLoadAvatar = async (ctx) => {
  const uploadUrl = "http://127.0.0.1:8086/images";
  const file = ctx.request.files.file;
  const path = file.path.replace(/\\/g, '/').split('/')[2];
  const url = uploadUrl + `/${path}`;

  const { userId } = decodeToken(ctx);
  
  data = await User.update(
    { avatar: url },
    { where: { id: userId } },
  );

  ctx.body = {
    code: 200,
    url,
  };

};

// 改变用户名
const updateUsername = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { username } = ctx.request.body;

  const isExisted = await User.findOne({ where: { username } });
  if (!isExisted) {
    const data = await User.update(
      { username },
      { where: { id: userId } },
    );
    ctx.body = { code: 200, data: { username } };
  }
};

// 改变密码
const updateUserPw = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { old, pw } = ctx.request.body;

  const correct = await User.findOne({
    attributes: ['password'],
    where: { id: userId },
    raw: true,
  })
  
  if (old !== correct.password) {
    ctx.body = { code: 0, message: '原密码不正确！' };
    return;
  }

  const data = await User.update(
    { password: pw },
    { where: { id: userId } },
  );
  ctx.body = { code: 200, data };
};

// 改变专业
const updateMajor = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { major } = ctx.request.body;

  await User.update(
    { major },
    { where: { id: userId } },
  );
  ctx.body = { code: 200, data: { major } };
};

// 改变留言
const updateMessage = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { message } = ctx.request.body;

  await User.update(
    { message },
    { where: { id: userId } },
  );
  ctx.body = { code: 200, data: { message } };
};

// 查询属性
const getAttr = async (ctx) => {
  const userId = ctx.params.id;
  const article = await Article.findAll({
    attributes: ['tagsList', 'courseId'],
    where: { userId },
    // include: [
    //   {
    //     model: Course,
    //     attributes: ['name'],
    //   },
    // ],
    raw: true,
  });
  
  const comment = await Comment.findAll({
    attributes: ['articleId'],
    where: { userId, isA: 1 },
    include: [
      {
        model: Article,
        attributes: ['courseId'],
      }
    ],
    raw: true,
  });

  let tag = {}, course = {};
  for (let i = 0; i < article.length; ++i) {
    if (article[i].tagsList) {
      const tags = article[i].tagsList.split(',');
      for (let j = 0; j < tags.length; ++j) {
        const id = +tags[j];
        if (tag[id]) ++tag[id];
        else tag[id] = 1;
      }
    }
    if (article[i].courseId) {
      const id = article[i].courseId;
      if (course[id]) ++course[id];
      else course[id] = 1;
    }
  }

  for (let i = 0; i < comment.length; ++i) {
    const id = comment[i]['article.courseId'];
    if (course[id]) ++course[id];
    else course[id] = 1;
  }

  const info = await User.findOne({
    attributes: ['avatar', 'username', 'major', 'message'],
    where: { id: userId },
  });

  ctx.body = { code: 200, data: { info, tag, course } };
};

module.exports = {
  'POST /login': login,
  'POST /register': register,
  'POST /user/avatar': upLoadAvatar,
  'POST /user/name': updateUsername,
  'POST /user/pw': updateUserPw,
  'POST /user/major': updateMajor,
  'POST /user/message': updateMessage,
  'GET /user/attributes/:id': getAttr,
};
