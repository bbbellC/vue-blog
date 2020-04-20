<template>
  <div :class="['c-dark-tag', color]">
    <slot />
  </div>
</template>

<script>
  export default {
    props: {
      color: String,
    },
  };
</script>

<style lang="less">
.c-dark-tag {
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
  background: #de8589;
  color: #fff;

  &:hover {
    opacity: 0.85;
  }

  &.green {
    background: #607d68;
  }

  &.red {
    background:#d2565c;
  }

  &.purple {
    background: #9c4a84;
  }

  &.dark-purple {
    background: #525288;
  }

  &.light-blue {
    background: #1491a8;
  }

  &.yellow {
    background: #d0ac0e;
  }

  &.orange {
    background: #e2701c;
  }
}
</style>