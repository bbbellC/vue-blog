<template>
  <span class="c-avatar">
    <span>{{ value }}</span>
  </span>
</template>

<script>
export default {
  props: {
    value: [String, Number],
  },
}
</script>

<style lang="less">
.c-avatar {
  display: inline-block;
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  vertical-align: middle;
  background-color: #607d68;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
}
</style>