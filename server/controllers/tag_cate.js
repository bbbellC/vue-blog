const model = require('../model');
const { sequelize } = require('../db');
let Article = model.Article;
let Tag = model.Tag;

// 获取tags列表
const getTags = async (ctx) => {
  const data = await Tag.findAll({
    attributes: ['name', 'id', [sequelize.fn('COUNT', sequelize.col('name')), 'count']],
    group: 'name'
  })
  ctx.body = { code: 200, data }
};

// 搜索标签
const getTagByName = async (ctx) => {
  const { name } = ctx.query;
  const filter = {
    name: { [Op.like]: `%${name}%` },
  };

  const data = await Tag.findAll({
    where: filter,
    raw: true,
  });

  ctx.body = { code: 200, data };
};

// 通过标签获取该标签的所有文章
const getArticlesByTag = async (ctx) => {
  let { page = 1, pageSize = 15, name } = ctx.query,
    offset = (page - 1) * pageSize
  pageSize = parseInt(pageSize)
  const data = await Article.findAndCountAll({
    attributes: ['id', 'title', 'createdAt'],
    include: [{ model: Tag, attributes: ['name'], where: { name } }],
    offset,
    limit: pageSize,
    order: [['createdAt', 'DESC']],
    distinct: true
  })
  ctx.body = { code: 200, ...data }
}

module.exports = {
  'GET /tags/getList': getTags,
  'GET /tags/query': getTagByName,
  'GET /tags/getArticles': getArticlesByTag,
};

