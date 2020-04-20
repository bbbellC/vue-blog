<template>
  <div class="article-detail">
    <div v-if="nonExistent">
      抱歉，查无此资源~
    </div>
    <template v-else>
      <div class="container">
        <div class="post-header">
          <div class="flex-block">
            <UserAvatar :url="author.avatar" :id="item.userId" size="2rem" />
            <div class="author">{{ author.username }}</div>
            <div v-if="item.postTime" class="post-time">
              <i class="iconfont icon-fabuzhiwei" />
              &nbsp; 发表于 &nbsp;
              <span>{{ item.postTime }}</span>
            </div>
            <div v-if="isAuthor" class="operate">
              <span class="btn" @click="onEditClick">编辑</span>
              ·
              <span class="btn" @click="onDeleteClick">删除</span>
            </div>
          </div>
          <h1 class="post-title">{{ item.title }}</h1>
          <InfoBox
            :comments-count="commentsCount"
            :tag="item.articleTags"
            :course-id="item.courseId"
            :show-like="false"
            class="others"
            />
        </div>
        <markdown-it-vue v-change v-if="item.content" ref="md" class="article-md" :content="item.content" />
        <div class="comment-wrapper">
          <div class="comment-header">
            <span class="count">{{ commentsCount }}</span>条评论
            <Divider style="margin-top:10px" />
            <CommentBox :article-id="id" :avatar="userAvatar" :author-id="userId" @update="updateCommentList" />
          </div>
          <div class="comment-list" v-for="(comment, cindex) in comments" :key="cindex">
            <CommentBox
              :article-id="id"
              :comment-id="comment.id"
              :detail="comment.content"
              :username="comment.user.username"
              :avatar="comment.user.avatar"
              :author-id="comment.userId"
              :created-at="comment.createdAt"
              @update="updateCommentList" />
            <div class="reply-list" v-for="(reply, rindex) in comment.replies" :key="rindex">
              <CommentBox
                :is-reply="true"
                :article-id="id"
                :comment-id="comment.id"
                :reply-id="reply.id"
                :detail="reply.content"
                :username="reply.user.username"
                :avatar="reply.user.avatar"
                :author-id="reply.userId"
                :created-at="reply.createdAt"
                @update="updateCommentList" />
            </div>
          </div>
        </div>
      </div>
      <div class="sider">
        <Poptip v-if="isAuthor || !isLogin" trigger="hover" placement="right">
          <div slot="content">{{ isAuthor ? '您是作者，不能对自己的文章点赞哦~' : '请先登录' }}</div>
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
        <div class="text"><Icon type="md-alert" />删除后不可恢复，确认删除此文章吗？</div>
        <div class="btn-container">
          <Button type="text" size="large" @click="onCancelClick" style="margin-left: 8px">取消</Button>
          <Button type="primary" size="large" @click="handleDelete">删除</Button>
        </div>
      </Modal>
    </template>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import jwt from 'jsonwebtoken';
  import MarkdownItVue from 'markdown-it-vue';
  // import { translateMarkdown } from '../scripts/utils';
  import InfoBox from '../components/info-box';
  import CommentBox from '../components/comment-box';
  import UserAvatar from '../components/user-Avatar';

  export default {
    components: {
      InfoBox,
      CommentBox,
      UserAvatar,
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
        nonExistent: false,
        item: {},
        comments: [],
        likeCount: 0,
        commentsCount: 0,
        liked: false,
        author: {},
        showDeleteModal: false,
        loading: false,
        options: {
          markdownIt: {
            linkify: true
          },
          linkAttributes: {
            attrs: {
              target: '_blank',
              rel: 'noopener'
            }
          }
        },
      };
    },
    computed: {
      ...mapState('user', ['userInfo']),
      ...mapState('tags', [
        'tags',
        'cates',
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
      const { data, code } = await this.getArticleDetail({ id: this.id });

      if (code === 404) {
        this.nonExistent = true;
      } else {
        // data.content = translateMarkdown(data.content);
        data.postTime = data.createdAt.slice(0, 10);
        this.item = data;
        this.comments = data.comments;
        this.commentsCount = this.getCommentsCount(data.comments);
        this.likeCount = data.likeCount;
        this.author = data.user;
        this.author.userId = data.userId;

        if (this.isLogin && data.likeCount) {
          const liked = data.likes.find(item => item.userId === this.userId);
          this.liked = !!liked;
        }

        this.loading = false;
      }
    },
    methods:{
      ...mapActions('tags', [
        'getAllTags',
        'getAllCates',
      ]),
      ...mapActions('article', [
        'getArticleDetail',
        'postIsLiked',
        'postLike',
        'deleteLike',
        'deleteArticle',
      ]),
      getCommentsCount (commentList) {
        let count = commentList.length;
        commentList.forEach(item => {
          count += item.replies.length
        });
        return count;
      },
      updateCommentList (comments) {
        this.comments = comments;
        this.commentsCount = this.getCommentsCount(comments);
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
          name: 'article',
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

.article-detail {
  background-color: @back-color;

  .comment-wrapper {
    padding: 20px;

    .comment-header {
      .count {
        color: @primary-color;
        border-bottom: 1px dotted @primary-color;
        margin-right: 5px;
      }
    }

    .comment-list {
      margin: 1rem 0 0 50px;
      // padding: 1rem;
      // background: @back-color;
    }

    .reply-list {
      margin: 1rem 0 0 50px;
      padding: 1rem;
      background: @back-color;
    }
  }

  .container {
    margin-bottom: 4rem;
  }
}
</style>
