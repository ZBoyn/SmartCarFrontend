<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, getUserList, resetUserPassword, updateUser } from '#/api';
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
      </template>
    </Grid>
    <AssignRole
      :user="currentUser"
      :visible="assignRoleVisible"
      @update:visible="assignRoleVisible = $event"
      @success="onRefresh"
    />
  </Page>
</template>
