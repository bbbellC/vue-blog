<template>
  <div class="my-blog">
    <div class="toolbox">
      <div class="search-container">
        <Form ref="searchForm" :model="searchForm" :label-width="40" inline>
          <FormItem label="标题" prop="title" class="flex">
            <Input v-model="searchForm.title" placeholder="请输入文章标题关键字.." @on-blur="fetchList(1)" @on-enter="fetchList(1)" />
            <div class="btn-container">
              <Button type="text" @click="onReset" style="margin-left: 8px">重置</Button>
              <Button type="primary" @click="fetchList(1)">搜索</Button>
            </div>
          </FormItem>
          <FormItem label="标签" prop="tagId">
            <Select v-model="searchForm.tagId" filterable @on-change="fetchList(1)">
              <Option v-for="tag in tagsList" :value="tag.id" :key="tag.id">{{ tag.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="课程" prop="courseId" style="margin-right: 0;">
            <Select v-model="searchForm.courseId" filterable @on-change="fetchList(1)">
              <Option v-for="course in coursesList" :value="course.id" :key="course.id">{{ course.name }}</Option>
            </Select>
          </FormItem>
        </Form>
      </div>
    </div>
    <div class="ways-container">
      <span :class="`btn ${activedWay === 0 ? 'actived' : ''}`" @click="handleHot">热门</span>
      <Divider type="vertical" />
      <span :class="`btn ${activedWay === 1 ? 'actived' : ''}`" @click="handleNew">最新</span>
    </div>
    <Loading v-if="loading" />
    <template v-else-if="total">
      <Article :articles="list" />
      <Page v-if="total > 10" :total="total" :current="currentPage" show-elevator class="pagination" @on-change="handlePage" />
    </template>
    <div v-else class="empty">暂无文章！</div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import jwt from 'jsonwebtoken';
  import Article from '../components/article';
  import Loading from '../components/loading';
  // import { translateMarkdown } from '../scripts/utils';

  export default {
    components: {
      Article,
      Loading,
    },
    data () {
      return {
        list: [],
        total: 0,
        currentPage: 1,
        loading: false,
        searchForm: {
          title: '',
          tagId: 0,
          courseId: 0,
        },
        activedWay: 0,
      };
    },
    computed: {
      ...mapState('user', ['userInfo']),
      ...mapState('tags', [
        'tags',
        'cates',
      ]),
      ...mapState('course', [
        'courses',
      ]),
      userId () {
        const { userId } = jwt.decode(this.userInfo.token);
        return userId;
      },
      tagsList () {
        const list = [...this.tags];
        list.unshift({
          id: 0,
          name: '全部',
        });
        return list;
      },
      coursesList () {
        const list = [...this.courses];
        list.unshift({
          id: 0,
          name: '全部',
        });
        return list;
      },
    },
    watch: {
      activedWay () {
        this.fetchList();
      },
    },
    async mounted () {
      this.fetchList();
    },
    methods:{
      ...mapActions('article', [
        'getActicleList',
      ]),
      async fetchList(page = 1) {
        this.loading = true;
        const { rows, count } = await this.getActicleList({
          page,
          title: this.searchForm.title,
          courseId: this.searchForm.courseId === 0 ? '' : this.searchForm.courseId,
          tagId: this.searchForm.tagId === 0 ? '' : this.searchForm.tagId,
          isHot: this.activedWay === 0 ? 1 : 0,
          isPrivate: 0,
        });
        rows && rows.forEach(item => {
          item.description = '';
          item.commentsCount = this.getCommentsCount(item.comments);
        });
        this.list = rows;
        this.total = count;
        this.loading = false;
      },
      getCommentsCount (commentList) {
        if (!commentList) return 0;
        let count = commentList.length;
        commentList.forEach(item => {
          if (item.replies) count += item.replies.length
        });
        return count;
      },
      handlePage (val) {
        this.currentPage = val;
        this.fetchList(val);
      },
      onReset () {
        this.searchForm = {
          title: '',
          tagId: 0,
          courseId: 0,
        }
        this.fetchList();
      },
      handleHot () {
        this.activedWay = 0;
      },
      handleNew () {
        this.activedWay = 1;
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.my-blog {
  margin: 8px auto 5rem;
  background: #fff;

  .toolbox {
    .search-container {
      padding: 32px 0 16px;

      .flex {
        width: 100% !important;

        .ivu-form-item-content {
          display: flex;

          .ivu-input-wrapper  {
            flex: 1;
          }
        }
      }

      .ivu-form-inline .ivu-form-item {
        width: calc(50% - 10px);
        margin-right: 20px;
      }
    }
  }
}

@media (min-width: 768px) {
    .my-blog {
      width: 600px;
    }
  }
  @media (min-width: 992px) {
    .my-blog {
      width: 800px;
    }
  }
  @media (min-width: 1200px) {
    .my-blog {
      width: 1140px;
    }
  }
</style>
