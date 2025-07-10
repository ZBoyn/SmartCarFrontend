<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus, SvgDownloadIcon, Upload } from '@vben/icons';

import { Upload as AntdUpload, Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  getUserList,
  importUsers,
  resetUserPassword,
  updateUser,
} from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import { initDepartments } from './department';
import AssignRole from './modules/assign-role.vue';
import Form from './modules/form.vue';

const selectedRows = ref<SystemUserApi.SystemUser[]>([]);

// 初始化部门数据
onMounted(async () => {
  await initDepartments();
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'userId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
    checkboxConfig: {
      checkField: 'checked',
      // checkMethod 也可以在这里定义
      checkMethod: ({ row }) => row.username !== 'admin',
    },
    // 直接将 events 块替换为 onCheckboxChange 属性
    onCheckboxChange: ({
      records,
    }: {
      records: SystemUserApi.SystemUser[];
    }) => {
      selectedRows.value = records;
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

const assignRoleVisible = ref(false);
const currentUser = ref<null | SystemUserApi.SystemUser>(null);

// 导入相关状态
const importVisible = ref(false);
const importLoading = ref(false);
const importProgress = ref(0);

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (e.code) {
    case 'assign-role': {
      onAssignRole(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'reset-password': {
      onResetPassword(e.row);
      break;
    }
  }
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: string,
  row: SystemUserApi.SystemUser,
) {
  const status: Recordable<string> = {
    '0': '禁用',
    '1': '启用',
  };
  try {
    await confirm(
      `你要将${row.username}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateUser(row.userId, { ...row, status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  // 在 setData 之前，创建一个新对象并转换数据类型
  const formData = {
    ...row,
    // 使用 toString() 确保 deptId 是字符串类型
    // 使用可选链操作符 ?. 避免 row.deptId 为 null 或 undefined 时报错
    deptId: row.deptId?.toString(),
  };
  formDrawerApi.setData(formData).open();
}

function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.username]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUser(row.userId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.username]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

async function onBatchDelete() {
  if (selectedRows.value.length === 0) {
    message.warning($t('demos.actionMessage.pleaseSelect'));
    return;
  }

  try {
    await confirm(
      $t('demos.actionMessage.batchDeleteConfirm', [selectedRows.value.length]),
      $t('demos.actionTitle.batchDelete'),
    );

    // 使用 Promise.all 并行删除所有选中的用户
    await Promise.all(selectedRows.value.map((row) => deleteUser(row.userId)));

    message.success({
      content: $t('demos.actionMessage.batchDeleteSuccess'),
      key: 'action_process_msg',
    });

    selectedRows.value = [];
    onRefresh();
  } catch (error) {
    if (error instanceof Error && error.message !== '已取消') {
      message.error($t('demos.actionMessage.batchDeleteFailed'));
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

async function onResetPassword(row: SystemUserApi.SystemUser) {
  try {
    await confirm(`确定要重置用户 ${row.username} 的密码吗？`, '重置密码');

    await resetUserPassword(row.userId);

    message.success({
      content: `用户 ${row.username} 的密码已重置`,
      key: 'action_process_msg',
    });
  } catch (error) {
    if (error instanceof Error && error.message !== '已取消') {
      message.error('重置密码失败');
    }
  }
}

function onAssignRole(row: SystemUserApi.SystemUser) {
  currentUser.value = row;
  assignRoleVisible.value = true;
}

/**
 * 导出用户数据
 */
async function onExport() {
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
      (col) => !['checkbox', 'operation'].includes(col.field),
    );

    // 准备CSV数据
    const headers = exportColumns.map((col) => col.title).join(',');
    const rows = tableData.tableData.map((row) => {
      return exportColumns
        .map((col) => {
          let value = row[col.field];

          // 处理特殊字段
          switch (col.field) {
            case 'deptId': {
              // 这里需要根据实际情况获取部门名称
              value = value || '';
              break;
            }
            case 'status': {
              value = value === '1' ? '启用' : '禁用';
              break;
            }
            // No default
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
      `用户列表_${new Date().toISOString().slice(0, 10)}.csv`,
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

/**
 * 打开导入对话框
 */
function onImport() {
  importVisible.value = true;
  importProgress.value = 0;
}

/**
 * 处理文件上传
 */
async function handleFileUpload(file: File) {
  try {
    importLoading.value = true;
    importProgress.value = 0;

    await importUsers(file, (progress) => {
      importProgress.value = progress.percent;
    });

    message.success('导入成功');
    importVisible.value = false;
    onRefresh();
  } catch (error) {
    console.error('导入错误:', error);
    message.error('导入失败，请检查文件格式是否正确');
  } finally {
    importLoading.value = false;
    importProgress.value = 0;
  }
}

/**
 * 关闭导入对话框
 */
function onImportCancel() {
  importVisible.value = false;
  importProgress.value = 0;
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer />
    <Grid :table-title="$t('system.user.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.user.username')]) }}
        </Button>
        <Button
          type="primary"
          danger
          :disabled="selectedRows.length === 0"
          @click="onBatchDelete"
        >
          {{ $t('demos.actionTitle.batchDelete') }}
        </Button>
        <Button type="primary" @click="onExport">
          <SvgDownloadIcon class="size-5" />
          {{ $t('ui.actionTitle.export') }}
        </Button>
        <Button type="primary" @click="onImport">
          <Upload class="size-5" />
          {{ $t('ui.actionTitle.import') }}
        </Button>
      </template>
    </Grid>
    <AssignRole
      :user="currentUser"
      :visible="assignRoleVisible"
      @update:visible="assignRoleVisible = $event"
      @success="onRefresh"
    />

    <!-- 导入对话框 -->
    <Modal
      v-model:open="importVisible"
      :confirm-loading="importLoading"
      :title="$t('ui.actionTitle.import')"
      @cancel="onImportCancel"
    >
      <div class="mb-4">
        <p class="mb-4 text-gray-600">
          请选择要导入的CSV文件，文件应包含以下列：用户名、昵称、手机号、部门、状态、备注
        </p>
        <AntdUpload
          accept=".csv"
          :before-upload="
            (file) => {
              handleFileUpload(file);
              return false;
            }
          "
          :show-upload-list="false"
          class="w-full"
        >
          <Button :loading="importLoading" type="primary">
            <Upload class="mr-2 size-4" />
            选择文件
          </Button>
        </AntdUpload>
      </div>

      <div v-if="importLoading" class="mb-4">
        <div class="mb-2 flex justify-between text-sm text-gray-600">
          <span>上传进度</span>
          <span>{{ importProgress }}%</span>
        </div>
        <div class="h-2 w-full rounded-full bg-gray-200">
          <div
            class="h-2 rounded-full bg-blue-600 transition-all duration-300"
            :style="{ width: `${importProgress}%` }"
          ></div>
        </div>
      </div>

      <template #footer>
        <Button @click="onImportCancel">取消</Button>
      </template>
    </Modal>
  </Page>
</template>
