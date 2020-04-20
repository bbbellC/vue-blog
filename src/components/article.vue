<template>
  <div class="article">
    <template v-if="articles && articles.length">
      <div v-for="(article ,index) in articles" :key="index" class="item">
        <div class="title">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
          <span class="author">
            <span class="underline" @click="$router.push(`/u/${article.userId}`)">{{ article.user.username }}</span>
            <span class="dot">·</span>
            {{ getTime(article.createdAt) }}
          </span>
        </div>
        <div class="desc">
          <div class="info">
            <span class="iconfont icon-dianzan"><span>{{ article.likeCount }}</span></span>
            <Divider type="vertical" />
            <span class="iconfont icon-liuyan"><span>{{ article.commentsCount }}</span></span>
          </div>
          <div class="attr">
            <template v-if="article.articleTags && article.articleTags.length">
              <span class="iconfont icon-tags" />
              <div v-for="(tag, tidx) in article.articleTags" :key="tidx" class="tags">
                <CTag :color="tagColors[tidx]">{{ tag.tag.name }}</CTag>
              </div>
            </template>
            <template v-if="article.courseId">
              <span class="iconfont icon-folder" />
              <div class="tags">
                <CTag>{{ courses.find(item => item.id === article.courseId ).name }}</CTag>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="empty">暂无内容！</div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import { tagColors } from '../scripts/data';
  import CTag from './c-tag';
  import { getTime } from '../scripts/utils';

  export default {
    components: {
      CTag,
    },
    props: {
      articles: Array,
    },
    data () {
      return {
        tagColors,
        getTime,
      };
    },
    computed: {
      ...mapState('course', [
        'courses',
      ]),
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.article {
  background: #fff;
  
  .item {
    position: relative;
    border: 1px solid #ebedf0;
    padding: 16px 24px;
    background: #fff;
    transition: all 0.2s linear;

    &:hover {
      background: rgba(217, 239, 236, 0.1);
      box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.05);
      transform: translate3d(0, -5px 0);
    }

    .title {
      a {
        margin-right: 6px;
        color: @title-color;
        font-size: 16px;
        font-weight: 520;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }

      .author {
        float: right;
        font-size: 12px;
        color: @subsidiary-color;

        .dot {
          padding: 0 6px;
        }
      }
    }

    .desc {
      margin-top: 1rem;
      overflow: hidden;

      .iconfont::before {
        padding-right: 5px;
      }

      .ivu-divider-vertical {
        margin: 0 12px;
      }

      .info {
        display: inline-block;
        margin: 4px 1px 0 0;
      }

      .attr {
        float: right;

        .tags {
          display: inline-block;
          margin-right: 4px;
        }

        .icon-folder {
          margin-left: 6px;
        }
      }
    }

    .iconfont {
      font-size: 15px;
    }
  }
}
</style>