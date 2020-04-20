<template>
  <div class="c-line-btn">
    <span>{{ text }}</span>
  </div>
</template>

<script>
  export default {
    props: {
      text: [String, Number],
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.c-line-btn {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  height: 32px;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  vertical-align: middle;
  transition: color 0.2s linear, background-color 0.2s linear, border 0.2s linear, box-shadow 0.2s linear, -webkit-box-shadow 0.2s linear;

  &:hover {
    color: @link-hover-color;
  }

  span {
    display: inline-block;
    position: relative;
    height: 32px;
    line-height: 32px;
    padding: 0 15px;

    &::before, &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background-color: @link-hover-color;
      transform: scaleX(0);
      transition: transform 0.5s ease;
    }
    
    &::before {
      top: 0;
      transform-origin: center right;
    }
    
    &:hover::before {
      transform-origin: center left;
      transform: scaleX(1);
    }
    
    &::after {
      bottom: 0;
      transform-origin: center left;
    }
    
    &:hover::after {
      transform-origin: center right;
      transform: scaleX(1);
    }
  }
}
</style>