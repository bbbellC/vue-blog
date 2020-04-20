<template>
  <div>
    <Modal
      v-model="showRegisterModal"
      :footer-hide="true"
      title="注册"
      class="common-modal">
      <Form ref="registerForm" :model="registerForm" :rules="registerRules" :label-width="80">
        <FormItem label="手机号" prop="phone">
          <Input v-model="registerForm.phone" placeholder="请输入您的手机号" />
        </FormItem>
        <FormItem label="用户名" prop="username">
          <Input v-model="registerForm.username" placeholder="请输入您的用户名" />
        </FormItem>
        <FormItem label="密码" prop="password">
          <Input v-model="registerForm.password" placeholder="请输入您的密码" type="password" password />
        </FormItem>
      </Form>
      <div class="btn-container">
        <Button type="text" size="large" @click="onCancelClick('registerForm')" style="margin-left: 8px">取消</Button>
        <Button type="primary" size="large" @click="handleRegister">注册</Button>
      </div>
    </Modal>
    <Modal
      v-model="showLoginModal"
      title="登陆"
      :footer-hide="true"
      class="common-modal">
      <Form ref="loginForm" :model="loginForm" :rules="loginRules" :label-width="80">
        <FormItem label="手机号" prop="phone">
          <Input v-model="loginForm.phone" placeholder="请输入您的手机号" />
        </FormItem>
        <FormItem label="密码" prop="password">
          <Input v-model="loginForm.password" placeholder="请输入您的密码" type="password" password />
        </FormItem>
      </Form>
      <div class="tip">
        没有账号？
        <span class="btn" @click="onRegisterClick">点我注册</span>
      </div>
      <div class="btn-container">
        <Button type="text" size="large" @click="onCancelClick('loginForm')" style="margin-left: 8px">取消</Button>
        <Button type="primary" size="large" @click="handleLogin">登陆</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  // import jwt from 'jsonwebtoken';

  export default {
    props: {
      showRegister: Boolean,
      showLogin: Boolean,
    },
    data () {
      return {
        showRegisterModal: false,
        showLoginModal: false,
        registerForm: {},
        loginForm: {},
        loginRules: {
          phone: [
            { required: true, message: '手机号不能为空！', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '密码不能为空！', trigger: 'blur' }
          ],
        },
        registerRules: {
          phone: [
            { required: true, message: '手机号不能为空！', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '密码不能为空！', trigger: 'blur' }
          ],
          username: [
            { required: true, message: '用户名不能为空！', trigger: 'blur' }
          ],
        },
      };
    },
    watch: {
      showRegister (val) {
        this.showRegisterModal = val;
      },
      showLogin (val) {
        this.showLoginModal = val;
      },
      showRegisterModal (val) {
        if (val === false) {
          const infos = [
            { type: 'register', value: false },
          ];
          this.$emit('update', infos);
        }
      },
      showLoginModal (val) {
        if (val === false) {
          const infos = [
            { type: 'login', value: false },
          ];
          this.$emit('update', infos);
        }
      },
    },
    computed: {
      ...mapState('user', ['userInfo']),
    },
    methods: {
      ...mapActions('user', [
        'postRegister',
        'postLogin',
      ]),
      handleRegister () {
        this.$refs.registerForm.validate(async (valid) => {
          if (valid) {
            const { code, message } = await this.postRegister(this.registerForm);
            if (code === 200) {
              this.$Message.success(message);
              this.loginForm = { ...this.registerForm };
              const infos = [
                { type: 'register', value: false },
                { type: 'login', value: true },
              ];
              this.$emit('update', infos);
              this.showRegisterModal = false;
              this.showLoginModal = true;
            } else {
              this.$Message.error(message);
              const infos = [
                { type: 'register', value: true },
              ];
              this.$emit('update', infos);
              this.showRegisterModal = true;
            }
          }
        });
      },
      handleLogin () {
        this.$refs.loginForm.validate(async (valid) => {
          if (valid) {
            // auth, username
            await this.postLogin(this.loginForm);
            const { code, message } = this.userInfo;
            // const { username } = jwt.decode(token); // , userId, auth

            if (code === 200) {
              // 处理token auth
              const infos = [
                { type: 'login', value: false },
              ];
              this.$emit('update', infos);
              this.showLoginModal = false;
            } else {
              this.$Message.error(message);
              const infos = [
                { type: 'login', value: true },
              ];
              this.$emit('update', infos);
              this.showLoginModal = true;
            }
          }
        });
      },
      onRegisterClick () {
        const infos = [
          { type: 'register', value: true },
          { type: 'login', value: false },
        ];
        this.$emit('update', infos);
        this.showRegisterModal = true;
        this.showLoginModal = false;
      },
      onCancelClick (form) {
        let infos = [];
        if (form === 'registerForm') infos.push({ type: 'register', value: false });
        else if (form === 'loginForm') infos.push({ type: 'login', value: false });
        this.$emit('update', infos);

        if (form === 'registerForm') this.showRegisterModal = false;
        else if (form === 'loginForm') this.showLoginModal = false;
      },
    },
  };
</script>