<template>
  <div :class="['c-tag', color]">
    <span><slot /></span>
    <Icon v-if="closable" type="ios-close" size="18" @click="handleDelete" />
  </div>
</template>

<script>
  export default {
    props: {
      color: String,
      closable: Boolean,
    },
    methods: {
      handleDelete () {
        this.$emit('delete');
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.c-tag {
  display: inline-block;
  height: 26px;
  line-height: 26px;
  margin: 2px 4px 2px 0;
  padding: 0 8px;
  border-radius: 3px;
  font-size: 12px;
  vertical-align: middle;
  opacity: 1;
  overflow: hidden;
  border: 1px solid #c0dac3;
  background: #f2f9f3;
  color: #607d68;

  &:hover {
    opacity: 0.85;
  }

  .ivu-icon-ios-close {
    margin-left: 4px;
    font-weight: bold;

    &:hover {
      color: @error-color;
      opacity: 1;
    }
  }

  &.green {
    background: #f2f9f3;
    color: #607d68;
    border-color: #c0dac3;
  }

  &.red {
    background: #fff5f6;
    color: #d2565c;
    border-color: #eea2a4;
  }

  &.purple {
    background: #fff1fb;
    color: #9c4a84;
    border-color: #c57eb0;
  }

  &.dark-purple {
    background: #f3f3ff;
    color: #525288;
    border-color: #9393c3;
  }

  &.light-blue {
    background: #f1fdff;
    color: #1491a8;
    border-color: #68b5c3;
  }

  &.yellow {
    background: #fffcf0;
    color: #d0ac0e;
    border-color: #ead36f;
  }

  &.orange {
    background: #fff2e8;
    color: #e2701c;
    border-color: #f1bd97;
  }
}
</style>