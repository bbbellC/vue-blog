const { decodeToken } = require('../lib/token')
const model = require('../model');
let Article = model.Article;
let Comment = model.Comment;
let Reply = model.Reply;
let User = model.User;

// 查询某文章下的所有评论
const getCommentList = async articleId =>
  Comment.findAndCountAll({
    where: { articleId },
    attributes: ['id', 'userId', 'content', 'createdAt'],
    include: [
      {
        model: Reply,
        attributes: ['id', 'userId', 'content', 'createdAt'],
        include: [{ model: User, as: 'user', attributes: ['username', 'avatar'] }]
      },
      { model: User, as: 'user', attributes: ['username', 'avatar'] }
    ],
    order: [['createdAt', 'DESC']]
  })

// 创建评论
const createComment = async (ctx) => {
  const { userId } = decodeToken(ctx)
  const { id, articleId, content, isA } = ctx.request.body

  if (id) {
    // 更新
    const ok = await Comment.update(
      { content },
      { where: { id } },
    );
    if (ok) {
      const data = await getCommentList(articleId)
      ctx.body = { code: 200, message: 'success', ...data }
    } else ctx.body = { code: 0, message: '更新失败' };
  } else {
    // 新建
    await Comment.create({ userId, articleId, content, isA })
    const data = await getCommentList(articleId)
    ctx.body = { code: 200, message: 'success', ...data }
  }
};

// 创建回复
const createReply = async (ctx) => {
  const { userId } = decodeToken(ctx)
  const { id, articleId, content, commentId } = ctx.request.body

  if (id) {
    // 更新
    const ok = await Reply.update(
      { content },
      { where: { id } },
    );
    if (ok) {
      const data = await getCommentList(articleId);
      ctx.body = { code: 200, message: 'success', ...data };
    } else ctx.body = { code: 0, message: '更新失败' };
  } else {
    // 新建
    await Reply.create({ userId, articleId, content, commentId })
    const data = await getCommentList(articleId)
    ctx.body = { code: 200, message: 'success', ...data }
  }
}

// 删除评论
const deleteComment = async (ctx) => {
  const id = ctx.params.id;
  const comment = await Comment.findOne({where: { id }, raw: true });
  if (comment.isA) {
    const { solvedId } = await Article.findOne({
      attributes: ['solvedId'],
      where: { id: comment.articleId },
      raw: true,
    });
    if (solvedId === id) {
      await Article.update(
        { solvedId: 0 },
        { where: { id: comment.articleId } },
      );
    }
  }
  const ok = await Comment.destroy({ where: { id } });
  const data = await getCommentList(comment.articleId)
  if (ok) ctx.body = { code: 200, message: '删除成功', ...data }
  else ctx.body = { code: 0, message: '删除失败'}
};
// 删除回复
const deleteReply = async (ctx) => {
  const id = ctx.params.id;
  const reply = await Reply.findOne({ where: { id }, raw: true });
  const comment = await Comment.findOne({ where: { id: reply.commentId }, raw: true });
  const articleId = comment.articleId;

  const ok = await Reply.destroy({ where: { id } })
  console.log('id', id)

  const data = await getCommentList(articleId)

  if (ok) ctx.body = { code: 200, message: '删除成功', ...data }
  else ctx.body = { code: 0, message: '删除失败'}
};

const getAboutComments = async (ctx) => {
  const data = await getCommentList(0)
  ctx.body = { code: 200, ...data }
}

module.exports = {
    'POST /comment': createComment,
    'DELETE /comment/delete/:id': deleteComment,
    'POST /reply': createReply,
    'DELETE /reply/delete/:id': deleteReply,
    'GET /comment/about': getAboutComments
    //'GET /comment/getList': getArticleList,
};

