<template>
  <div class="info-box">
    <template v-if="showLike">
      <span class="iconfont icon-dianzan"><span>{{ likeCount }}</span></span>
      <Divider type="vertical" />
    </template>
    <span class="iconfont icon-liuyan"><span>{{ commentsCount }}</span></span>
    <template v-if="tagList && tagList.length">
      <Divider type="vertical" />
      <span class="iconfont icon-tags" />
      <div v-for="(tag, tidx) in tagList" :key="tidx" class="tags">
        <CTag :color="tagColors[tidx]">{{ tag.name }}</CTag>
      </div>
    </template>
    <!-- <template v-if="cateList && cateList.length">
      <Divider type="vertical" />
      <span class="iconfont icon-folder" />
      <div v-for="(cate, idx) in cateList" :key="idx+99" class="tags">
        <CDarkTag :color="tagColors[idx]">{{ cate.name }}</CDarkTag>
      </div>
    </template> -->
    <template v-if="courseId">
      <Divider type="vertical" />
      <span class="iconfont icon-folder" />
      <div class="tags">
        <CDarkTag>{{ courses.find(item => item.id === courseId ).name }}</CDarkTag>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import CTag from './c-tag';
  import CDarkTag from './c-dark-tag';
  import { tagColors } from '../scripts/data';

  export default {
    components: {
      CTag,
      CDarkTag,
    },
    props: {
      likeCount: {
        type: [Number, String],
        default: 0,
      },
      commentsCount: {
        type: [Number, String],
        default: 0,
      },
      tag: [Array, String],
      category: String,
      courseId: [Number, String],
      showLike: {
        type: Boolean,
        default: true,
      },
    },
    data () {
      return {
        tagColors,
      };
    },
    computed: {
      ...mapState('tags', [
        'tags',
        'cates',
      ]),
      ...mapState('course', [
        'courses',
      ]),
      cateList () {
        return this.category
          ? (this.category.split(',') || []).map(id => this.cates.find(item => +item.id === +id))
          : [];
      },
      tagList () {
        return this.tag
         ? this.tag.map(item => ({ id: item.tagId, name: item.tag.name }))
         : [];
      },
      // randomIdx () {
      //   return Math.floor(Math.random() * 7); 
      // },
    },
  };
</script>

<style lang="less">
.info-box {
  display: inline-block;
  margin-top: 16px;

  .tags {
    display: inline-block;
    margin: 0 4px 4px 0;
  }

  .iconfont {
    font-size: 18px;

    &::before {
      padding-right: 5px;
    }

    span {
      // padding-left: 4px;
      font-size: 14px;
      // font-family: @family;
    }
  }

  .ivu-divider-vertical {
    margin: 0 12px;
  }
}
</style>