<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Transfer } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRoleList, updateRole } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import AssignUsers from './modules/assign-users.vue';
import Form from './modules/form.vue';

const selectedRows = ref<SystemRoleApi.SystemRole[]>([]);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 分配用户弹窗
const assignUsersVisible = ref(false);
const currentRole = ref<null | SystemRoleApi.SystemRole>(null);

// 新增 assignPermissionsVisible、currentRoleForPermissions 两个 ref 状态用于控制权限分配弹窗
const assignPermissionsVisible = ref(false);
const currentRoleForPermissions = ref<null | SystemRoleApi.SystemRole>(null);
const permissionOptions = [
  { key: 'view', title: '查看' },
  { key: 'edit', title: '编辑' },
  { key: 'delete', title: '删除' },
  { key: 'export', title: '导出' },
  { key: 'import', title: '导入' },
];
const assignedPermissions = ref<string[]>([]);

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
          return await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'roleId',
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
      checkMethod: ({ row }) => row.roleName !== 'admin',
    },
    // 直接将 events 块替换为 onCheckboxChange 属性
    onCheckboxChange: ({
      records,
    }: {
      records: SystemRoleApi.SystemRole[];
    }) => {
      selectedRows.value = records;
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
  switch (e.code) {
    case 'assign-users': {
      onAssignUsers(e.row);
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
  row: SystemRoleApi.SystemRole,
) {
  const status: Recordable<string> = {
    '0': '禁用',
    '1': '启用',
  };
  try {
    await confirm(
      `你要将${row.roleName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateRole(row.roleId, { ...row, status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRole) {
  // 在 setData 之前，创建一个新对象并转换数据类型
  const formData = {
    ...row,
    // 使用 toString() 确保 deptId 是字符串类型
    // 使用可选链操作符 ?. 避免 row.deptId 为 null 或 undefined 时报错
    deptId: row.deptId?.toString(),
  };
  formDrawerApi.setData(formData).open();
}

function onDelete(row: SystemRoleApi.SystemRole) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.roleName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteRole(row.roleId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.roleName]),
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
    await Promise.all(selectedRows.value.map((row) => deleteRole(row.userId)));

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

function onAssignUsers(row: SystemRoleApi.SystemRole) {
  currentRole.value = row;
  assignUsersVisible.value = true;
}

function onAssignPermissions(row: SystemRoleApi.SystemRole) {
  currentRoleForPermissions.value = row;
  // 演示：每次打开都随机分配部分权限
  assignedPermissions.value = permissionOptions
    .filter(() => Math.random() > 0.5)
    .map((i) => i.key);
  assignPermissionsVisible.value = true;
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer />
    <AssignUsers
      :role="currentRole"
      v-model:visible="assignUsersVisible"
      @success="onRefresh"
    />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.roleName')]) }}
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
      <template #assignPermissions="{ row }">
        <Button type="link" @click="onAssignPermissions(row)">分配权限</Button>
      </template>
    </Grid>
    <Modal
      v-model:visible="assignPermissionsVisible"
      title="分配用户权限"
      width="400px"
      :footer="null"
    >
      <Transfer
        :data-source="permissionOptions"
        v-model:target-keys="assignedPermissions"
        :titles="['可分配权限', '已分配权限']"
        :show-search="false"
        :show-select-all="false"
        :render="(item) => item.title"
      />
    </Modal>
  </Page>
</template>
