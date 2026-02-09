<template>
  <!-- 登录弹窗 -->
  <el-dialog v-model="showLoginDialog" title="用户登录" width="400px" :before-close="handleClose" center>
    <div class="login-dialog-content">
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px" class="login-form">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="loginForm.userName" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" clearable show-password />
        </el-form-item>
        <el-form-item label="记住我" prop="remember">
          <el-switch v-model="loginForm.remember" />
        </el-form-item>
      </el-form>

      <div class="login-actions">
        <el-button type="primary" @click="handleLogin" class="login-btn"> 登录 </el-button>
        <el-button @click="showLoginDialog = false" class="cancel-btn"> 取消 </el-button>
      </div>

      <div class="login-footer">
        <div class="other-login-ways">
          <span>其他登录方式：</span>
          <el-icon class="login-icon">
            <ChatDotRound />
          </el-icon>
          <el-icon class="login-icon">
            <Message />
          </el-icon>
          <el-icon class="login-icon">
            <UserFilled />
          </el-icon>
        </div>
        <div class="register-link">没有账号？<span class="link" @click="handleRegister">立即注册</span></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ChatDotRound, Message, UserFilled } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElNotification } from "element-plus";
import { login } from "@/api/auth.ts";
import { useUserStore } from "@/store/modules/user.ts";
import { saveData } from "@/utils/dataSave.ts";
const userStore = useUserStore();

// 控制登录弹窗显示
const showLoginDialog = ref(false);

// 登录表单
const loginForm = ref({
  password: "1",
  userName: "CCCC",
  remember: true,
});
// 表单引用
const loginFormRef = ref<FormInstance>();

// 表单验证规则
const loginRules = reactive<FormRules>({
  userName: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;


  await loginFormRef.value.validate().then(async (valid) => {
    if (!valid) return;
    console.log("表单验证通过");
    const { code, data } = await login(loginForm.value);
    console.log("登录结果", code, data);
    if (code === 200) {
      ElNotification.success("登录成功");
      const { token, user } = data;
      const userData = {
        token,
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        nickName: user.nickName,
        avatar: user.avatar,
        createTime: user.createTime,
        permission: ["add", "delete", "show", "operate"],
      };
      Object.assign(userStore, userData);
      console.log("用户信息", userData);
      try {
        saveData("userData", userData);
      } catch (error) {
        console.log(error);
      }
      showLoginDialog.value = false;
    }
  });
};

// 处理弹窗关闭
const handleClose = (done: () => void) => {
  // 可以添加确认关闭的逻辑
  if (loginForm.value.userName || loginForm.value.password) {
    // 如果有输入内容，可以提示用户
    ElNotification.info("登录信息未保存");
  }
  done();
};

// 处理注册
const handleRegister = () => {
  ElNotification.info("跳转到注册页面");
  // 这里可以实现跳转到注册页面的逻辑
  // router.push('/register');
  showLoginDialog.value = false;
};

function init() {
  showLoginDialog.value = true;
}

defineExpose({
  init,
});
</script>
<style scoped lang="scss">
// 登录弹窗样式
.login-dialog-content {
  padding: 10px 20px;
}

.login-form {
  margin-bottom: 20px;
}

.login-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;

  .login-btn {
    width: 120px;
  }

  .cancel-btn {
    width: 120px;
  }
}

.login-footer {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 15px;

  .other-login-ways {
    margin-bottom: 15px;

    .login-icon {
      margin: 0 8px;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .register-link {
    font-size: 14px;

    .link {
      color: #409eff;
      cursor: pointer;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .account-manage-user {
    width: calc(100% - 20px);
    padding: 10px;
  }

  .un-login {
    .user-icon-box {
      width: 50px;
      height: 50px;

      .user-icon {
        width: 30px;
        height: 30px;
      }
    }

    .un-login-right {
      .user-login {
        font-size: 16px;
      }

      .user-tip {
        font-size: 13px;
      }
    }
  }
}
</style>
