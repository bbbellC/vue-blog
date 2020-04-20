<template>
  <div class="course-detail">
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem to="/courses">课程</BreadcrumbItem>
        <BreadcrumbItem :to="`/course/${id}`">{{ name }}</BreadcrumbItem>
      </Breadcrumb>
      <Tabs type="card" @on-click="onTabClick">
        <TabPane label="问答">
          <Loading v-if="loading" />
          <template v-else>
            <div class="ways-container">
              <span :class="`btn ${questionWay === 0 ? 'actived' : ''}`" @click="() => { this.questionWay = 0; }">最新问答</span>
              <Divider type="vertical" />
              <span :class="`btn ${questionWay === 1 ? 'actived' : ''}`" @click="() => { this.questionWay = 1; }">热门问答</span>
              <Divider type="vertical" />
              <span :class="`btn ${questionWay === 2 ? 'actived' : ''}`" @click="() => { this.questionWay = 2; }">等待回答</span>
            </div>
            <Question :questions="questionList" />
          </template>
          <Page v-if="questionTotal > 10" :total="questionTotal" :current="questionCurrentPage" show-elevator class="pagination" @on-change="handleQuestionPage" />
        </TabPane>
        <TabPane label="文章">
          <Loading v-if="loading" />
          <template v-else>
            <div class="ways-container">
              <span :class="`btn ${articleWay === 0 ? 'actived' : ''}`" @click="() => { this.articleWay = 0; }">热门</span>
              <Divider type="vertical" />
              <span :class="`btn ${articleWay === 1 ? 'actived' : ''}`" @click="() => { this.articleWay = 1; }">最新</span>
            </div>
            <Article :articles="articleList" />
          </template>
          <Page v-if="articleTotal > 10" :total="articleTotal" :current="articleCurrentPage" show-elevator class="pagination" />
        </TabPane>
        <Button v-if="createType === 0" @click="$router.push('/question/create')" type="primary" slot="extra">提问题</Button>
        <Button v-else @click="$router.push('/article/create')" type="primary" slot="extra">写文章</Button>
      </Tabs>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import Question from '../components/question';
  import Article from '../components/article';
  import Loading from '../components/loading';

  export default {
    components: {
      Question,
      Article,
      Loading,
    },
    data () {
      return {
        loading: false,
        articleList: [],
        articleTotal: 0,
        articleCurrentPage: 1,
        questionList: [],
        questionTotal: 0,
        questionCurrentPage: 1,
        questionWay: 0,
        articleWay: 0,
        createType: 0,
      };
    },
    computed: {
      ...mapState('course', [
        'courses',
      ]),
      id () {
        return +this.$route.params.id;
      },
      name () {
        const course = this.courses.find(item => +item.id === this.id);
        return course ? course.name : '';
      },
    },
    watch: {
      questionWay () {
        this.fetchQuestionList();
      },
      articleWay () {
        this.fetchArticleList();
      },
    },
    mounted () {
      this.fetchArticleList();
      this.fetchQuestionList();
    },
    methods: {
      ...mapActions('article', [
        'getActicleList',
      ]),
      ...mapActions('question', [
        'getQuestionList',
      ]),
      async fetchArticleList(page = 1) {
        this.loading = true;
        const { rows, count } = await this.getActicleList({
          page,
          courseId: this.id,
          isHot: this.articleWay === 0 ? 1 : 0,
        });
        rows && rows.forEach(item => {
          item.description = '';
          item.commentsCount = this.getCommentsCount(item.comments);
        });
        this.articleList = rows;
        this.articleTotal = count;
        this.loading = false;
      },
      getCommentsCount (commentList) {
        let count = commentList.length;
        commentList.forEach(item => {
          count += item.replies.length
        });
        return count;
      },
      async fetchQuestionList(page = 1) {
        this.loading = true;
        const type = this.questionWay === 0 ? 'new' : ( this.questionWay === 1 ? 'hot' : 'un' );
        const { rows, count } = await this.getQuestionList({
          page,
          type,
          courseId: this.id,
        });
        this.questionList = rows;
        this.questionTotal = count;
        this.loading = false;
      },
      onTabClick (name) {
        this.createType = name;
      },
      handleQuestionPage (val) {
        this.questionCurrentPage = val;
        this.fetchQuestionList(val);
      },
      handleArticlePage (val) {
        this.articleCurrentPage = val;
        this.fetchArticleList(val);
      },
    },
  };
</script>

<style lang="less">
.course-detail {
  height: 100%;
  background: #fff;

  .container {
    margin: 2px auto 0;
    padding: 2rem 0;
  }

  @media (min-width: 768px) {
    .container  {
      width: 600px;
    }
  }
  @media (min-width: 992px) {
    .container  {
      width: 800px;
    }
  }
  @media (min-width: 1200px) {
    .container  {
      width: 1140px;
    }
  }

  .ivu-tabs {
    margin-top: 1.5rem;
  }
}
</style>