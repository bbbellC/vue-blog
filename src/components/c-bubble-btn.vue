<template>
  <button class="c-bubble-btn">{{ text }}</button>
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

.c-bubble-btn {
  height: 32px;
  line-height: 32px;
  padding: 0 15px;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  z-index: 1;
  position: relative;
  font-size: inherit;
  font-family: inherit;
  color: @text-color;
  outline: none;
  border: none;
  background-color: @background-color-base;
  overflow: hidden;
  transition: color 0.4s ease-in-out;

  &::before {
    content: '';
    z-index: -1;
    position: absolute;
    bottom: 100%;
    right: 100%;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background-color: @link-hover-color;
    transform-origin: center;
    transform: translate3d(50%, 50%, 0) scale3d(0, 0, 0);
    transition: transform 0.45s ease-in-out;
  }

  &:hover {
    cursor: pointer;
    color: #fff;
  }

  &:hover::before {
    transform: translate3d(50%, 50%, 0) scale3d(15, 15, 15);
  }
}
</style>