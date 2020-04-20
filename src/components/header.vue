<template>
  <div class="c-header" id="_header">
    <Menu mode="horizontal" :theme="theme" active-name="2">
      <div class="login-container">
        <template v-if="isLogin">
          <Dropdown>
            <Button type="text">
              创作
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="goToArticle">写文章</DropdownItem>
              <DropdownItem @click.native="goToQuestion">提问题</DropdownItem>
              <DropdownItem @click.native="goToDraft">草稿</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-end" style="margin-left:1rem">
            <UserAvatar :url="userInfo.avatar" />
            <!-- <CAvatar v-else class="avatar" :value="userInfo.username[0]" /> -->
            <DropdownMenu slot="list">
              <DropdownItem @click.native="goToSetting">设置</DropdownItem>
              <DropdownItem divided @click.native="onLogoutClick">退出</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>
        <template v-else>
          <Button type="text" @click="onLoginClick">登陆</Button>
          <Button type="primary" @click="onRegisterClick">注册</Button>
        </template>
      </div>
      <template>
        <MenuItem name="2" to="/">
          <Icon type="ios-people" />
          首页
        </MenuItem>
        <MenuItem name="3" to="/courses">
          <Icon type="ios-construct" />
          课程
        </MenuItem>
        <MenuItem v-if="isLogin" name="1" :to="`/u/${userId}`" replace>
          <Icon type="ios-paper" />
          个人
        </MenuItem>
      </template>
    </Menu>
    <LoginModal :show-register="showRegisterModal" :show-login="showLoginModal" @update="updateModal" />
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  // import CBubbleBtn from './c-bubble-btn';
  // import CAvatar from './c-avatar';
  import jwt from 'jsonwebtoken';
  import UserAvatar from './user-Avatar';
  import LoginModal from './login-modal';

  export default {
    components: {
      // CBubbleBtn,
      // CAvatar,
      UserAvatar,
      LoginModal,
    },
    data () {
      return {
        theme: 'light',
        showRegisterModal: false,
        showLoginModal: false,
        sloganUrl: '/assets/images/slogan.png',
      };
    },
    computed: {
      ...mapState('user', ['userInfo']),
      isLogin () {
        return this.userInfo && this.userInfo.code === 200;
      },
      userId () {
        return this.isLogin ? jwt.decode(this.userInfo.token).userId : '';
      },
    },
    mounted () {
      this.$Message.config({
        top: 200,
        duration: 3,
      });
    },
    methods: {
      ...mapActions('user', [
        'postRegister',
        'postLogin',
      ]),
      onRegisterClick () {
        this.showLoginModal = false;
        this.showRegisterModal = true;
      },
      onLoginClick () {
        this.showLoginModal = true;
      },
      onLogoutClick () {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('code');
        localStorage.removeItem('avatar');
        localStorage.removeItem('major');
        localStorage.removeItem('message');
        this.$store.commit('user/setUserInfo', null);
        
        const curPath = this.$route.path;
        if (curPath.slice(0, 2) === '/u' || curPath === '/setting') {
          this.$router.replace('/');
        }
      },
      updateModal (infos) {
        for (let i = 0; i < infos.length; ++i) {
          const info = infos[i];
          if (info.type === 'register') this.showRegisterModal = info.value;
          else if (info.type === 'login') this.showLoginModal = info.value;
        }
      },
      goToArticle () {
        this.$router.push('/article/create');
      },
      goToQuestion () {
        this.$router.push('/question/create');
      },
      goToDraft () {
        this.$router.push('/draft');
      },
      goToSetting () {
        this.$router.push(`/setting`);
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.c-header {
  // box-shadow: 0px 1px 8px 0px rgba(0,0,0,0.05), 0 1px rgba(0,0,0,0.05);
  background: #fff;
  border-top: 2px solid @dark-green;
  box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1), 0 1px rgba(0,0,0,0.1);

  .ivu-menu-horizontal {
    margin: 0 auto;
    
    & > *{
      float: left ;
    }
    .ivu-avatar {
      margin: 14px 20px;
    }

    &.ivu-menu-light:after {
      background: none;
    }
  }

  @media (min-width: 768px) {
    .ivu-menu-horizontal {
      width: 600px;
    }
  }
  @media (min-width: 992px) {
    .ivu-menu-horizontal {
      width: 800px;
    }
  }
  @media (min-width: 1200px) {
    .ivu-menu-horizontal {
      width: 1140px;
    }
  }

  .login-container {
    float: right;
    height: inherit;
    line-height: inherit;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .avatar {
      margin: 14px 20px;
    }

    .user {
      cursor: pointer;
    }

    .ivu-icon {
      margin-right: 10px;
    }

    .user-avatar {
      display: flex;
      cursor: pointer;
    }

    .ivu-dropdown .ivu-btn-text {
      padding-right: 0;
      border-color: #dcdee2;
    }
  }

  .slogan {
    height: 60px;
    width: 200px;
    background-color: grey;
    background-image: url('../assets/images/slogan.png');
    background-size: 250px 50px;
    background-repeat: no-repeat;
  }
}
</style>