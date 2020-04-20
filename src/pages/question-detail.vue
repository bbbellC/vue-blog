<template>
  <div class="question-detail">
    <div v-if="nonExistent">
      抱歉，查无此资源~
    </div>
    <template v-else>
      <div class="container">
        <div class="post-header">
          <div class="flex-block">
            <UserAvatar :url="author.avatar" :id="question.userId" size="2rem" />
            <div class="author">{{ author.username }}</div>
            <div v-if="question.postTime" class="post-time">
              <i class="iconfont icon-fabuzhiwei" />
              &nbsp; 提问于 &nbsp;
              <span>{{ question.postTime }}</span>
            </div>
            <div v-if="question.courseId" class="tags">
              <CTag :color="tagColors[randomIdx]">{{ courses.find(course => +course.id === +question.courseId ).name }}</CTag>
            </div>
            <div v-if="isAuthor" class="operate">
              <span class="btn" @click="onEditClick">编辑</span>
              ·
              <span class="btn" @click="onDeleteClick">删除</span>
            </div>
          </div>
          <h1 class="post-title">{{ question.title }}</h1>
        </div>
        <markdown-it-vue v-change v-if="question.content" class="article-md" :content="question.content" />
      </div>
      <div class="container" style="margin-bottom:4rem">
        <div :key="updateKey">
          <span class="count">{{ answers ? answers.length : 0 }}</span>个答案
          <!-- <Divider style="margin-top:10px" /> -->
          <div v-for="(answer, aIdx) in answers" :key="aIdx">
            <Divider />
            <CommentBox
              :article-id="question.id"
              :article-author-id="question.userId"
              :is-q="question.isQ"
              :solved-id="question.solvedId"
              :comment-id="answer.id"
              :detail="answer.content"
              :username="answer.user.username"
              :avatar="answer.user.avatar"
              :author-id="answer.userId"
              :created-at="answer.createdAt"
              :likes="answer.likes"
              @update="updateAnswerList"
              @updateSolve="updateSolve" />
            <div class="reply-list" v-for="(reply, rindex) in answer.replies" :key="rindex">
              <CommentBox
                :is-reply="true"
                :article-id="question.id"
                :comment-id="answer.id"
                :reply-id="reply.id"
                :detail="reply.content"
                :username="reply.user.username"
                :author-id="reply.userId"
                :avatar="reply.user.avatar"
                :created-at="reply.createdAt"
                @update="updateAnswerList" />
            </div>
          </div>
          <Divider style="margin-bottom:42px" />
          <CommentBox :article-id="question.id" :avatar="userAvatar" :is-q="question.isQ" @update="updateAnswerList" />
        </div>
      </div>
      <div class="sider">
        <Poptip v-if="isAuthor || !isLogin" trigger="hover" placement="right">
          <div slot="content">{{ isAuthor ? '您是作者，不能对自己的问题点赞哦~' : '请先登录' }}</div>
          <div class="like">
            <span class="iconfont icon-dianzan btn" />
          </div>
        </Poptip>
        <div v-else-if="liked" class="like">
          <span class="iconfont icon-dianzan btn actived" @click="onLikeClick"></span>
        </div>
        <div v-else class="like">
          <span class="iconfont icon-dianzan btn" @click="onLikeClick"></span>
        </div>
        <div class="number">{{ likeCount ? likeCount : '' }}赞</div>
      </div>
      <div class="right-bottom">
        <Poptip trigger="hover" placement="left">
          <div slot="content">回到顶部</div>
          <div class="btn">
          <Icon type="md-arrow-round-up" @click="onScrollToTop" />
        </div>
        </Poptip>
      </div>
      <Modal
        v-model="showDeleteModal"
        :footer-hide="true"
        class="common-modal warning delete">
        <div class="text"><Icon type="md-alert" />删除后不可恢复，确认删除此问题吗？</div>
        <div class="btn-container">
          <Button type="text" size="large" @click="onCancelClick" style="margin-left: 8px">取消</Button>
          <Button type="primary" size="large" @click="handleDelete">删除</Button>
        </div>
      </Modal>
    </template>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import jwt from 'jsonwebtoken';
  import MarkdownItVue from 'markdown-it-vue';
  import UserAvatar from '../components/user-Avatar';
  import CTag from '../components/c-tag';
  import CommentBox from '../components/comment-box';
  import { tagColors } from '../scripts/data';
  
  export default {
    components: {
      UserAvatar,
      CTag,
      CommentBox,
      MarkdownItVue,
    },
    directives:{
      change: {
        inserted: function(el){
          el.className = el.className.replace('markdown-body', '');
        }
      }
    },
    data () {
      return {
        tagColors,
        nonExistent: false,
        loading: false,
        question: {},
        answers: [],
        author: {},
        liked: false,
        likeCount: 0,
        showDeleteModal: false,
        updateKey: 0,
      };
    },
    computed: {
      ...mapState('user', ['userInfo']),
      ...mapState('course', [
        'courses',
      ]),
      id () {
        return +this.$route.params.id;
      },
      isLogin () {
        return this.userInfo && Object.keys(this.userInfo).length;
      },
      userId () {
        return this.isLogin ? jwt.decode(this.userInfo.token).userId : '';
      },
      isAuthor () {
        return this.author.userId === this.userId;
      },
      randomIdx () {
        return Math.floor(Math.random() * 7); 
      },
      userAvatar () {
        return this.isLogin ? this.userInfo.avatar : '';
      },
    },
    watch: {
      async userInfo (val) {
        if (val) {
          const { data } = await this.postIsLiked({ articleId: this.id });
          this.liked = !!data.liked;
        } else {
          this.liked = false;
        }
      },
    },
    async mounted () {
      this.loading = true;
      const { data, code } = await this.getQuestionDetail({ id: this.id });

      if (code === 404) {
        this.nonExistent = true;
      } else {
        data.postTime = data.createdAt.slice(0, 10);
        if (data.title[data.title.length - 1] !== '?') data.title += '？';
        this.question = data;
        this.answers = data.comments;
        this.author = data.user;
        this.author.userId = data.userId;
        this.likeCount = data.likeCount;
        
        if (this.isLogin && data.likeCount) {
          const liked = data.likes.find(item => item.userId === this.userId);
          // const { liked } = await this.postIsLiked({ articleId: this.id });
          this.liked = !!liked;
        }

        this.loading = false;
      }
    },
    methods: {
      ...mapActions('question', [
        'getQuestionDetail',
      ]),
      ...mapActions('article', [
        'postLike',
        'deleteLike',
        'postIsLiked',
        'deleteArticle',
      ]),
      updateAnswerList (answers) {
        this.answers = answers;
        this.updateKey++;
      },
      updateSolve (solvedId) {
        this.$set(this.question, 'solvedId', solvedId);
        this.updateKey++;
      },
      onLikeClick () {
        if (this.isAuthor) return;
        if (this.liked) {
          // 取消点赞
          this.deleteLike({ id: this.id })
          .then(res => {
            const { likeCount } = res;
            this.likeCount = likeCount;
            this.liked = false;
          })
          .catch(err => {
            console.log(err);
          });
        } else {
          // 点赞
          this.postLike({ articleId: this.id })
          .then(res => {
            const { likeCount } = res;
            this.likeCount = likeCount;
            this.liked = true;
          })
          .catch(err => {
            console.log(err);
          });
        }
      },
      onEditClick () {
        this.$router.push({
          name: 'question',
          query: {
            articleId: this.id,
          },
        });
      },
      onDeleteClick () {
        this.showDeleteModal = true;
      },
      onCancelClick () {
        this.showDeleteModal = false;
      },
      async handleDelete () {
        const { code } = await this.deleteArticle({ id: this.id });
        if (code === 200) {
          this.$router.go(-1);
        }
      },
      onScrollToTop () {
        document.getElementById("_header").scrollIntoView();
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.question-detail {

  .post-title {
    text-align: left;
  }

  .tags {
    margin-left: 1rem;
  }

  .count {
    color: @primary-color;
    border-bottom: 1px dotted @primary-color;
    margin-right: 5px;
  }

  .comment-box {
    margin-bottom: 1rem;
  }

  .reply-list {
    margin: 1rem 0 0 50px;
    padding: 1rem;
    background: @back-color;
  }

  .ivu-divider-horizontal {
    margin: 32px 0;
  }
}
</style>