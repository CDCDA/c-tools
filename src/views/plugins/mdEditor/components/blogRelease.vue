<!--
 * @Description: 博客发布/设置弹窗 (整合了编辑器的所有配置项)
-->
<template>
  <el-dialog
    class="blog-release"
    v-model="dialogVisible"
    style="max-height: 75%"
    :title="'发布设置'"
    width="600px"
    :modal="true"
    append-to-body
  >
    <el-form
      class="blog-release-settings"
      :model="blogData"
      :rules="rules"
      ref="formEl"
      label-width="5rem"
    >
      <!-- 标题 -->
      <el-form-item :label="'博客标题'" prop="blogTitle">
        <el-input
          v-model="blogData.blogTitle"
          :placeholder="'请输入博客标题'"
        ></el-input>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item :label="'博客标签'">
        <el-tag
          v-for="tag in blogData.tags"
          :key="tag.tagName"
          class="tag-item"
          :type="tag.tagType"
          :effect="tag.effect || 'dark'"
          closable
          :disable-transitions="false"
          @close="tagDel(tag)"
          style="margin-right: 5px"
        >
          {{ tag.tagName }}
        </el-tag>

        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          class="button-new-input"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button
          v-else
          class="button-new-tag"
          size="small"
          @click="showInput"
        >
          + {{ "标签" }}
        </el-button>
        <el-icon
          @click="tagVisible = true"
          style="
            font-size: 1.2rem;
            margin-left: 10px;
            cursor: pointer;
            vertical-align: middle;
          "
        >
          <Grid />
        </el-icon>
      </el-form-item>

      <!-- 分类 -->
      <el-form-item :label="'博客分类'" prop="typeId">
        <el-tree-select
          v-model="blogData.typeId"
          :data="typeList"
          check-strictly
          :props="defaultProps"
          :placeholder="'请选择分类'"
          :render-after-expand="false"
        >
          <template #default="{ data: { typeName } }"> {{ typeName }}</template>
        </el-tree-select>
      </el-form-item>

      <!-- 权限/状态设置 -->
      <el-form-item :label="'文章类型'" prop="isOriginal">
        <el-switch
          v-model="blogData.isOriginal"
          active-value="1"
          inactive-value="0"
          :active-text="'原创'"
          :inactive-text="'转载'"
        />
      </el-form-item>

      <el-form-item :label="'是否推荐'" prop="isRecommend">
        <el-switch
          v-model="blogData.isRecommend"
          active-value="1"
          inactive-value="0"
          :active-text="'推荐'"
          :inactive-text="'普通'"
        />
      </el-form-item>

      <!-- 封面 -->
      <el-form-item :label="'添加封面'">
        <upload v-model="blogData.coverUrl" path="blogCover"></upload>
      </el-form-item>

      <!-- 摘要 -->
      <el-form-item :label="'博客摘要'">
        <el-input
          v-model="blogData.blogAbstract"
          type="textarea"
          :rows="3"
          :placeholder="'请输入摘要...'"
        ></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ "取消" }}</el-button>
        <el-button type="primary" @click="submit">{{ "确定发布" }}</el-button>
      </span>
    </template>

    <!-- 内部标签选择弹窗 -->
    <el-dialog
      v-model="tagVisible"
      :title="'标签选择'"
      width="450px"
      append-to-body
    >
      <div class="tag-list-container">
        <el-tag
          v-for="tag in tagList"
          :key="tag.tagId"
          class="tag-selection-item"
          :class="{ 'is-active': tag.isActive }"
          :type="tag.tagType"
          :effect="tag.isActive ? 'dark' : 'plain'"
          @click="chooseTag(tag)"
        >
          {{ tag.tagName }}
        </el-tag>
      </div>
      <template #footer>
        <el-button @click="tagVisible = false">{{ "取消" }}</el-button>
        <el-button type="primary" @click="confirmTagSelection">{{
          "确定"
        }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

import { ElNotification } from "element-plus";
import { Grid } from "@element-plus/icons-vue";
import { saveBlog, updateBlog } from "@/api/blog.ts";
import { pageTypes } from "@/api/type.ts";
import { pageTags } from "@/api/tag.ts";
import upload from "@/components/upload/index.vue";

// --- Props & Emits ---
const props = defineProps({
  blogData: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["resetBlogData", "success"]);

// --- 响应式数据 ---
const dialogVisible = ref(false);
const tagVisible = ref(false);
const formEl = ref();
const InputRef = ref();
const inputValue = ref("");
const inputVisible = ref(false);

const typeList = ref([]);
const tagList = ref([]) as any;

const defaultProps = {
  children: "children",
  label: "typeName",
  value: "typeId",
};

const rules = {
  blogTitle: [{ required: true, message: "请输入博客标题", trigger: "blur" }],
  typeId: [{ required: true, message: "请选择博客分类", trigger: "change" }],
};

// --- 方法 ---

function open() {
  dialogVisible.value = true;
  initData();
}

function close() {
  dialogVisible.value = false;
}

async function initData() {
  getTypeTree();
  getTagList();
}

// 获取分类树
async function getTypeTree() {
  const params = { userId: props.blogData.userId };
  const { code, rows } = (await pageTypes(params)) as any;
  if (code === 200) {
    typeList.value = rows;
  }
}

// 获取系统标签列表
async function getTagList() {
  const { code, rows } = (await pageTags({})) as any;
  if (code === 200) {
    // 标记已选中的标签
    tagList.value = rows.map((tag: any) => ({
      ...tag,
      isActive: props.blogData.tags.some((t: any) => t.tagName === tag.tagName),
    }));
  }
}

// 手动输入添加标签
function handleInputConfirm() {
  if (inputValue.value) {
    const { tags } = props.blogData;
    const isExist = tags.some((x: any) => x.tagName === inputValue.value);

    if (!isExist) {
      const typeArr = ["primary", "success", "info", "warning", "danger"];
      const randomType = typeArr[Math.floor(Math.random() * typeArr.length)];
      tags.push({
        tagName: inputValue.value,
        tagType: randomType,
        effect: "dark",
      });
    } else {
      ElNotification.warning({ message: "该标签已存在", offset: 100 });
    }
  }
  inputVisible.value = false;
  inputValue.value = "";
}

function showInput() {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
}

function tagDel(tag: any) {
  const { tags } = props.blogData;
  tags.splice(tags.indexOf(tag), 1);
}

// 标签选择弹窗逻辑
function chooseTag(tag: any) {
  tag.isActive = !tag.isActive;
}

function confirmTagSelection() {
  const selectedTags = tagList.value.filter((t: any) => t.isActive);
  // 合并已选标签（去重）
  props.blogData.tags = selectedTags.map((t: any) => ({
    tagName: t.tagName,
    tagType: t.tagType || "primary",
    effect: "dark",
  }));
  tagVisible.value = false;
}

// 提交发布
async function submit() {
  if (!formEl.value) return;

  await formEl.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const isUpdate = !!props.blogData.blogId;
        const res = isUpdate
          ? await updateBlog(props.blogData)
          : await saveBlog(props.blogData);

        if (res.code === 200) {
          window.localStorage.removeItem("blogData"); // 发布成功清理草稿
          ElNotification.success({ message: "博客发布成功", offset: 100 });
          // ElMessageBox.confirm(('博客发布成功'), ('提示'), {
          //   confirmButtonText: ('前往博客'),
          //   cancelButtonText: ('写新博客'),
          //   type: 'success'
          // }).then(async () => {
          //   loadingService.show({ text: ('正在前往博客...') });
          //   const blogId = res.data || props.blogData.blogId;
          //   router.push({ name: 'blogDisplay', query: { blogId } });
          //   loadingService.hide();
          // }).catch(() => {
          //   emit('resetBlogData');
          // });

          close();
          emit("success");
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
}

defineExpose({ open, close });
</script>

<style lang="scss">
.blog-release {
  max-height: 75%;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .el-dialog__body {
    flex: 1;
    overflow: auto;
  }
}

.blog-release-settings {
  padding: 10px 20px;
}

.tag-item {
  margin-bottom: 5px;
}

.button-new-tag {
  height: 24px;
  padding-top: 0;
  padding-bottom: 0;
}

.button-new-input {
  width: 90px;
  vertical-align: middle;
}

.tag-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;

  .tag-selection-item {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &.is-active {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}

:deep(.el-upload) {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
