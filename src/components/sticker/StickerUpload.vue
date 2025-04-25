<template>
  <div class="sticker-upload">
    <el-card shadow="hover">
      <template #header>
        <div class="upload-header">
          <h3>上传表情包</h3>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <el-form-item label="上传图片 (最大 10MB)" prop="file">
          <el-upload
              class="upload-container"
              drag
              action=""
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :before-upload="beforeUpload"
          >
            <el-icon class="el-icon--upload">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                请上传图片文件，且大小不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <div class="preview-container" v-if="previewUrl">
            <h4>预览</h4>
            <div class="preview-image-container">
              <img w-full :src="previewUrl" alt="Preview Image" class="preview-image"/>
              <!--              <el-image :src="previewUrl" fit="fill" class="preview-image"/>-->
            </div>
            <div class="preview-info" v-if="previewInfo">
              <p>文件名：{{ previewInfo.fileName }}</p>
              <p>文件大小：{{ previewInfo.fileSize }}</p>
              <p>图片尺寸：{{ previewInfo.width }} x {{ previewInfo.height }}</p>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              @click="submitUpload"
              :loading="uploading"
              :disabled="!formData.file"
          >
            上传表情包
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useStickerStore} from '@/store/stickerStore';
import {UploadFilled} from '@element-plus/icons-vue';
import {ElMessage, FormInstance, FormRules, UploadFile} from 'element-plus';
import {formatFileSize} from '@/utils/format';

const router = useRouter();
const stickerStore = useStickerStore();

const formRef = ref<FormInstance>();
const fileList = ref<UploadFile[]>([]);
const previewUrl = ref<string>('');
const previewInfo = ref<{
  fileName: string;
  fileSize: string;
  width: number;
  height: number;
} | null>(null);
const availableTags = ref<string[]>([]);
const uploading = ref(false);

const formData = reactive({
  file: null as File | null,
  content: '',
  tags: [] as string[]
});

const rules: FormRules = {
  file: [
    {required: true, message: '请上传表情包图片', trigger: 'change'}
  ]
  // 移除了content和tags的必填验证规则
};

// 处理文件变更
const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw as File;
  if (!file) return;

  formData.file = file;

  // 生成预览
  previewUrl.value = URL.createObjectURL(file);

  // 创建图片对象以获取尺寸
  const img = new Image();
  img.onload = () => {
    previewInfo.value = {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      width: img.width,
      height: img.height
    };
  };
  img.src = previewUrl.value;
};

// 移除文件
const handleFileRemove = () => {
  formData.file = null;
  previewUrl.value = '';
  previewInfo.value = null;
};

// 文件上传前的验证
const beforeUpload = (file: File) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }

  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!');
    return false;
  }

  return true;
};

// 提交表单
const submitUpload = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid, fields) => {
    if (valid && formData.file) {
      uploading.value = true;
      try {
        const result = await stickerStore.upload(
            formData.file,
            formData.content,
            formData.tags
        );

        if (result) {
          resetForm();

          // 强制刷新表情包列表数据
          await stickerStore.fetchStickers(true);

          // 跳转到首页
          router.push('/');
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        uploading.value = false;
      }
    } else {
      console.log('validation failed', fields);
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.file = null;
  formData.content = '';
  formData.tags = [];
  fileList.value = [];
  previewUrl.value = '';
  previewInfo.value = null;
};

// 组件挂载时获取所有标签
onMounted(async () => {
  if (stickerStore.availableTags.length === 0) {
    await stickerStore.fetchAllTags();
  }
  availableTags.value = stickerStore.availableTags;
});
</script>

<style lang="scss" scoped>
.sticker-upload {
  max-width: 800px;
  margin: 0 auto;

  .upload-header {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .upload-container {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
      }
    }
  }

  .preview-container {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
    border: 1px dashed var(--el-border-color);
    text-align: center;

    h4 {
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .preview-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      max-height: 300px;
      overflow: hidden;

      .preview-image {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
      }
    }

    .preview-info {
      margin-top: 16px;
      text-align: left;

      p {
        margin: 5px 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>