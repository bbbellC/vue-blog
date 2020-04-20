<template>
  <div class="my">
    <div v-if="info" class="userinfo-block">
      <div class="img">
        <UserAvatar :url="info.avatar" size="2.5rem" />
        <div class="name">{{ info.username }}</div>
        <div v-if="isMe" class="btn-wrapper">
          <Button to="/setting">编辑个人资料</Button>
        </div>
      </div>
      <div class="info">
        <div v-if="info.major" class="info-item"><Icon type="md-school" />{{ info.major }}</div>
        <div class="info-item" :style="!info.major && 'margin-top: 1rem'"><Icon type="md-happy" />{{ info.message || `${info.username} 很懒，什么话都没有留下~` }}</div>
      </div>
    </div>
    <div class="my-content">
      <div class="menu-container">
        <div :class="`menu-item ${activedMenu === 0 ? 'actived' : ''}`" @click="() => { this.activedMenu = 0; }">主页</div>
        <div :class="`menu-item ${activedMenu === 1 ? 'actived' : ''}`" @click="() => { this.activedMenu = 1; }">文章</div>
        <div :class="`menu-item ${activedMenu === 2 ? 'actived' : ''}`" @click="() => { this.activedMenu = 2; }">回答</div>
        <div :class="`menu-item ${activedMenu === 3 ? 'actived' : ''}`" @click="() => { this.activedMenu = 3; }">提问</div>
      </div>
      <div class="content-container">
        <template v-if="activedMenu === 0">
          <div class="ways-container">
            技术属性
          </div>
          <div class="attribute">
            <template v-if="chartData.rows.length">
              <VeRing :data="chartData" :settings="chartSettings" :extend="chartExtend" :legend-visible="false" width="350px" height="250px" />
              <div class="color-container">
                <div v-for="(item, index) in chartData.rows" :key="index" class="item">
                  <span :style="`background:${chartExtend.color[index]}`" />{{ item.label }}
                </div>
              </div>
            </template>
            <div v-else class="empty">新手一枚，暂无技术属性~！</div>
          </div>
          <div class="ways-container">
            高分内容
          </div>
          <Loading v-if="loading" />
          <template v-else-if="hotList.length">
            <div v-for="(item, index) in hotList" :key="index">
              <SimpleArticle v-if="item.isQ === 0" :articles="item" :show-tip="true" />
              <SimpleQuestion v-else-if="item.isQ === 1" :questions="item" :is-a="true" :show-tip="true" />
              <SimpleQuestion v-else :questions="item" :show-tip="true" />
            </div>
          </template>
          <div v-else class="empty">暂无内容~</div>
        </template>
        <template v-if="activedMenu === 1">
          <div class="ways-container">
            文章
            <div class="right">
              <span :class="`btn ${articleWay === 0 ? 'actived' : ''}`" @click="handleArticle(0)">最新</span>
              <Divider type="vertical" />
              <span :class="`btn ${articleWay === 1 ? 'actived' : ''}`" @click="handleArticle(1)">热门</span>
            </div>
          </div>
          <Loading v-if="loading" />
          <template v-else>
            <SimpleArticle :articles="articleList" />
            <Page v-if="articleTotal > 10" :total="articleTotal" :current="curArticlePage" show-elevator class="pagination"  @on-change="handleArticlePage" />
          </template>
        </template>
        <template v-if="activedMenu === 2">
          <div class="ways-container">
            回答
            <div class="right">
              <span :class="`btn ${answerWay === 0 ? 'actived' : ''}`" @click="() => { this.answerWay = 0; }">最新</span>
              <Divider type="vertical" />
              <span :class="`btn ${answerWay === 1 ? 'actived' : ''}`" @click="() => { this.answerWay = 1; }">热门</span>
            </div>
          </div>
          <Loading v-if="loading" />
          <template v-else>
            <SimpleQuestion :questions="answerList" :is-a="true" />
            <Page v-if="answerTotal > 10" :total="answerTotal" :current="curAnswerPage" show-elevator class="pagination"  @on-change="handleAnswerPage" />
          </template>
        </template>
        <template v-if="activedMenu === 3">
          <div class="ways-container">
            提问
            <div class="right">
              <span :class="`btn ${questionWay === 0 ? 'actived' : ''}`" @click="() => { this.questionWay = 0; }">最新</span>
              <Divider type="vertical" />
              <span :class="`btn ${questionWay === 1 ? 'actived' : ''}`" @click="() => { this.questionWay = 1; }">热门</span>
            </div>
          </div>
          <Loading v-if="loading" />
          <template v-else>
            <SimpleQuestion :questions="questionList" />
            <Page v-if="questionTotal > 10" :total="questionTotal" :current="curQuestionPage" show-elevator class="pagination"  @on-change="handleQuestionPage" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import jwt from 'jsonwebtoken';
  import SimpleQuestion from '../components/simple-question';
  import SimpleArticle from '../components/simple-article';
  import Loading from '../components/loading';
  import UserAvatar from '../components/user-Avatar';
  import VeRing from 'v-charts/lib/ring.common';

  export default {
    components: {
      SimpleQuestion,
      SimpleArticle,
      Loading,
      UserAvatar,
      VeRing,
    },
    data () {
      return {
        info: {},
        hotList: [],
        articleList: [],
        articleTotal: 0,
        curArticlePage: 1,
        articleWay: 0,
        answerList: [],
        answerTotal: 0,
        curAnswerPage: 1,
        answerWay: 0,
        questionList: [],
        questionTotal: 0,
        curQuestionPage: 1,
        questionWay: 0,
        activedWay: 0,
        activedMenu: 0,
        loading: false,
        chartSettings: {
          radius: [30, 70],
          offsetY: 120
        },
        chartData: {
          columns: ['label', 'value'],
          rows: [
            // { label: 1, value: 2 },
            // { label: 2, value: 2 },
            // { label: 3, value: 2 },
            // { label: 4, value: 2 },
          ],
        },
        chartExtend: {
          color: ['#eea6b7', '#d2565c', '#607d68', '#b2cf87', '#e2c027', '#dc9123', '#158bb8', '#8abcd1' ],
        },
      };
    },
    computed: {
      ...mapState('user', ['userInfo']),
      ...mapState('tags', ['tags']),
      ...mapState('course', ['courses']),
      userId () {
        return +this.$route.params.id;
      },
      curUserId () {
        return this.userInfo && Object.keys(this.userInfo).length ? jwt.decode(this.userInfo.token).userId : '';
      },
      isMe () {
        return this.userId === this.curUserId;
      },
    },
    watch: {
      articleWay () {
        this.fetchArticleList();
      },
      answerWay () {
        this.fetchAnswerList();
      },
      questionWay () {
        this.fetchQuestionList();
      },
    },
    async mounted () {
      this.initAttrbutes();
      this.fetchArticleList();
      this.fetchQuestionList();
      this.fetchAnswerList();
      this.fetchHot();
    },
    methods:{
      ...mapActions('article', [
        'getActicleList',
      ]),
      ...mapActions('question', [
        'getQuestionList',
        'getSimpleQuestionList',
        'getAnswerList',
      ]),
      ...mapActions('user', [
        'getAttributes',
      ]),
      async fetchHot() {
        this.loading = true;
        let params = { page: 1, userId: this.userId, isHot: true };
        if (!this.isMe) params.isPrivate = 0;

        let { rows } = await this.getActicleList(params);
        if (rows) rows = rows.filter(item => item.likeCount);

        let q = await this.getSimpleQuestionList({
          page: 1,
          userId: this.userId,
          type: 'hot',
          liked: 1,
        });
        if (q.rows) {
          rows.push(...q.rows);
        }

        let a = await this.getAnswerList({
          page: 1,
          userId: this.userId,
          isHot: 1,
          liked: 1,
        });
        if (a.rows) {
          rows.push(...a.rows);
        }

        if (rows && rows.length > 10) rows.length = 10;
        if (rows) rows.sort((r1, r2) => r2.likeCount - r1.likeCount);

        this.hotList = rows || [];
        this.loading = false;
      },
      async fetchArticleList(page = 1) {
        this.loading = true;
        let params = {
          page,
          userId: this.userId,
          isHot: this.articleWay === 1 ? 1 : 0,
        };
        if (!this.isMe) params.isPrivate = 0;

        const { rows, count } = await this.getActicleList(params);
        if (rows) rows.forEach(item => {
          // let index = item.content.indexOf('<!--more-->');
          // item.description = translateMarkdown(item.content.slice(0, index));
          item.commentsCount = this.getCommentsCount(item.comments);
        });
        this.articleList = rows || [];
        this.articleTotal = count || 0;
        this.loading = false;
      },
      async fetchAnswerList (page = 1) {
        this.loading = true;
        const { rows, count } = await this.getAnswerList({
          page,
          userId: this.userId,
          isHot: this.answerWay === 1 ? 1 : 0,
        });
        this.answerList = rows || [];
        this.answerTotal = count || 0;
        this.loading = false;
      },
      async fetchQuestionList(page = 1) {
        this.loading = true;
        const type = this.questionWay === 0 ? 'new' : 'hot';
        const { rows, count } = await this.getSimpleQuestionList({
          page,
          userId: this.userId,
          type,
        });
        this.questionList = rows || [];
        this.questionTotal = count || 0;
        this.loading = false;
      },
      async initAttrbutes () {
        const { data } = await this.getAttributes({ id: this.userId });
        this.info = data.info;

        const tags = data.tag, courses = data.course;
        let rows = [];
        for (let id in tags) {
          const name = this.tags.find(tag => tag.id === +id).name;
          rows.push({ label: name, value: tags[id] });
        }
        for (let id in courses) {
          const name = this.courses.find(course => course.id === +id).name;
          rows.push({ label: name, value: courses[id] });
        }
        if (rows.length > 8) rows.length = 8;
        this.chartData.rows.push(...rows);
      },
      getCommentsCount (commentList) {
        let count = commentList.length;
        commentList.forEach(item => {
          count += item.replies.length
        });
        return count;
      },
      handleToggle (type) {
        switch (type) {
          case 'article': {
            this.activedWay = 0;
            break;
          }
          case 'question': {
            this.activedWay = 1;
            break;
          }
        }
      },
      handleArticle (type) {
        this.articleWay = type;
      },
      handleArticlePage  (val) {
        this.curArticlePage = val;
        this.fetchArticleList(val);
      },
      handleAnswerPage  (val) {
        this.curAnswerPage = val;
        this.fetchAnswerList(val);
      },
      handleQuestionPage  (val) {
        this.curQuestionPage = val;
        this.fetchQuestionList(val);
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.my {
  height: calc(100% - 60px);
  padding: 2rem 0;
  margin: 0 auto;

  .userinfo-block {
    overflow: hidden;
    padding: 20px 4rem 20px 40px;
    margin-bottom: 20px;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: @box-shadow;

    .img {
      float: left;
      display: flex;
      align-items: center;

      .icon-user {
        // margin-right: 0;
      }

      .name {
        display: inline-block;
        margin-right: 1rem;
        font-size: 30px;
      }
    }

    .info {
      float: right;
      margin-top: 6px;
      text-align: right;
      
      &-item {
        margin-bottom: 6px;
        text-overflow: ellipsis;

        i {
          padding-right: 6px;
          color: #637a7b;
        }
      }
    }

    .btn-wrapper {
      float: left;
      margin-left: 1rem;
    }
  }

  &-content {
    display: flex;
    padding: 2rem 4rem 4rem 0;
    margin-bottom: 2rem;
    background: #fff;

    .menu-container {
      display: inline-block;
      width:20%;
      padding: 0 2rem 0 1rem;
      transition: all .4s linear;

      .menu-item {
        height: 34px;
        line-height: 34px;
        padding: 0 1rem;
        // border-radius: 4px;
        cursor: pointer;

        &:hover {
          color: @primary-color;
          background: @lightest-green;
        }
        &.actived {
          border-left: 2px solid @dark-green;
          color: @primary-color;
          background: @lighter-green;
        }
      }
    }

    .content-container {
      display: inline-block;
      width: 80%;
    }
  }

  .attribute {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
    border: 1px solid #ebedf0;

    .color-container{
      margin: auto 0;
      margin-left: 3rem;

      .item {
        display: inline-block;
        width: 50%;
        margin-bottom: 1rem;
      }

      span {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-right: 5px;
      }
    }
  }


  .toolbox {
    margin-bottom: 2rem;
  }

  .empty {
    margin: 2rem 0;
    text-align: center;
  }
}

@media (min-width: 768px) {
  .my {
    width: 600px;
  }
}
@media (min-width: 992px) {
  .my {
    width: 800px;
  }
}
@media (min-width: 1200px) {
  .my {
    width: 1140px;
  }
}
</style>
