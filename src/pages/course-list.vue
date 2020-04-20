<template>
  <div class="course-list">
    <h3>课程问答
      <Button size="small" class="btn" @click="onToggleClick"><Icon type="ios-arrow-forward" :style="showCourses ? 'transform: rotate(90deg)' : ''" />
        {{ showCourses ? '收起' : '展开' }}全部课程
      </Button>
    </h3>
    <template v-if="showCourses">
      <div v-for="(major, mIdx) in majors" :key="mIdx" class="item">
        <Divider orientation="left">{{ major.name }}</Divider>
        <div v-for="(course, tidx) in courses.filter(item => item.majorId === major.id)" :key="tidx" class="tags">
          <CTag :color="tagColors[3]" @click.native="goToDetail(course.id)">{{ course.name }}</CTag>
        </div>
      </div>
    </template>
    <div class="ways-container">
      <span :class="`btn ${activedWay === 0 ? 'actived' : ''}`" @click="handleNew">最新问答</span>
      <Divider type="vertical" />
      <span :class="`btn ${activedWay === 1 ? 'actived' : ''}`" @click="handleHot">热门问答</span>
      <Divider type="vertical" />
      <span :class="`btn ${activedWay === 2 ? 'actived' : ''}`" @click="handleUn">等待回答</span>
      <Button @click="$router.push('/question/create')" type="primary">提问题</Button>
    </div>
    <Question :questions="questionList" />
    <Page v-if="questionTotal > 10" :total="questionTotal" :current="questionCurrentPage" show-elevator class="pagination" @on-change="handleQuestionPage" />
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import CTag from '../components/c-tag';
  import Question from '../components/question';
  import { tagColors } from '../scripts/data';

  export default {
    components: {
      CTag,
      Question,
    },
    data () {
      return {
        loading: false,
        tagColors,
        tagList: [],
        questionList: [],
        questionTotal: 0,
        questionCurrentPage: 1,
        activedWay: 0,
        showCourses: false,
      };
    },
    computed: {
      ...mapState('course', [
        'majors',
        'courses',
      ]),
    },
    watch: {
      activedWay () {
        this.fetchQuestionList();
      },
    },
    mounted () {
      this.getAllMajors();
      this.fetchQuestionList();
    },
    methods: {
      ...mapActions('course', [
        'getAllMajors',
      ]),
      ...mapActions('question', [
        'getQuestionList',
      ]),
      goToDetail (id) {
        this.$router.push(`/course/${id}`);
      },
      async fetchQuestionList(page = 1) {
        this.loading = true;
        const type = this.activedWay === 0 ? 'new' : ( this.activedWay === 1 ? 'hot' : 'un' );
        const { rows, count } = await this.getQuestionList({
          page,
          type,
        });
        this.questionList = rows;
        this.questionTotal = count;
        this.loading = false;
      },
      handleNew () {
        this.activedWay = 0;
      },
      handleHot () {
        this.activedWay = 1;
      },
      handleUn () {
        this.activedWay = 2;
      },
      onToggleClick () {
        this.showCourses = !this.showCourses;
      },
      handleQuestionPage (val) {
        this.questionCurrentPage = val;
        this.fetchQuestionList(val);
      },
    },
  };
</script>

<style lang="less">
.course-list {
  margin: 8px auto 0;
  padding: 2rem 0;
  background: #fff;

  h3 {
    font-size: 24px;
    font-weight: 500;

    button {
      margin-left: 12px;

      &:focus {
        box-shadow: none;
      }
    }

    i {
      transition: all .2s linear;
    }
  }

  .item {
    margin-top: 2rem;

    .tags {
      margin-bottom: 5px;
    }
  }

  .tags {
    display: inline-block;
    margin-right: 5px;

    .c-tag {
      cursor: pointer;
    }
  }

  .ways-container {
    overflow: hidden;
    margin-top: 2rem;

    button {
      float: right;
    }
  }
}

@media (min-width: 768px) {
    .course-list {
      width: 600px;
    }
  }
  @media (min-width: 992px) {
    .course-list {
      width: 800px;
    }
  }
  @media (min-width: 1200px) {
    .course-list {
      width: 1140px;
    }
  }
</style>