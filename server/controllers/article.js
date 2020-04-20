const fs = require('fs')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const model = require('../model');
let Article = model.Article;
let ArticleTag = model.ArticleTag;
let Comment = model.Comment;
let Reply = model.Reply;
let Like = model.Like;
let Tag = model.Tag;
let User = model.User;

const { decodeToken } = require('../lib/token')

//查询文章列表
const getArticleList = async (ctx) => {
    // 获取请求参数
    let { page = 1, pageSize = 10, title, tagId, courseId, userId, isHot, isPrivate } = ctx.query;

    // 计算filter
    let filter = {
        isQ: 0,
    };
    if (title) filter.title = { [Op.like]: `%${title}%` };
    if (courseId) filter.courseId = courseId;
    if (userId) filter.userId = userId;
    if (+isPrivate === 0 || +isPrivate === 1) filter.isPrivate = isPrivate;

    // 查询是否存在符合filter的项
    const existent = await Article.findOne({ where: filter });
    if (!existent) {
        ctx.body = { code: 200, data: null };
        return;
    }

    // 计算查询条件
    pageSize = parseInt(pageSize);
    const offset = (page - 1) * pageSize;
    const tagFilter = tagId ? { tagId } : {};
    const orderKey = +isHot === 1 ? 'likeCount' : 'createdAt';

    // 查询
    const data = await Article.findAndCountAll({
        where: filter,
        include: [
            {
                model: Comment,
                attributes: ['id'],
                include: [{ model: Reply, attributes: ['id'] }]
            },
            {
                model: ArticleTag,
                attributes: ['tagId'],
                where: tagFilter,
                include: [{ model: Tag, attributes: ['name'] }]
            },
            {
                model: User,
                attributes: ['username'],
            },
        ],
        offset,
        limit: pageSize,
        order: [[orderKey, 'DESC']],
        row: true,
        distinct: true
    });

    // 返回响应
    ctx.body = { code: 200, ...data };
};

// 获取文章详情
const getArticleById = async (ctx) => {
    const id = ctx.params.id;
    let data = await Article.findOne({
        where: { id },
        include: [
            {
                model: Comment,
                attributes: ['id', 'userId', 'content', 'createdAt'],
                include: [
                    {
                        model: Reply,
                        attributes: ['id', 'userId', 'content', 'createdAt'],
                        include: [{ model: User, as: 'user', attributes: ['username', 'avatar'] }]
                    },
                    { model: User, as: 'user', attributes: ['username', 'avatar'] }
                ]
            },
            {
                model: ArticleTag,
                attributes: ['tagId'],
                include: [{ model: Tag, attributes: ['name'] }]
            },
            {
                model: User,
                attributes: ['username', 'avatar'],
            },
            {
                model: Like,
                attributes: ['userId']
            },
        ],
        order: [[Comment, 'createdAt', 'DESC']],
        row: true
    });

    if (data) {
        ctx.body = { code: 200, data };
    } else {
        ctx.body = { code: 404 };
    }
};

// 创建或更新文章
const create = async (ctx) => {
    const { userId } = decodeToken(ctx);
    const { id, title, content, tags, courseId, isPrivate } = ctx.request.body;
    let data;
    
    const articleTags = tags ? tags.split(',').map(tagId => ({ tagId: tagId })) : '';
        
    if (id) {
        // 更新
        data = await Article.update(
            { title, content, userId, tagsList: tags, articleTags, courseId, isPrivate },
            { where: { id: id } },
        );
        if (articleTags) {
            await ArticleTag.destroy({where: { articleId: id }});
            for (let i = 0; i < articleTags.length; ++i) {
                await ArticleTag.create({
                    articleId: id,
                    tagId: articleTags[i].tagId,
                });
            }
        }
        ctx.body = { code: 200, message: '成功更新文章', data: { id } };
    } else {
        // 新建
        data = await Article.create(
            { title, content, userId, tagsList: tags, articleTags, courseId, likeCount: 0, isQ: 0, isPrivate, viewCount: 0, solvedId: 0 },
            { include: [ArticleTag] }
        );
        ctx.body = { code: 200, message: '成功创建文章', data };
    }
};


// 删除文章
const deleteArticle = async (ctx) => {
    const id = ctx.params.id;
    const data = await Article.destroy({ where: { id } });
    ctx.body = { code: 200, data };
};

// 点赞文章
const like = async (ctx) => {
    const { userId } = decodeToken(ctx);
    const { articleId } = ctx.request.body;

    const res = await Like.create(
        {userId, articleId },
    );
    if (Object.keys(res).length > 0) {
        const likeCount = await Like.count({ where: { articleId } });
        await Article.update(
            { likeCount },
            { where: { id: articleId } },
        );
        ctx.body = { code: 200, message: '点赞成功', likeCount };
    } else {
        ctx.body = { code: 0, message: '点赞失败，请重试！' };
    }
};

// 取消点赞文章
const deleteLike = async (ctx) => {
    const { userId } = decodeToken(ctx);
    const articleId = ctx.params.id;

    const res = await Like.destroy({
        where: { userId, articleId },
    });
    
    if (res) {
        const likeCount = await Like.count({ where: { articleId } });
        await Article.update(
            { likeCount },
            { where: { id: articleId } },
        );
        ctx.body = { code: 200, message: '取消点赞成功', likeCount };
    } else {
        ctx.body = { code: 0, message: '取消点赞失败，请重试！' };
    }
};

// 查询某用户是否对某文章已赞
const isLiked = async (ctx) => {
    const { userId } = decodeToken(ctx);
    const { articleId } = ctx.request.body;
    
    const liked = await Like.findOne({ where: { userId, articleId } });
    ctx.body = { code: 200, data: { liked } };
};

// 上传图片
const upLoadImg = async (ctx) => {
    const uploadUrl = "http://127.0.0.1:8086/images";
    const file = ctx.request.files.image;
    const path = file.path.split('\\')[2];
    const url = uploadUrl + `/${path}`;

    ctx.body = {
        code: 200,
        url,
    };
};

// 删除图片
const deleteImg = async (ctx) => {
    let { url } = ctx.request.body;
    url = url.split('/');
    const folderName = url[0],
        imgName = url[1];

    let path = `./public/${folderName}/${imgName}`;
    path = path.replace(/\//g, '\\');
    
    try {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            ctx.body = { code: 200, message: '删除图片成功' };
        } else {
            ctx.body = { code: 200, message: '图片路径错误' };
        }
    } catch (error) {
        ctx.body = { code: 200, message: '删除图片失败', error };
    }
};

module.exports = {
    'GET /article/getList': getArticleList,
    'GET /article/:id': getArticleById,
    'POST /article/create': create,
    'POST /article/like': like,
    'POST /article/isLiked': isLiked,
    'POST /article/img': upLoadImg,
    'POST /article/delImg': deleteImg,
    'DELETE /article/deleteLike/:id': deleteLike,
    'DELETE /article/delete/:id': deleteArticle,
};

