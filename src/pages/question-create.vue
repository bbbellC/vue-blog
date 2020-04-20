<template>
  <div class="question-create">
    <div class="header">
      <span class="text">{{ isEditing ? '编辑' : '提' }}问题</span>
      <Button type="primary" size="large" @click="handlePost">发布问题</Button>
    </div>
    <div class="content">
      <Form ref="questionForm" :model="formItem" :rules="rules" :label-width="0" label-position="left" :hide-required-mark="true">
        <FormItem prop="title">
          <Input v-model="formItem.title" placeholder="请输入问题标题..." />
        </FormItem>
        <FormItem class="inline-form">
          <CTag v-for="(pCourse, pcidx) in pickCourse" :key="pcidx" closable @delete="handleDelete(pCourse.id, 'course')">{{ pCourse.name }}</CTag>
          <Poptip placement="bottom-start" width="300px" v-if="pickCourse.length < 1">
            <Button icon="ios-add" type="dashed" size="small">关联课程</Button>
            <div slot="title">
              <Input v-model="courseInput" placeholder="搜索课程...（关联一个课程）" />
            </div> 
            <div slot="content" class="course-container">
              <template v-if="coursesList.length">
                <CTag v-for="(course, cidx) in coursesList" :key="cidx" @click.native="onTagClick(course)">{{ course.name }}</CTag>
              </template>
              <template v-else>找不到相关课程！</template>
            </div>
          </Poptip>
          <span v-if="pickCourse.length === 0 && !showTagsError" class="alert-box">
            <Icon type="ios-alert" />
            <span class="text">必须关联一个课程哦！</span>
          </span>
          <Alert v-if="showTagsError" type="error" show-icon>必须关联一个课程哦！</Alert>
        </FormItem>
        <!-- <FormItem class="inline-form">
          <CTag v-for="(pCourse, pcidx) in pickCourse" :key="pcidx" closable @delete="handleDelete(pCourse.id, 'course')">{{ pCourse.name }}</CTag>
          <Poptip placement="bottom-start" v-if="pickCourse.length < 1">
            <Button icon="ios-add" type="dashed" size="small">添加标签</Button>
            <div slot="title">仍可选择{{ 5 - pickCourse.length }}标签</div> 
            <div slot="content">
              <CTag v-for="(course, cidx) in courses" :key="cidx" @click.native="onTagClick(course)">{{ course.name }}</CTag>
            </div>
          </Poptip>
        </FormItem> -->
      </Form>
      <mavon-editor
        v-model="content"
        placeholder="在此编辑问题内容..."
        @save="onSave" />
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import CTag from '../components/c-tag';

  export default {
    components: {
      CTag,
    },
    data () {
      return {
        content: '',
        formItem: {
          title: '',
        },
        rules: {
          title: [
            { required: true, message: '标题不能为空！', trigger: 'blur' }
          ],
        },
        pickCourse: [],
        courseInput: '',
        searchedCourse: [],
        showTagsError: false,
        showSuccessModal: false,
        id: '',
        // draftId: '',
        isEditing: false,
      };
    },
    computed: {
      ...mapState('course', ['courses']),
      coursesList () {
        return this.courseInput
          ? this.searchedCourse
          : this.courses;
      },
    },
    watch: {
      async courseInput (val) {
        if (val === '') return;
        const { data } = await this.getCourseByName({ name: val });
        this.searchedCourse = [...data];
      },
    },
    async mounted () {
      if (this.$route.query.articleId) {
        this.id = this.$route.query.articleId;
        this.isEditing = true;
        const { data } = await this.getQuestionDetail({ id: this.id });
        this.initArticleData(data);
      }
    },
    methods: {
      ...mapActions('question', [
        'postQuestion',
        'getQuestionDetail',
      ]),
      ...mapActions('course', [
        'getCourseByName',
      ]),
      onSave () {},
      handlePost () {
        this.$refs.questionForm.validate(async (valid) => {
          if (valid) {
            if (this.pickCourse.length === 0) {
              this.$Message.error(`必须关联一个课程！`);
              this.showTagsError = true;
              return;
            }
            if (!this.content) {
              this.$Message.error(`文章内容不能为空！`);
              return;
            }

            let params = {
              title: this.formItem.title,
              content: this.content,
              courseId: this.pickCourse.map(item => item.id).toString() || '',
              isQ: 1,
            };
            if (this.isEditing) params.id = this.id;

            const that = this;

            this.postQuestion(params)
            .then(res => {
              const { code, data } = res;
              if (code === 200) {
                this.showSuccessModal = true;
                this.id = data.id;
                that.$router.replace(`/question/${data.id}`);
              }
            })
            .catch(err => {
              console.log(err);
            });
          }
        });
      },
      onTagClick (obj) {
        const tags = this.pickCourse;
        tags.push(obj);
      },
      handleDelete (id) {
        const arr = this.pickCourse;
        arr.splice(arr.findIndex(item => item.id === id), 1);
      },
      initArticleData (data) {
        if (data.title) this.$set(this.formItem, 'title', data.title);
        if (data.content) this.content = data.content;
        if (data.courseId) this.pickCourse = [this.courses.find(item => +item.id === +data.courseId)];
      },
    },
  };
</script>

<style lang="less">
@import url('../styles/theme.less');

.question-create {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    line-height: 60px;
    padding: 0 40px;
    border-top: 2px solid @dark-green;
    box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1), 0 1px rgba(0,0,0,0.1);
    background: #fff;
    color: #515a6e;
    position: relative;
    z-index: 900;

    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 1px;
      background: #dcdee2;
      position: absolute;
      bottom: 0;
      left: 0;
    }

    .text {
      font-size: 1.25rem;
      font-weight: 550;
      font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
      color: @primary-color;
    }
  }

  .content {
    margin: 40px 80px 0;

    .c-tag {
      margin: 6px 10px 6px 0;
      cursor: pointer;
    }

    .ivu-poptip {
      &-popper {
        z-index: 1501;
      }

      .c-tag {
        margin: 2px 10px 8px 0;
        cursor: pointer;
      }
    }

    .inline-form {
      display: inline-block;
      // width: 50%;
      margin-right: 5rem;
    }
  }

  .course-container {
    display: flex;
    flex-wrap: wrap;
    min-width: 520px;
  }

  .v-note-wrapper {
    min-height: 520px;
    max-height: 600px;
    z-index: 1000 !important;
  }
}
</style>