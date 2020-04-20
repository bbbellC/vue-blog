const model = require('../model');
let Draft = model.Draft;
const { decodeToken } = require('../lib/token');

// 创建或更新草稿
const draft = async (ctx) => {
  const { userId } = decodeToken(ctx);
  const { id, title, content, courseId, tags, isPrivate } = ctx.request.body;
  let data;
  
  if (id) {
    // 更新
    data = await Draft.update(
      { title, content, userId, tagsList: tags, courseId, isPrivate },
      { where: { id: id } },
    );
    ctx.body = { code: 200, message: '存草稿成功' };
  } else {
    // 新建
    data = await Draft.create(
      { title, content, userId, tagsList: tags, courseId, isPrivate },
    );
    ctx.body = { code: 200, message: '存草稿成功', data: { id: data.id }};
  }
};

// 删除草稿
const deleteDraft = async (ctx) => {
  const id = ctx.params.id;
  const data = await Draft.destroy({
    where: { id },
  });
  ctx.body = { code: 200, data };
};

// 获取草稿详情
const getDraftById = async (ctx) => {
  const id = ctx.params.id
  const data = await Draft.findOne({
    where: { id },
    row: true
  })
  ctx.body = { code: 200, data }
};

//查询草稿列表
const getDraftList = async (ctx) => {
  let { page = 1, pageSize = 10 } = ctx.query;
  let offset = (page - 1) * pageSize;
  pageSize = parseInt(pageSize);

  let filter = {};
  const { userId } = decodeToken(ctx);
  if (userId) filter.userId = userId;

  const data = await Draft.findAndCountAll({
    where: filter,
    offset,
    limit: pageSize,
    order: [['createdAt', 'DESC']],
    row: true,
  })
  ctx.body = { code: 200, ...data }
};

module.exports = {
  'GET /draft/getList': getDraftList,
  'GET /draft/:id': getDraftById,
  'POST /draft': draft,
  'DELETE /draft/delete/:id': deleteDraft,
};
