const model = require('../model');
let Article = model.Article;
let Comment = model.Comment;
let Reply = model.Reply;
let Like = model.Like;
let User = model.User;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { decodeToken } = require('../lib/token')

//查询问答列表
const getQuestionList = async (ctx) => {
  let { page = 1, pageSize = 10, title, courseId, userId, isAuthor, type } = ctx.query,
    offset = (page - 1) * pageSize
  let filter = {
    isQ: 1,
  };
  if (title) filter.title = { [Op.like]: `%${title}%` };
  if (courseId) filter.courseId = courseId;
  if (type === 'un') filter.solvedId = 0;
  if (isAuthor) {
      const { userId } = decodeToken(ctx);
      filter.userId = userId;
  }
  if (userId) filter.userId = userId;

  pageSize = parseInt(pageSize) // 处理 pageSize
  const orderKey = type === 'hot' ? 'viewCount' : 'createdAt';

  const data = await Article.findAndCountAll({
      where: filter,
      include: [
          {
              model: Comment,
              attributes: ['id'],
              include: [{ model: Reply, attributes: ['id'] }]
          },
          {
            model: User,
            attributes: ['username'],
        },
      ],
      offset, //开始的数据索引
      limit: pageSize,    //每页限制返回的数据条数
      order: [[orderKey, 'DESC']],
      row: true,
      distinct: true
  })
  ctx.body = { code: 200, ...data }
};
const getSimpleQuestionList = async (ctx) => {
  let { page = 1, pageSize = 10, userId, type, liked } = ctx.query,
    offset = (page - 1) * pageSize
  let filter = {
    isQ: 1,
    userId,
  };
  if (+liked === 1) filter.likeCount = { [Op.gte]: 1 };

  const existent = await Article.findOne({ where: filter });
  if (!existent) {
    ctx.body = { code: 200, data: null };
    return;
  }

  pageSize = parseInt(pageSize) // 处理 pageSize
  const orderKey = type === 'hot' ? 'viewCount' : 'createdAt';

  const data = await Article.findAndCountAll({
    attributes: ['id', 'title', 'createdAt', 'viewCount', 'likeCount', 'solvedId'],
    where: filter,
    include: [
      {
        model: Comment,
        attributes: ['id'],
      },
    ],
    offset, //开始的数据索引
    limit: pageSize,    //每页限制返回的数据条数
    order: [[orderKey, 'DESC']],
    row: true,
    distinct: true
  })
  ctx.body = { code: 200, ...data }
};

// 创建或更新问题
const createQuestion = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { id, title, content, courseId } = ctx.request.body;
  let data;
    
  if (id) {
    // 更新
    data = await Article.update(
      { title, content, userId, courseId },
      { where: { id: id } },
    );
    ctx.body = { code: 200, message: '成功更新问题', data: { id } };
  } else {
    // 新建
    data = await Article.create(
      { title, content, userId, courseId, isQ: 1, viewCount: 0, likeCount: 0, solvedId: 0, isPrivate: 0 },
    );
    ctx.body = { code: 200, message: '成功创建问题', data };
  }
};

// 查询问题
const getQuestionById = async (ctx) => {

  const id = ctx.params.id;
  let data = await Article.findOne({
      where: { id },
      include: [
          {
              model: Comment,
              attributes: ['id', 'userId', 'content', 'likeCount', 'createdAt'],
              include: [
                  {
                      model: Reply,
                      attributes: ['id', 'userId', 'content', 'createdAt'],
                      include: [{ model: User, as: 'user', attributes: ['username', 'avatar'] }]
                  },
                  { model: User, as: 'user', attributes: ['username', 'avatar'] },
                  { model: Like, attributes: ['userId'] },
              ]
          },
          {
              model: User,
              attributes: ['username', 'avatar'],
          },
          {
              model: Like,
              attributes: ['userId'],
          },
      ],
      order: [[Comment, 'createdAt', 'DESC']],
      row: true
  });

  if (data) {
    const userinfo = decodeToken(ctx);
    if (!(userinfo && data.userId === userinfo.userId)) { // 如果用户是作者，不增加阅读量
      data.viewCount++;
    }

    ctx.body = { code: 200, data };

    // 调用一次接口 阅读量+1
    if (!(userinfo && data.userId === userinfo.userId)) {
      await Article.increment(['viewCount'], {
        where: { id },
        by: 1,
      });
    }
  } else {
    ctx.body = { code: 404 };
  }
};

// 查询答案
const getAnswerList = async (ctx) => {
  let { page = 1, pageSize = 10, isHot, userId, liked } = ctx.query;
  let offset = (page - 1) * pageSize;
  
  let filter = {
    isA: 1,
    userId,
  };
  if (+liked === 1) filter.likeCount = { [Op.gte]: 1 };
  
  const existent = await Comment.findOne({ where: filter });
  if (!existent) {
    ctx.body = { code: 200, data: null };
    return;
  }

  const orderKey = +isHot === 1 ? 'likeCount' : 'createdAt';
  const answer = await Comment.findAll({
    where: filter,
    attributes: ['articleId'],
    order: [[orderKey, 'DESC']],
  });

  let id = answer[0].articleId;
  for (let i = 1; i < answer.length; ++i) {
    id += (' || ' + answer[i].articleId);
  }
  filter = {
    isQ: 1,
    id: id,
  };

  const data = await Article.findAndCountAll({
    attributes: ['title', 'courseId', 'isQ', 'solvedId', 'createdAt'],
    include: [
      {
        model: Comment,
        attributes: ['id', 'likeCount'],
        where: { userId },
      },
    ],
    where: filter,
    offset, //开始的数据索引
    limit: pageSize,    //每页限制返回的数据条数
    order: [['createdAt', 'DESC']],
    row: true,
    distinct: true
  });

  ctx.body = { code: 200, ...data };
};

// 点赞回答
const like = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { commentId } = ctx.request.body;

  const res = await Like.create(
    {userId, commentId },
  );
  if (Object.keys(res).length > 0) {
    const likeCount = await Like.count({ where: { commentId } });
    await Comment.update(
      { likeCount },
      { where: { id: commentId } },
    );
    ctx.body = { code: 200, message: '点赞成功', likeCount };
  } else {
    ctx.body = { code: 0, message: '点赞失败，请重试！' };
  }
};

// 取消点赞回答
const deleteLike = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const commentId = ctx.params.id;

  const res = await Like.destroy({
    where: { userId, commentId },
  });

  if (res) {
    const likeCount = await Like.count({ where: { commentId } });
    await Comment.update(
      { likeCount },
      { where: { id: commentId } },
    );
    ctx.body = { code: 200, message: '取消点赞成功', likeCount };
  } else {
    ctx.body = { code: 0, message: '取消点赞失败，请重试！' };
  }
};

// 查询某用户是否对某回答已赞
const isLiked = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { commentId } = ctx.request.body;
  
  const liked = await Like.findOne({ where: { userId, commentId } });
  ctx.body = { code: 200, data: { liked } };
};

// 采纳回答
const adopt = async (ctx) => {
  const { articleId, solvedId } = ctx.request.body;
  const data = await Article.update(
    { solvedId },
    { where: { id: articleId } },
  );
  if (data) {
    ctx.body = { code: 200, message: '采纳回答成功', data };
  } else {
    ctx.body = { code: 0, message: '采纳回答失败，请重试！' };
  }
};

// 取消采纳回答
const deleteAdopt = async (ctx) => {
  const articleId = ctx.params.id;
  const data = await Article.update(
    { solvedId: 0 },
    { where: { id: articleId } },
  );
  if (data) {
    ctx.body = { code: 200, message: '取消采纳回答成功', data };
  } else {
    ctx.body = { code: 0, message: '取消采纳回答失败，请重试！' };
  }
};

module.exports = {
  'GET /question/getList': getQuestionList,
  'GET /question/getSimpleList': getSimpleQuestionList,
  'POST /question/create': createQuestion,
  'GET /question/:id': getQuestionById,
  'GET /answer/getList': getAnswerList,
  'POST /answer/like': like,
  'DELETE /answer/deleteLike/:id': deleteLike,
  'POST /answer/isLiked': isLiked,
  'POST /answer/adopt': adopt,
  'DELETE /answer/deleteAdopt/:id': deleteAdopt,
};
