<template>
  <div class="setting">
    <div class="userinfo">
      <h2>个人资料</h2>
      <ul>
        <li>
          <span class="label">头像</span>
          <img v-if="url" :src="url" class="avatar-img" />
          <i v-else class="iconfont icon-user" />
          <Upload
            ref="upload"
            class="upload-btn"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            action="http:///127.0.0.1:8086/user/avatar">
            <Button type="primary">点击上传</Button>
          </Upload>
        </li>
        <li>
          <span class="label">用户名</span>
          <div class="content" v-click-outside="onNameOutside">
            <Input ref="nameInput" v-model="usernameInput" :readonly="!isEditingName" placeholder="请填写您的用户名" />
            <div v-if="isEditingName" class="btn-container">
              <span class="bright-btn" @click="handleSave('name')" >保存</span>
              <span class="muted-btn" @click="onCancel('name')">取消</span>
            </div>
            <div v-else class="btn" @click="onEdit('name')"><Icon type="md-create" />编辑</div>
          </div>
        </li>
        <li>
          <span class="label">密码</span>
          <div class="content" :style="isEditingPw ? 'display:block' : ''">
            <div v-if="isEditingPw">
              <Form ref="pwForm" :model="pwForm" :rules="pwRules" :label-width="80">
                <FormItem label="原密码" prop="old">
                  <Input ref="pwInput" v-model="pwForm.old" type="password" password placeholder="请填写您的原密码" />
                </FormItem>
                <FormItem label="新密码" prop="pw">
                  <Input v-model="pwForm.pw" type="password" password placeholder="请填写您的新密码" />
                </FormItem>
                <FormItem label="重复新密码" prop="again">
                  <Input v-model="pwForm.again" type="password" password @on-blur="checkAgain" placeholder="请重复您的新密码" />
                </FormItem>
              </Form>
              <div class="btn-container" style="float: right">
                <span class="bright-btn" @click="handleSave('pw')" >保存</span>
                <span class="muted-btn" @click="onCancel('pw')">取消</span>
              </div>
            </div>
            <template v-else>
              <Input :readonly="true" placeholder="******" />
              <div class="btn" @click="onEdit('pw')"><Icon type="md-create" />修改</div>
            </template>
          </div>
        </li>
        <li>
          <span class="label">专业</span>
          <div class="content" v-click-outside="onMajorOutside">
            <Input ref="majorInput" v-model="majorInput" :readonly="!isEditingMajor" placeholder="请填写您的专业" />
            <div v-if="isEditingMajor" class="btn-container">
              <span class="bright-btn" @click="handleSave('major')" >保存</span>
              <span class="muted-btn" @click="onCancel('major')">取消</span>
            </div>
            <div v-else class="btn" @click="onEdit('major')"><Icon type="md-create" />编辑</div>
          </div>
        </li>
        <li>
          <span class="label">留言</span>
          <div class="content" v-click-outside="onMessageOutside">
            <Input ref="messageInput" v-model="messageInput" :readonly="!isEditingMessage" placeholder="填写您想分享的信息.." />
            <div v-if="isEditingMessage" class="btn-container">
              <span class="bright-btn" @click="handleSave('message')" >保存</span>
              <span class="muted-btn" @click="onCancel('message')">取消</span>
            </div>
            <div v-else class="btn" @click="onEdit('message')"><Icon type="md-create" />编辑</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import vClickOutside from 'v-click-outside';

  export default {
    directives: {
      clickOutside: vClickOutside.directive,
    },
    data () {
      return {
        image: '',
        url: '',
        isEditingName: false,
        isEditingMajor: false,
        isEditingMessage: false,
        isEditingPw: false,
        usernameInput: '',
        majorInput: '',
        messageInput: '',
        pwForm: {},
        pwRules: {
          old: [
            { required: true, message: '请填写您的原密码', trigger: 'blur' }
          ],
          pw: [
            { required: true, message: '请填写您的新密码', trigger: 'blur' }
          ],
          again: [
            { required: true, message: '请重复您的新密码', trigger: 'blur' }
          ],
        },
      };
    },
    computed: {
      ...mapState('user', ['userInfo']),
      headers () {
        const token = localStorage.getItem('token');
        return {
          Authorization: 'Bearer ' + token,
        };
      },
    },
    mounted () {
      this.url = this.userInfo.avatar;
      this.usernameInput = this.userInfo.username;
      this.majorInput = this.userInfo.major;
      this.messageInput = this.userInfo.message;
    },
    methods: {
      ...mapActions('user', [
        'updateUsername',
        'updateUserPw',
        'updateUserMajor',
        'updateUserMessage',
      ]),
      async handleSuccess (res) { //file
        if (res.code === 200) {
          this.url = res.url;
          this.$store.commit('user/setUserAvatar', { url: res.url });
        } 
      },
      handleFormatError () {
        this.$Message.error('请选择jpg、jpeg、png格式的图片！');
        return false;
      },
      handleMaxSize () {
        this.$Message.error('上传图片不得超过2048kb，请重新选择！');
        return false;
      },
      handleBeforeUpload () {
      },
      async handleSave (type) {
        switch (type) {
          case 'name': {
            if (this.usernameInput === this.userInfo.username) {
              this.isEditingName = false;
              return;
            }
            await this.updateUsername({ username: this.usernameInput });
            this.isEditingName = false;
            break;
          }
          case 'major': {
            if (this.majorInput === this.userInfo.major) {
              this.isEditingMajor = false;
              return;
            }
            await this.updateUserMajor({ major: this.majorInput });
            this.isEditingMajor = false;
            break;
          }
          case 'message': {
            if (this.messageInput === this.userInfo.message) {
              this.isEditingMessage = false;
              return;
            }
            await this.updateUserMessage({ message: this.messageInput });
            this.isEditingMessage = false;
            break;
          }
          case 'pw': {
            this.$refs.pwForm.validate(async (valid) => {
              if (this.pwForm.pw !== this.pwForm.again) {
                this.$Message.error(`两次输入的新密码不相同！`);
                return;
              }
              if (valid) {
                const data = await this.updateUserPw({
                  old: this.pwForm.old,
                  pw: this.pwForm.pw,
                });
                
                if (data.code === 0) {
                  this.$Message.error(data.message);
                  return;
                }
                if (data.code === 200) {
                  this.$Message.success('成功修改密码！');
                  this.isEditingPw = false;
                  this.pwForm = {};
                }
              }
            });
          }
        }
      },
      onEdit (type) {
        switch (type) {
          case 'name': {
            this.isEditingName = true;
            this.$refs.nameInput.focus();
            break;
          }
          case 'major': {
            this.isEditingMajor = true;
            this.$refs.majorInput.focus();
            break;
          }
          case 'message': {
            this.isEditingMessage = true;
            this.$refs.messageInput.focus();
            break;
          }
          case 'pw': {
            this.isEditingPw = true;
            this.$nextTick(function () {
              this.$refs.pwInput && this.$refs.pwInput.focus();
            });
            break;
          }
        }
      },
      onCancel (type) {
        switch (type) {
          case 'name': {
            this.isEditingName = false;
            this.usernameInput = this.userInfo.username;
            break;
          }
          case 'major': {
            this.isEditingMajor = false;
            this.majorInput = this.userInfo.major;
            break;
          }
          case 'message': {
            this.isEditingMessage = false;
            this.messageInput = this.userInfo.message;
            break;
          }
          case 'pw': {
            this.isEditingPw = false;
            break;
          }
        }
      },
      onNameOutside () {
        if (this.isEditingName === true) {
          this.isEditingName = false;
          this.usernameInput = this.userInfo.username;
        }
      },
      onMajorOutside () {
        if (this.isEditingMajor === true) {
          this.isEditingMajor = false;
          this.majorInput = this.userInfo.major;
        }
      },
      onMessageOutside () {
        if (this.isEditingMessage === true) {
          this.isEditingMessage = false;
          this.messageInput = this.userInfo.message;
        }
      },
      checkAgain () {
        if (this.pwForm.pw !== this.pwForm.again) {
          this.$Message.error(`两次输入的新密码不相同！`);
        }
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.setting {
  padding: 2rem 0;
  margin: 0 auto;
  
  .userinfo {
    padding: 20px 40px;
    background-color: #fff;
    box-shadow: @box-shadow;

    .icon-user {
      font-size: 4rem;
    }

    h2 {
      margin: 1rem 0;
    }

    li {
      display: flex;
      align-items: center;
      padding: 2rem 0;
      list-style: none;
      border-top: 1px solid #f1f1f1;

      .label {
        width: 10rem;
      }

      .content {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex: 1;

        .input {
          flex: 1;
          display: inline-block;
        }

        input {
          border: none;

          &:focus {
            box-shadow: none;
            border-bottom: 1px solid @primary-color;
            border-radius: 0;
          }
        }

        .btn {
          width: 5rem;
          margin-left: 2rem;
          color: @primary-color;
          cursor: pointer;

          &:hover {
            color: @light-primary;
          }

          .ivu-icon {
            padding-right: 5px;
          }
        }

        .btn-container {
          width: 6rem;
          margin-left: 2rem;

          .bright-btn {
            display: inline-block;
            margin-right: 1rem;
            color: @primary-color;
            cursor: pointer;

            &:hover {
              color: @light-primary;
            }
          }

          .muted-btn {
            display: inline-block;
            cursor: pointer;
            &:hover {
              color: rgba(81, 90, 110, .8);
            }
          }
        }
      }
    }

    .avatar-img {
      display: inline-block;
      width: 100px;
      height: 100px;
    }

    .upload-btn {
      margin-left: 5rem;
    }
  }
}

@media (min-width: 768px) {
  .setting {
    width: 600px;
  }
}
@media (min-width: 992px) {
  .setting {
    width: 800px;
  }
}
@media (min-width: 1200px) {
  .setting {
    width: 1140px;
  }
}
</style>