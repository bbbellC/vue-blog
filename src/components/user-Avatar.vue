<template>
  <div class="user-avatar">
    <div
      v-if="url"
      :style="_style"
      class="url-avatar"
      @click="onClick" />
    <CAvatar v-else-if="name" :value="name[0]" />
    <i v-else class="iconfont icon-user" :style="_iconStyle" @click="onClick" />
  </div>
</template>

<script>
  import CAvatar from './c-avatar';

  export default {
    components: {
      CAvatar,
    },
    props: {
      id: [Number, String],
      url: String,
      size: String,
      name: String,
    },
    computed: {
      _style () {
        let styles = '';
        if (this.url) styles += `background-image: url(${this.url});`;
        if (this.size) styles += `width: ${this.size}; height: ${this.size};`
        return styles;
      },
      _iconStyle () {
        let styles = '';
        if (this.size) styles += `
          width: ${this.size};
          height: ${this.size};
          font-size: ${this.size};
          line-height: ${this.size};`
        return styles;
      },
    },
    methods: {
      onClick () {
        if (this.id) this.$router.push(`/u/${this.id}`);
      },
    },
  };
</script>

<style lang="less">
.user-avatar {
  .url-avatar {
    width: 2.5rem;
    height: 2.5rem;
    margin: 10px;
    border-radius: 50%;
    position: relative;
    display: inline-block;
    background-position: 50%;
    background-size: cover;
    background-repeat: no-repeat;
    background-color: #eee;
    cursor: pointer;
  }

  .icon-user {
    width: 32px;
    height: 32px;
    font-size: 32px;
    position: relative;
    margin: 10px;
    line-height: 32px;
    margin-right: 12px;
    cursor: pointer;
  }
}
</style>