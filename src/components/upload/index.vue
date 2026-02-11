<template>
  <div class="c-upload" :class="isUrl ? 'c-upload-url' : ' '">
    <svg-icon iconName="commonSvg-切换" @click="uploadSwitch" class="upload-switch"></svg-icon>
    <div v-if="isUrl">
      <el-input v-if="!isArr" v-model="imageValue">
        <template #prepend>
          <el-icon @click="uploadSwitch">
            <Switch />
          </el-icon>
        </template>
      </el-input>
      <div v-else>
        <el-input v-for="(item, i) in imageValue" v-model="imageValue[i].url" :key="i" style="margin-bottom: 10px">
          <template #prepend>
            <el-icon @click="uploadSwitch">
              <Switch />
            </el-icon>
          </template>
          <template #append>
            <el-icon v-if="isArr" @click="addNewImageUrl"><Select /> </el-icon>
          </template>
        </el-input>
      </div>
    </div>
    <div v-else>
      <el-upload v-if="!isArr" class="c-uploader" :action="uploadAction" :show-file-list="false"
        :data="{ path: props.path }" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
        :headers="headers" crossorigin="anonymous">
        <c-image v-if="imageValue" :src="imageValue" class="avatar" />
        <el-icon v-else class="c-uploader-icon">
          <Plus />
        </el-icon>
      </el-upload>
      <el-upload v-else v-model:file-list="imageValue" :action="uploadAction" :data="{ path: props.path }"
        list-type="picture-card" :on-preview="handlePictureCardPreview" :on-success="handleSuccess" :headers="headers">
        <el-icon>
          <Plus />
        </el-icon>
      </el-upload>
    </div>
  </div>

  <el-dialog v-model="dialogVisible" style="width: 100%; height: 100%; position: absolute">
    <c-image :src="dialogImageUrl" />
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import type { UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Select, Switch } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const imageValue = ref([] as any[]);
const isArr = ref(false);
const isUrl = ref(false);
const uploadAction = `${process.env.NODE_ENV === 'development' ? '/dev-api' : '/prod-api'}/files`;

// 获取token并设置请求头
const headers = ref({
  Authorization: userStore.token ? `Bearer ${userStore.token}` : ''
});
const dialogImageUrl = ref('') as any;
const dialogVisible = ref(false);
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: null as any,
  isUrl: false as any,
  path: '' as any
});

const handleAvatarSuccess: UploadProps['onSuccess'] = (response: any) => {
  if (response.data) emit('update:modelValue', response.data);
  else ElMessage.error(('上传失败'));
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = () => {
  return true;
};

const handlePictureCardPreview: UploadProps['onPreview'] = uploadFile => {
  dialogImageUrl.value = uploadFile.url;
  dialogVisible.value = true;
};

function uploadSwitch() {
  if (isArr.value && imageValue.value.length == 0) {
    imageValue.value.push({
      id: null,
      url: '',
      createTime: ''
    });
  }
  isUrl.value = !isUrl.value;
}

function addNewImageUrl() {
  if (!isUrl.value) return;
  imageValue.value.push({
    id: null,
    url: '',
    createTime: ''
  });
  emit('update:modelValue', imageValue.value);
}

function handleSuccess(response: any) {
  let imageRelations = imageValue.value;
  imageRelations.pop();
  if (response.code === 200) {
    imageRelations.push({
      name: response.data.replace('http://120.48.127.181/file/', ''),
      url: response.data
    });
  } else {
    ElMessage.error(('图片上传失败'));
  }
  emit('update:modelValue', imageRelations);
}
onMounted(() => {
  isUrl.value = props.isUrl;
  isArr.value = Array.isArray(props.modelValue);
  if (isArr.value && props.modelValue.length == 0) {
    imageValue.value = [];
  } else {
    imageValue.value = props.modelValue;
    console.log(imageValue.value);
  }
});
watch(
  () => props.modelValue,
  val => {
    isArr.value = Array.isArray(val);
    imageValue.value = val;
  },
  { deep: true }
);

watch(
  () => imageValue,
  val => {
    emit('update:modelValue', val);
  },
  {
    deep: true
  }
);
</script>
<style lang="scss" scoped>
.upload-switch {
  z-index: 10;
  height: 18px;
  width: 18px;
  position: absolute;
  right: 5px;
  top: 5px;
  opacity: 0;
  cursor: pointer;
  transition: all 0.2s ease;

  :deep(.theme-icon) {
    fill: #dcdfe6 !important;
  }
}

.upload-switch:hover {
  opacity: 1;
}

.upload-switch:active {
  transform: translateY(2px);
}

.c-upload-url {
  width: 100%;
}

.el-icon {
  cursor: pointer;
  color: #dcdfe6 !important;
}

.el-icon:active {
  transform: translateY(2px);
}

.c-upload {
  position: relative;

  .el-input {
    width: 100%;
  }
}

.c-uploader {
  border: 2px dashed #dcdfe6;
  background: transparent;

  width: 146px;
  height: 145px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;

  :deep(.el-upload) {
    height: 100%;
    width: 100%;
  }

  .c-uploader-icon {
    font-size: 1rem;
  }
}
</style>
