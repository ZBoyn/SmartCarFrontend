<script setup lang="ts">
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { SvgDownloadIcon } from '@vben/icons';

import { Button, Image, message, Modal, Spin, Tag } from 'ant-design-vue';
import MarkdownIt from 'markdown-it';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { gridOptions, useGridFormSchema } from './data';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions,
});

// AI分析相关状态
const isModalVisible = ref(false);
const isAnalyzing = ref(false);
const analysisResult = ref('');
const currentDefect = ref<any>(null);

// markdown-it 实例
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});
const renderedResult = computed(() => md.render(analysisResult.value || ''));

// Dify API配置
const DIFY_BASE_URL = 'https://api.dify.ai/v1';
const DIFY_API_KEY = 'app-d4Dk9NPQ33gRSlRbUeBoDt6T';

function isVerifiedTrue(val: any) {
  return val === 1 || val === '1' || val === '是' || val === true;
}

// 获取缺陷图片URL
function getDefectImageUrl(defect: any): null | string {
  if (!defect.imageUrls) return null;

  if (Array.isArray(defect.imageUrls)) {
    return defect.imageUrls[0];
  }

  if (typeof defect.imageUrls === 'string') {
    return defect.imageUrls.split(',')[0];
  }

  return null;
}

// 打开AI分析模态窗口
async function openAiAnalysis(defect: any) {
  currentDefect.value = defect;
  isModalVisible.value = true;
  analysisResult.value = '正在分析图片，请稍候...';

  // 直接开始分析
  await analyzeDefectImage(defect);
}

// 关闭模态窗口
function closeModal() {
  isModalVisible.value = false;
  currentDefect.value = null;
  analysisResult.value = '';
}

// 分析缺陷图片
async function analyzeDefectImage(defect: any) {
  const imageUrl = getDefectImageUrl(defect);
  if (!imageUrl) {
    analysisResult.value = '错误：该缺陷没有图片，无法进行分析。';
    return;
  }

  isAnalyzing.value = true;
  analysisResult.value = '步骤 1/2: 正在获取图片...';

  try {
    // 步骤 1: 从URL获取图片并上传到Dify
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`无法获取图片: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    const file = new File([imageBlob], 'defect-image.jpg', {
      type: 'image/jpeg',
    });

    analysisResult.value = '步骤 2/2: 正在上传图片至 Dify...';

    // 上传文件到 Dify 文件系统
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('user', 'frontend-user-123');

    const uploadResponse = await fetch(`${DIFY_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `文件上传失败! 状态: ${uploadResponse.status}, 响应: ${errorText}`,
      );
    }

    const uploadedFile = await uploadResponse.json();

    analysisResult.value = '步骤 3/3: 正在请求 AI 分析...';

    // 运行工作流，传入文件对象
    const fileInput = {
      type: 'image',
      transfer_method: 'local_file',
      upload_file_id: uploadedFile.id,
    };

    const workflowResponse = await fetch(`${DIFY_BASE_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          fault_image: fileInput,
        },
        response_mode: 'blocking',
        user: 'frontend-user-123',
      }),
    });

    if (!workflowResponse.ok) {
      const errorText = await workflowResponse.text();
      throw new Error(
        `工作流调用失败! 状态: ${workflowResponse.status}, 响应: ${errorText}`,
      );
    }

    const resultData = await workflowResponse.json();

    // 根据 Dify v0.6+ 的返回结构进行解析
    analysisResult.value =
      resultData &&
      resultData.data &&
      resultData.data.outputs &&
      resultData.data.outputs.text
        ? resultData.data.outputs.text
        : `分析完成，但未找到预期的报告内容。\n\n原始返回数据：\n${JSON.stringify(
            resultData,
            null,
            2,
          )}`;
  } catch (error: any) {
    console.error('API 请求失败:', error);
    analysisResult.value = `分析失败，请检查浏览器控制台获取错误信息。\n\n${error.message}`;
  } finally {
    isAnalyzing.value = false;
  }
}

function onExport() {
  try {
    // 获取当前表格的数据
    const tableData = gridApi.grid.getTableData();
    if (
      !tableData ||
      !tableData.tableData ||
      tableData.tableData.length === 0
    ) {
      message.warning('没有数据可导出');
      return;
    }
    // 获取列配置
    const columns = gridApi.grid.getColumns();
    const exportColumns = columns.filter(
      (col) => !['action', 'checkbox'].includes(col.field),
    );
    // 准备CSV数据
    const headers = exportColumns.map((col) => col.title).join(',');
    const rows = tableData.tableData.map((row) => {
      return exportColumns
        .map((col) => {
          let value = row[col.field];
          // 处理特殊字段
          if (col.field === 'isVerified') {
            value = isVerifiedTrue(value) ? '是' : '否';
          }
          // 处理包含逗号的值
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          return value || '';
        })
        .join(',');
    });
    const csvContent = [headers, ...rows].join('\n');
    // 创建下载链接
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `缺陷列表_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  } catch (error) {
    console.error('导出错误:', error);
    message.error('导出失败，请检查控制台错误信息');
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="缺陷列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onExport">
          <SvgDownloadIcon class="size-5" />
          导出
        </Button>
      </template>
      <template #imageUrls="{ row }">
        <Image
          v-if="row.imageUrls"
          :src="
            Array.isArray(row.imageUrls)
              ? row.imageUrls[0]
              : row.imageUrls.split(',')[0]
          "
          height="30"
          width="30"
        />
      </template>
      <template #isVerified="{ row }">
        <Tag :color="isVerifiedTrue(row.isVerified) ? 'green' : 'red'">
          {{ isVerifiedTrue(row.isVerified) ? '是' : '否' }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Button type="primary" size="small" @click="openAiAnalysis(row)">
          请求维修建议
        </Button>
      </template>
    </Grid>

    <!-- AI分析模态窗口 -->
    <Modal
      v-model:open="isModalVisible"
      title="AI 维修建议分析"
      width="800px"
      :footer="null"
      @cancel="closeModal"
      :body-style="{ background: '#222', padding: '24px 24px 16px 24px' }"
      wrap-class-name="ai-modal-dark"
    >
      <div v-if="currentDefect" class="mb-4">
        <h3 class="mb-2 text-lg font-medium" style="color: #fff">缺陷信息</h3>
        <div class="defect-info-box">
          <p><strong>任务名称:</strong> {{ currentDefect.taskId }}</p>
          <p><strong>缺陷类型:</strong> {{ currentDefect.defectType }}</p>
          <p><strong>严重程度:</strong> {{ currentDefect.severity }}</p>
          <p>
            <strong>缺陷位置:</strong> {{ currentDefect.distanceFromOrigin }}
          </p>
        </div>
      </div>

      <div class="analysis-result">
        <Spin :spinning="isAnalyzing" tip="AI分析中，请稍候...">
          <div
            class="analysis-content markdown-body"
            v-html="renderedResult"
          ></div>
        </Spin>
      </div>
    </Modal>
  </Page>
</template>

<style scoped>
.analysis-result {
  margin-top: 20px;
}

.defect-info-box {
  padding: 12px 18px;
  margin-bottom: 10px;
  font-size: 15px;
  color: #fff;
  background: #333;
  border-radius: 6px;
}

.analysis-content {
  min-height: 200px;
  padding: 18px 18px 10px;
  overflow-x: auto;
  font-size: 16px;
  line-height: 1.7;
  color: #f5f5f5;
  word-break: break-word;
  background-color: #222;
  border: 1px solid #444;
  border-radius: 8px;
}

/* markdown 标题、列表等美化 */
.analysis-content h1,
.analysis-content h2,
.analysis-content h3,
.analysis-content h4 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #ffd700;
}

.analysis-content strong {
  color: #ffb300;
}

.analysis-content ul,
.analysis-content ol {
  margin-left: 1.5em;
}

.analysis-content blockquote {
  padding-left: 1em;
  margin: 0.5em 0;
  color: #aaa;
  background: #292929;
  border-left: 4px solid #888;
}

.analysis-content code {
  padding: 2px 4px;
  color: #ffb300;
  background: #333;
  border-radius: 3px;
}
</style>
