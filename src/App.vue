<template>
  <div id="app" :style="isWhite ? 'background:#fff' : ''">
    <Header v-if="show" />
    <router-view class="layout" />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import Header from './components/header';

  export default {
    name: 'app',
    components: {
      Header,
    },
    computed: {
      ...mapState('common', ['isEditing']),
      show () {
        return !(this.$route.name === 'question' || this.$route.name === 'article');
      },
      isWhite () {
        return this.$route.path === '/' || this.$route.path === '/courses';
      },
    },
    created () {
      this.updateUserInfo();
    },
    mounted () {
      this.getAllTags();
      this.getAllCourses();
    },
    updated () {
      this.updateUserInfo();
    },
    methods: {
      ...mapActions('tags', [
        'getAllTags',
        'getAllCourses',
      ]),
      ...mapActions('course', [
        'getAllCourses',
      ]),
      updateUserInfo () {
        if (localStorage.getItem('username')) {
          const info = {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token'),
            avatar: localStorage.getItem('avatar'),
            major: localStorage.getItem('major'),
            message: localStorage.getItem('message'),
            code: 200,
          };
          this.$store.commit('user/setUserInfo', info);
        }
      },
    },
  };
</script>

<style lang="less">
  @import './styles/index.less';
</style>
