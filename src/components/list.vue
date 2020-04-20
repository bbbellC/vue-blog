<template>
  <div class="article-list">
    <template v-if="list.length">
      <div v-for="(item, index) in list" :key="index" class="item">
        <Divider orientation="left">
          <router-link class="title" :to="`/${item.isQ ? 'question' : 'article'}/${item.id}`">{{ item.title }}</router-link>
          <span class="time">{{ item.createdAt.slice(0,10) }}</span>
        </Divider>
        <div class="description article-md" v-html="item.description" />
        <InfoBox
          :like-count="item.likeCount"
          :comments-count="item.commentsCount"
          :tag="item.articleTags"
          :course-id="item.courseId" />
      </div>
    </template>
    <div v-else class="empty">
      暂无内容!
    </div>
  </div>
</template>

<script>
  import InfoBox from './info-box';
  import { tagColors } from '../scripts/data';

  export default {
    components: {
      InfoBox,
    },
    data () {
      return {
        tagColors,
      };
    },
    props: {
      list: Array,
    },
  };
</script>

<style lang="less">
@family: "Operator Mono", "Ubuntu", "Roboto", "Open Sans", "Microsoft YaHei", sans-serif;
@titleColor: #6b7e80;

.article-list {
  background: #fff;

  .item {
    position: relative;
    border: 1px solid #ebedf0;
    padding: 16px 24px;
    // margin-bottom: 10px;
    transition: all 0.2s linear;

    &:hover {
      background: rgba(217, 239, 236, 0.2);
      box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.1);
      transform: translate3d(0, -5px 0);
    }

    .title {
      color: @titleColor;
      // font-size: 1.4rem;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      cursor: pointer;
      &:hover {
        color: #00707a;
      }
    }

    .time {
      margin-left: 12px;
      font-size: 14px;
      font-weight: 500;
      color: @titleColor;
    }

    .description {
      // padding: 15px 10px;
      cursor: pointer;
      max-height: 260px;
      overflow: hidden;
    }

    .list-item-action {
      vertical-align: middle;
      margin-top: 10px;
      color: rgba(0, 0, 0, 0.45);
      a {
        color: inherit;
      }
    }
  }
}
</style>