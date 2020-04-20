const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const model = require('../model');
let Course = model.Course;
let Major = model.Major;

// 获取课程列表
const getCourses = async (ctx) => {
  const data = await Course.findAll({
    attributes: ['name', 'id', 'majorId'],
    group: 'name',
  });
  ctx.body = { code: 200, data };
};

// 搜索课程
const getCourseByName = async (ctx) => {
  const { name } = ctx.query;
  const filter = {
    name: { [Op.like]: `%${name}%` },
  };

  const data = await Course.findAll({
    where: filter,
    raw: true,
  });

  ctx.body = { code: 200, data };
};

// 获取专业列表
const getMajors = async (ctx) => {
  const data = await Major.findAll({
    attributes: ['name', 'id'],
    group: 'name',
  });
  ctx.body = { code: 200, data };
};



module.exports = {
  'GET /courses/getList': getCourses,
  'GET /courses/query': getCourseByName,
  'GET /majors/getList': getMajors,
};

