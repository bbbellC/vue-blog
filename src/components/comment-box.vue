<template>
  <div class="comment-box">
    <div class="comment">
      <UserAvatar v-if="avatar" :url="avatar" :id="authorId" size="32px" />
      <i v-else class="iconfont icon-user" />
      <div class="content">
        <div class="author" v-if="username">
          <span class="name">{{ username }}</span>
          <div v-if="isCommentAuthor" class="operate">
            <span class="btn" @click="onEditClick">编辑</span>
            ·
            <span class="btn" @click="onDeleteClick">删除</span>
          </div>
          <template v-if="isQ && isAuthor">
            <div v-if="adopted" class="adopted-btn" @click="onAdoptClick">
              <Icon type="md-checkmark-circle-outline" />已采纳
            </div>
            <Button v-else type="primary" @click="onAdoptClick">采纳</Button>
          </template>
          <template v-else>
            <div v-if="adopted" class="adopted-btn">
              <Icon type="md-checkmark-circle-outline" />已采纳
            </div>
          </template>
        </div>
        <div v-if="detail && !showInput">
          <template v-if="isQ">
            <markdown-it-vue v-change class="article-md" :content="detail" />
            <div class="reply">
              <span class="time">{{ time }}</span>
              <div class="reply-btn-container">
                <span class="reply-btn" @click="checkLogin('reply')">
                  <span class="iconfont icon-liuyan" />
                  <span>回复</span>
                </span>
                <Poptip v-if="isCommentAuthor || !isLogin" trigger="hover" placement="right">
                  <div slot="content">{{ isCommentAuthor ? '作者不能给自己的回答点赞哦~' : '请先登录' }}</div>
                  <Button :class="`reply-btn ${liked ? 'actived' : ''}`" @click="onLikeClick">
                    <span class="iconfont icon-dianzan" />
                    {{ liked ? '已' : '' }}赞
                    {{ likeCount ? likeCount : '' }}
                  </Button>
                </Poptip>
                <Button v-else :class="`reply-btn ${liked ? 'actived' : ''}`" @click="onLikeClick">
                  <span class="iconfont icon-dianzan" />
                  {{ liked ? '已' : '' }}赞
                  {{ likeCount ? likeCount : '' }}
                </Button>
              </div>
            </div>
          </template>
          <template v-else>
            {{ detail }}
            <div class="reply">
              <span class="time">{{ time }}</span>
              <span class="reply-btn" @click="checkLogin('reply')">
                <span class="iconfont icon-liuyan" />
                <span>回复</span>
              </span>
            </div>
          </template>
          <div v-if="showReply" class="reply-container">
            <Input
              v-model="replyInput"
              type="textarea"
              size="large"
              :autosize="true"
              :placeholder="`回复${username}...`"
              class="input"
              @click.native="checkLogin" />
            <div class="post-btn">
              <Button type="primary" @click="onReplyClick">提交评论</Button>
            </div>
          </div>
        </div>
        <template v-else>
          <template v-if="isQ">
            <mavon-editor
              v-model="commentInput"
              :subfield="false"
              :toolbars="toolbars"
              placeholder="撰写回答..."
              @click.native="checkLogin" />
            <mavon-editor
              v-model="commentInput"
              :subfield="false"
              defaultOpen="preview"
              :editable="false"
              :toolbarsFlag="false"
              placeholder="撰写回答..."
              class="preview" />
          </template>
          <template v-else>
            <Input
              v-model="commentInput"
              type="textarea"
              size="large"
              :autosize="true"
              placeholder="输入评论..."
              class="input"
              @click.native="checkLogin" />
          </template>
          <div class="post-btn">
            <span v-if="!isLogin" class="tip">
              <Icon type="ios-alert-outline" />
              请先<span class="text-btn" @click="onLoginClick">登录</span>
            </span>
            <Button v-if="showInput" style="margin-right: 1rem;" @click="onCancelClick">取消</Button>
            <Button type="primary" @click="onCommentClick">提交{{ showInput ? '' :  isQ ? '回答' : '评论' }}</Button>
          </div>
        </template>
      </div>
    </div>
    <LoginModal :show-register="showRegisterModal" :show-login="showLoginModal" @update="updateModal" />
    <Modal
      v-model="showDeleteModal"
      :footer-hide="true"
      class="common-modal warning delete">
      <div class="text"><Icon type="md-alert" />删除后不可恢复，确认删除吗？</div>
      <div class="btn-container">
        <Button type="text" size="large" @click="handleCancel" style="margin-left: 8px">取消</Button>
        <Button type="primary" size="large" @click="handleDelete">删除</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import moment from 'moment';
  import MarkdownItVue from 'markdown-it-vue';
  import LoginModal from './login-modal';
  import UserAvatar from './user-Avatar';
  import jwt from 'jsonwebtoken';

  export default {
    components: {
      LoginModal,
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
    props: {
      isQ: [String, Number],
      isReply: Boolean,
      articleId: [String, Number],
      articleAuthorId: [String, Number],
      commentId: [String, Number],
      replyId: [String, Number],
      solvedId: [String, Number],
      authorId: [String, Number],
      username: [String, Number],
      avatar: String,
      createdAt: String,
      detail: [String, Number],
      likes: Array,
    },
    data () {
      return {
        commentInput: '',
        replyInput: '',
        liked: false,
        likeCount: 0,
        adopted: false,
        showRegisterModal: false,
        showLoginModal: false,
        showDeleteModal: false,
        showReply: false,
        showInput: false,
        toolbars: {
          bold: true, // 粗体
          italic: true, // 斜体
          header: true, // 标题
          underline: true, // 下划线
          strikethrough: true, // 中划线
          mark: true, // 标记
          superscript: true, // 上角标
          subscript: true, // 下角标
          quote: true, // 引用
          ol: true, // 有序列表
          ul: true, // 无序列表
          link: true, // 链接
          imagelink: true, // 图片链接
          code: true, // code
          table: true, // 表格
          fullscreen: true, // 全屏编辑
        },
      };
    },
    watch: {
      likes: {
        immediate: true,
        handler (val) {
          if (val) {
            this.likeCount = val.length;
            this.liked = !!val.find(item => item.userId === this.userId);
          }
        },
      },
      solvedId: {
        immediate: true,
        handler (val) {
          this.adopted = (val && val === this.commentId);
        },
      },
      async userInfo (val) {
        if (val && this.commentId && this.isQ) {
          const { data } = await this.postIsLiked({ commentId: this.commentId });
          this.liked = !!data.liked;
        } else {
          this.liked = false;
        }
      },
    },
    computed: {
      ...mapState('user', ['userInfo']),
      isLogin () {
        return !!this.userInfo && Object.keys(this.userInfo).length;
      },
      userId () {
        return this.isLogin ? jwt.decode(this.userInfo.token).userId : '';
      },
      isAuthor () {
        return this.articleAuthorId=== this.userId;
      },
      isCommentAuthor () {
        return this.authorId === this.userId;
      },
      time () {
        return this.createdAt ? moment(this.createdAt).fromNow() : '';
      },
    },
    mounted () {
      this.showInput = !this.detail;
    },
    methods: {
      ...mapActions('article', [
        'postComment',
        'postReply',
        'deleteComment',
        'deleteReply',
      ]),
      ...mapActions('question', [
        'postLike',
        'deleteLike',
        'postIsLiked',
        'postAdopt',
        'deleteAdopt',
      ]),
      async onCommentClick () {
        if (!this.isLogin) this.showLoginModal = true;
        if (!this.commentInput) return;
        let params = {
          articleId: this.articleId,
          content: this.commentInput,
          isA: this.isQ ? 1 : 0
        };
        if (this.showInput) {
          params.id = this.isReply ? this.replyId : this.commentId;
        }
        const fn = this.isReply ? 'postReply' : 'postComment';
        if (this.isReply) params.commentId = this.commentId;
        const { rows, code } = await this[fn](params);
        if (code === 200) {
          this.$emit('update', rows);

          this.showInput = false;
          if (this.isReply) {
            this.replyInput = '';
            this.showReply = false;
          } else {
            this.commentInput = '';
          }
        }
      },
      async onReplyClick () {
        if (!this.replyInput) return;
        let params = {
          articleId: this.articleId,
          commentId: this.commentId,
          content: this.replyInput,
        };
        console.log(this.showInput, this.detail);
        if (this.showInput) {
          params.id = this.replyId;
        }
        const { rows, code } = await this.postReply(params);
        console.log(rows);
        if (code === 200) {
          this.$emit('update', rows);
          
          this.showInput = false;
          this.showReply = false;
          this.replyInput = '';
        }
      },
      onLikeClick () {
        if (this.isCommentAuthor) return;
        if (this.liked) {
          // 取消点赞
          this.deleteLike({ id: this.commentId })
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
          this.postLike({ commentId: this.commentId })
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
      onAdoptClick () {
        if (this.adopted) {
          this.deleteAdopt({ id: this.articleId })
          .then(res => {
            const { code } = res;
            if (code === 200) {
              this.adopted = false;
              this.$emit('updateSolve', 0);
            }
          })
          .catch(err => {
            console.log(err);
          });
        } else {
          this.postAdopt({ articleId: this.articleId, solvedId: this.commentId })
          .then(res => {
            const { code } = res;
            if (code === 200) {
              this.adopted = true;
              this.$emit('updateSolve', this.commentId);
            }
          })
          .catch(err => {
            console.log(err);
          });
        }
      },
      async onEditClick () {
        this.showInput = true;
        this.commentInput = this.detail;
      },
      onCancelClick () {
        this.showInput = false;
      },
      onDeleteClick () {
        this.showDeleteModal = true;
      },
      async handleDelete () {
        const deleteFn = this.isReply ? 'deleteReply' : 'deleteComment';
        const deleteKey = this.isReply ? 'replyId' : 'commentId';
        console.log(deleteFn, this[deleteKey]);
        const { rows, code } = await this[deleteFn]({ id: this[deleteKey] });
        console.log(rows, code);

        if (code === 200) {
          this.$emit('update', rows);
          this.showInput = false;
          this.showDeleteModal = false;
        } else {
          this.$Message.error('删除失败！');
        }
      },
      handleCancel () {
        this.showDeleteModal = false;
      },
      checkLogin (type) {
        if (!this.isLogin) {
          this.showLoginModal = true;
        } else {
          if (type === 'reply') this.showReply = !this.showReply;
        }
      },
      onLoginClick () {
        this.showLoginModal = true;
      },
      updateModal (infos) {
        for (let i = 0; i < infos.length; ++i) {
          const info = infos[i];
          if (info.type === 'register') this.showRegisterModal = info.value;
          else if (info.type === 'login') this.showLoginModal = info.value;
        }
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.comment-box {
  margin: 0 12px 0 3px;

  .comment {
    display: flex;

    .url-avatar {
      margin: 0;
      margin-right: 12px;
    }

    .icon-user {
      width: 32px;
      height: 32px;
      font-size: 32px;
      position: relative;
      margin: 0;
      line-height: 32px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .content {
      position: relative;
      flex: 1 1 auto;
      min-width: 1px;
      font-size: 14px;
      word-wrap: break-word;

      .author {
        margin-bottom: 8px;
        font-size: 12px;

        .name {
          margin-right: 10px;
        }

        .operate {
          display: inline-block;
          // margin-left: 1rem;
          color: @primary-color;

          .btn {
            margin: 0 5px;
            cursor: pointer;

            &:hover {
              color: @light-primary;
            }
          }
        }

        .ivu-btn {
          float: right;
        }
      }

      .reply {
        margin-top: 12px;

        .time {
          color: #a7adaf;
        }

        .reply-btn {
          float: right;
          transition: all 0.4s ease;

          &.actived {
            background-color: @light-green;
            box-shadow: 0 2px 4px 0 @lighter-green;

            .iconfont {
              color: @primary-color;
            }
          }

          &:hover {
            color: @primary-color;
            cursor: pointer;

            .iconfont {
              color: @primary-color;
            }
          }

          &-container {
            display: inline-flex;
            align-items: center;
            float: right;

            .ivu-btn:focus {
              box-shadow: none;
            }
          }

          &.ivu-btn {
            margin-left: 1rem;
          }
        }

        .iconfont {
          padding-right: 6px;
          color: rgba(0, 0, 0, 0.45);
        }
      }

      .reply-container {
        margin: 1rem 0 0 0;
        padding: 1rem;
        overflow: hidden;
        background: @light-back;
      }

      .post-btn {
        float: right;
        margin-top: 20px;

        .tip {
          display: inline-block;
          margin-right: 24px;

          .text-btn {
            margin-left: 4px;
            color: @primary-color;
            cursor: pointer;
          }

          .ivu-icon {
            font-weight: 500;
            font-size: 16px;
          }
        }
      }
    }

    
    .adopted-btn {
      float: right;
      border: 1px solid transparent;
      white-space: nowrap;
      line-height: 32px;
      user-select: none;
      height: 32px;
      padding: 0 15px;
      font-size: 14px;
      font-weight: normal;
      text-align: center;
      vertical-align: middle;
      border-radius: 4px;
      color: #fff;
      background-color: @light-primary;
      border: 1px solid @lighter-green;
      cursor: pointer;

      &:hover {
        background-color: @dark-green;
      }

      i {
        padding-right: 4px;
        font-size: 16px;
      }
    }

    .v-note-wrapper {
        .v-note-op .v-right-item {
          max-width: 20%;
        }

        &.preview {
          min-height: 52px;
          margin-top: 24px;
        }
      }
  }
}
</style>