import marked from 'marked';
import hljs from 'highlight.js';

// 转化 md 语法为 html
export const translateMarkdown = plainText => {
  //return marked(xss(plainText), {
  return marked(plainText, {
    renderer: new marked.Renderer(),
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    },
  });
};

export const getTime = createdAt => {
  const cur = new Date();
  const curYear = cur.getFullYear(),
    curMonth = cur.getMonth() + 1,
    curDate = cur.getDate();

  const date = createdAt.slice(0, 10).split('-');
  const time = createdAt.slice(11, 16);
  date[1] = clearZero(date[1]);
  date[2] = clearZero(date[2]);

  let ret = '';
  if (+date[0] !== +curYear) {
    ret += `${date[0]}年`;
  }
  if (+date[1] === curMonth && +date[2] === curDate) {
    ret += `今天 ${time}`;
  } else {
    ret += `${date[1]}月`;
    ret += `${date[2]}日`;
  }
  return ret;
};

function clearZero (time) {
  if (+time[0] === 0) time = time[1];
  return time;
}