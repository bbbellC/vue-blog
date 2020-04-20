<template>
  <div class="simple-container">
    <template v-if="arr.length">
      <div v-for="(article, index) in arr" :key="index" class="item">
        <span v-if="showTip" class="tip">文章</span>
        <div class="info">
          {{ article.likeCount }} 赞
        </div>
        <div v-if="article.isPrivate" class="info">
          私密
        </div>
        <div class="content">
          <div class="title">
            <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
          </div>
        </div>
        <div class="attr">
          {{ article.createdAt.slice(0, 10) }}
        </div>
      </div>
    </template>
    <div v-else class="empty">
      暂无内容!
    </div>
  </div>
</template>

<script>
  import { tagColors } from '../scripts/data';

  export default {
    data () {
      return {
        tagColors,
      };
    },
    props: {
      articles: [Array, Object],
      showTip: Boolean,
    },
    computed: {
      arr () {
        if(Array.isArray(this.articles)) return this.articles;
        else return [this.articles];
      },
    },
  };
</script>