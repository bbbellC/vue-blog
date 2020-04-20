<template>
  <div class="create">
    <div class="header">
      <span class="text">{{ isEditing ? '编辑' : '写'}}文章</span>
      <div>
        <span v-if="draftId" class="tip">
          <i class="ivu-icon ivu-icon-ios-alert" />
          {{ draftId ? '已存草稿' : '' }}
        </span>
        <RadioGroup v-model="isPrivate" type="button">
          <Radio label="公开"></Radio>
          <Radio label="私密"></Radio>
        </RadioGroup>
        <Button type="primary" size="large" @click="handlePost">发布文章</Button>
      </div>
    </div>
    <div class="content">
      <Form ref="articleForm" :model="formItem" :rules="rules" :label-width="60" label-position="left" :hide-required-mark="true">
        <FormItem label="标题" prop="title">
          <Input v-model="formItem.title" placeholder="请输入文章标题..." />
        </FormItem>
        <FormItem label="课程" class="inline-form">
          <CTag v-for="(pCourse, pcidx) in pickCourse" :key="pcidx" closable @delete="handleDelete(pCourse.id, 'course')">{{ pCourse.name }}</CTag>
          <Poptip placement="bottom-start" width="300px" v-if="pickCourse.length < 1">
            <Button icon="ios-add" type="dashed" size="small" @click="handleAddCourse">添加</Button>
            <div slot="title">
              <Input v-model="courseInput" placeholder="搜索课程...（最多选择一个课程）" />
            </div> 
            <div slot="content" class="course-container">
              <template v-if="coursesList.length">
                <CTag v-for="(course, cidx) in coursesList" :key="cidx" @click.native="onTagClick(course, 'course')">{{ course.name }}</CTag>
              </template>
              <template v-else>找不到相关课程！</template>
            </div>
          </Poptip>
          <!-- <span v-if="pickCourse.length === 0" class="alert-box">
            <Icon type="ios-alert" />
            <span class="text">至少添加一个课程哦！</span>
          </span> -->
        </FormItem>
        <FormItem label="标签" class="inline-form">
          <CTag v-for="(pTag, ptidx) in pickTags" :key="ptidx" closable @delete="handleDelete(pTag.id, 'tag')">{{ pTag.name }}</CTag>
          <Poptip placement="bottom-start" v-if="pickTags.length < 5">
            <Button icon="ios-add" type="dashed" size="small" @click="handleAddTag">添加</Button>
            <div slot="title">
              <Input v-model="tagInput" :placeholder="`搜索标签...（仍可选择${5 - pickTags.length}个标签）`" />
            </div> 
            <div slot="content" class="tag-container">
              <template v-if="tagsList.length">
                <CTag v-for="(tag, tidx) in tagsList" :key="tidx" @click.native="onTagClick(tag, 'tag')">{{ tag.name }}</CTag>
              </template>
              <template v-else>找不到相关标签！</template>
            </div>
          </Poptip>
          <span v-if="pickTags.length === 0 && !showTagsError" class="alert-box">
            <Icon type="ios-alert" />
            <span class="text">至少添加一个标签哦！</span>
          </span>
          <Alert v-if="showTagsError" type="error" show-icon>至少添加一个标签哦！</Alert>
        </FormItem>
      </Form>
      <mavon-editor
        ref="md"
        v-model="content"
        placeholder="在此编辑文章..."
        :toolbars="toolbars"
        @imgAdd="onAddImg"
        @imgDel="onDelImg"
        @save="onSave" />
    </div>
    <Modal
      v-model="showSuccessModal"
      :footer-hide="true"
      class="common-modal success">
      <div class="text"><Icon type="ios-checkmark-circle" />成功{{ isEditing ? '更新' : '创建' }}文章！去看看吧！</div>
      <div class="btn-container">
        <Button type="text" size="large" @click="() => { this.$router.go(-1); }" style="margin-left: 8px">不啦</Button>
        <Button type="primary" size="large" @click="() => { this.$router.replace(`/article/${id}`); }">好的</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import axios from '../scripts/axios';
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
        isPrivate: '公开',
        pickTags: [],
        pickCourse: [],
        showTagsError: false,
        showSuccessModal: false,
        id: '',
        draftId: '',
        isEditing: false,
        courseInput: '',
        searchedCourse: [],
        tagInput: '',
        searchedTag: [],
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
          readmodel: true, // 沉浸式阅读
          htmlcode: true, // 展示html源码
          help: true, // 帮助
          /* 1.3.5 */
          undo: true, // 上一步
          redo: true, // 下一步
          trash: true, // 清空
          save: true, // 保存（触发events中的save事件）
          /* 2.2.1 */
          subfield: true, // 单双栏模式
          preview: true, // 预览
      },
      };
    },
    computed: {
      ...mapState('tags', [
        'tags',
      ]),
      ...mapState('course', [
        'courses',
      ]),
      coursesList () {
        return this.courseInput
          ? this.searchedCourse
          : this.courses;
      },
      tagsList () {
        return this.tagInput
          ? this.searchedTag
          : this.tags;
      },
    },
    watch: {
      pickTags (val) {
        if (val.length > 0) this.showTagsError = false;
      },
      async courseInput (val) {
        if (val === '') return;
        const { data } = await this.getCourseByName({ name: val });
        this.searchedCourse = [...data];
      },
      async tagInput (val) {
        if (val === '') return;
        const { data } = await this.getTagByName({ name: val });
        this.searchedTag = [...data];
      },
    },
    async mounted  () {
      if (this.$route.query.draftId) {
        this.draftId = this.$route.query.draftId;
        const { data } = await this.getDraftDetail({ id: this.draftId });
        this.initArticleData(data);
      } else if (this.$route.query.articleId) {
        this.id = this.$route.query.articleId;
        this.isEditing = true;
        const { data } = await this.getArticleDetail({ id: this.id });
        this.initArticleData(data);
      }
    },
    methods: {
      ...mapActions('article', [
        'postArticle',
        'getArticleDetail',
        'deleteImg',
      ]),
      ...mapActions('draft', [
        'postDraft',
        'getDraftDetail',
      ]),
      ...mapActions('course', [
        'getCourseByName',
      ]),
      ...mapActions('tags', [
        'getTagByName',
      ]),
      handleAddCourse () {},
      handleAddTag () {},
      handleDelete (id, type) {
        const arr =  type === 'tag' ? this.pickTags : this.pickCourse;
        arr.splice(arr.findIndex(item => item.id === id), 1);
      },
      onTagClick (obj, type) {
        const tags =  type === 'tag' ? this.pickTags : this.pickCourse;
        for (let i = 0; i < tags.length; ++i) {
          if (tags[i].id === obj.id) {
            this.$Message.warning(`请勿重复选择已有的${type === 'tag' ? '标签' : '类别'}！`);
            return;
          }
        }
        tags.push(obj);
      },
      onAddImg (pos, $file) {
        let formdata = new FormData();
        formdata.append('image', $file);

        axios({
          url: '/article/img',
          method: 'post',
          data: formdata,
          headers: { 'Content-Type': 'multipart/form-data' },
        }).then((res) => {
          this.$refs.md.$img2Url(pos, res.url);
        });
      },
      async onDelImg (filename) {
        const index = filename[0].indexOf('images');
        const url = filename[0].slice(index);
        await this.deleteImg({ url });
      },
      onSave () {
        let params = {
          title: this.formItem.title,
          content: this.content,
          tags: this.pickTags.map(item => item.id).toString() || '',
          isPrivate: this.isPrivate === '公开' ? 0 : 1,
        };
        if (this.pickCourse.length) params.courseId =  this.pickCourse.map(item => item.id).toString();
        if (this.draftId) params.id = this.draftId;
        let returnFlag = true;
        Object.keys(params).forEach(key => {
          if (key === 'isPrivate') return true;
          if (params[key]) {
            returnFlag = false;
            return false;
          }
        });
        if (returnFlag) {
          this.$Message.warning(`您未填写任何内容，无法保存！`);
          return;
        }
        this.postDraft(params)
        .then(res => {
          const { code, data } = res;
          if (code === 200) {
            if (data && data.id) this.draftId = data.id;
          }
        })
        .catch(err => {
          console.log(err);
        });
      },
      handlePost () {
        this.$refs.articleForm.validate(async (valid) => {
          if (valid) {
            if (this.pickTags.length === 0) {
              this.$Message.error(`至少选择一个标签！`);
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
              tags: this.pickTags.map(item => item.id).toString() || '',
              isQ: 0,
              isPrivate: this.isPrivate === '公开' ? 0 : 1,
            };
            if (this.pickCourse.length) params.courseId =  this.pickCourse.map(item => item.id).toString();
            if (this.isEditing) params.id = this.id;

            this.postArticle(params)
            .then(res => {
              const { code, data } = res;
              if (code === 200) {
                this.showSuccessModal = true;
                this.id = data.id;
              }
            })
            .catch(err => {
              console.log(err);
            });
          }
        });
      },
      initArticleData (data) {
        if (data.title) this.$set(this.formItem, 'title', data.title);
        if (data.content) this.content = data.content;
        if (data.courseId) this.pickCourse = [this.courses.find(item => +item.id === +data.courseId)];
        if (data.tagsList) this.pickTags = (data.tagsList.split(',') || []).map(id => this.tags.find(item => +item.id === +id));
        this.isPrivate =  +data.isPrivate === 0 ? '公开' : '私密';
      },
    },
  };
</script>

<style lang="less">
@import url('../styles/theme.less');

.create {
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

    .tip {
      display: inline-block;
      height: 32px;
      line-height: 30px;
      padding: 0 10px;
      margin-right: 1rem;
      vertical-align: middle;
      font-size: 14px;
      border-radius: 4px;
      border: 1px solid #dcdee2;
      color: @subsidiary-color;

      i {
        color: @dark-green;
      }
    }

    .ivu-radio-group {
      margin-right: 1rem;
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
        z-index: 1023;
      }

      .c-tag {
        margin: 2px 10px 8px 0;
        cursor: pointer;
      }

      .ivu-input-wrapper {
        margin: 6px 0 3px;
      }
    }

    .inline-form {
      display: inline-block;
      margin-right: 5rem;
    }

    .course-container, .tag-container {
      display: flex;
      flex-wrap: wrap;
    }

    .course-container {
      min-width: 520px;
    }
    .tag-container {
      min-width: 480px;
    }
  }

  .v-note-wrapper {
    min-height: 520px;
    max-height: 600px;
    z-index: 1000 !important;
  }
}
</style>