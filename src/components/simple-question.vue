<template>
  <div class="simple-container">
    <template v-if="arr && arr.length">
      <div v-for="(question ,index) in arr" :key="index" class="item">
        <template v-if="isA">
          <span v-if="showTip" class="tip">回答</span>
          <div v-if=" question.comments" class="info">
            {{ question.comments.reduce((total, item) => total += item.likeCount, 0) }}
            赞
          </div>
          <div v-if="question.comments.find(item => item.id === question.solvedId)" class="info actived">被采纳</div>
        </template>
        <template v-else>
          <span v-if="showTip" class="tip">提问</span>
          <div class="info">
            {{ question.viewCount }} 浏览
          </div>
          <div class="info">
            {{ question.likeCount }} 赞
          </div>
          <div v-if="question.solvedId" class="info actived">已解决</div>
        </template>
        <div class="content">
          <div class="title">
            <router-link :to="`/question/${question.id}`">{{ question.title }}</router-link>
          </div>
        </div>
        <div class="attr">
          {{ question.createdAt.slice(0, 10) }}
        </div>
      </div>
    </template>
    <div v-else class="empty">暂无内容！</div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    props: {
      questions: [Array, Object],
      isA: Boolean,
      showTip: Boolean,
    },
    computed: {
      ...mapState('course', [
        'courses',
      ]),
      arr () {
        if(Array.isArray(this.questions)) return this.questions;
        else return [this.questions];
      },
    },
  };
</script>
