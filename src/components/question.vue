<template>
  <div class="question">
    <template v-if="questions && questions.length">
      <div v-for="(question ,index) in questionList" :key="index" class="question-item">
        <div v-if="question.comments" :class="`info ${question.solvedId ? 'actived' : ''}`">
          {{ question.comments.length }}
          <span>{{ question.solvedId ? '解决' : '回答' }}</span>
        </div>
        <div class="info">
          {{ question.viewCount }}
          <span>浏览</span>
        </div>
        <div class="info">
          {{ question.likeCount }}
          <span>赞</span>
        </div>
        <div class="content">
          <div v-if="question.user" class="desc">
            <div class="text">
              <span class="underline" @click="$router.push(`/u/${question.userId}`)">{{ question.user.username }}</span>
              {{ ' · 提问于' + getTime(question.createdAt) }}
            </div>
            <div class="attr">
              <CTag>{{ question.courseName }}</CTag>
            </div>
          </div>
          <div class="title">
            <router-link :to="`/question/${question.id}`">{{ question.title }}</router-link>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="empty">暂无内容！</div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import CTag from '../components/c-tag';
  import { getTime } from '../scripts/utils';

  export default {
    components: {
      CTag,
    },
    props: {
      questions: Array,
    },
    data () {
      return {
        getTime,
      };
    },
    computed: {
      ...mapState('course', [
        'courses',
      ]),
      questionList () {
        return this.questions.map(question => ({
          ...question,
          courseName: this.courses.find(course => course.id === question.courseId).name,
        }));
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.question {
  &-item {
    display: flex;
    align-items: flex-end;
    position: relative;
    border: 1px solid #ebedf0;
    padding: 8px 24px 14px;
    background: #fff;
    transition: all 0.2s linear;

    &:hover {
      background: rgba(217, 239, 236, 0.1);
      box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.05);
      transform: translate3d(0, -5px 0);
    }

    .info {
      width: 45px;
      height: 42px;
      display: inline-block;
      margin-right: 12px;
      border-radius: 3px;
      text-align: center;
      color: @primary-color;
      background: @lighter-green;
      border: 1px solid @light-green;

      span {
        display: block;
        font-size: 12px;
      }

      &.actived {
        color: #fff;
        background: @light-primary;
      }
    }

    .content {
      display: inline-block;
      width: calc(100% - 171px);

      .desc {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: @subsidiary-color;

        .text {
          margin-bottom: -6px;
        }
      }

      .title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        a {
          margin-right: 6px;
          color: @title-color;
          font-size: 16px;
          cursor: pointer;

          &:hover {
            color: @primary-color;
          }
        }
      }
    }
  }
}
</style>