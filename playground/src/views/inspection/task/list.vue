<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { InspectionTaskApi } from '#/api';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteTask, getTaskList } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const selectedRows = ref<InspectionTaskApi.Task[]>([]);

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
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getTaskList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
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
    onCheckboxChange: ({ records }: { records: InspectionTaskApi.Task[] }) => {
      selectedRows.value = records;
    },
  } as VxeTableGridOptions<InspectionTaskApi.Task>,
});

function onActionClick(e: OnActionClickParams<InspectionTaskApi.Task>) {
  switch (e.code) {
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

function onEdit(row: InspectionTaskApi.Task) {
  // 在 setData 之前，创建一个新对象并转换数据类型
  const formData = {
    ...row,
    // 使用 toString() 确保 deptId 是字符串类型
    // 使用可选链操作符 ?. 避免 row.deptId 为 null 或 undefined 时报错
    deptId: row.deptId?.toString(),
  };
  formDrawerApi.setData(formData).open();
}

function onDelete(row: InspectionTaskApi.Task) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.taskName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteTask(row.taskId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.taskName]),
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
    await Promise.all(selectedRows.value.map((row) => deleteTask(row.taskId)));

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
</script>
<template>
  <Page auto-content-height>
    <FormDrawer />
    <Grid :table-title="$t('inspection.task.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('inspection.task.name')]) }}
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
  </Page>
</template>
