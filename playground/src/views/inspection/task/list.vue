<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { InspectionTaskApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Radio } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteTask, getTaskList, updateTask } from '#/api';
import { useUserData } from '#/composables';
import { $t } from '#/locales';

import CalendarView from './calendar.vue';
import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const viewMode = ref('calendar');

const selectedRows = ref<InspectionTaskApi.Task[]>([]);

// 初始化用户数据
const { fetchUserList } = useUserData();

onMounted(() => {
  fetchUserList();
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
    case 'change-status': {
      onChangeStatus(e.row);
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

/**
 * 修改任务状态
 * @param row 任务行数据
 */
async function onChangeStatus(row: InspectionTaskApi.Task) {
  const statusOptions = [
    { label: '待执行', value: 0 },
    { label: '执行中', value: 1 },
    { label: '已完成', value: 2 },
    { label: '已取消', value: 3 },
  ];

  const currentStatus = statusOptions.find((opt) => opt.value === row.status);

  // 简单的状态循环：待执行 -> 执行中 -> 已完成 -> 待执行
  let newStatus: number;
  if (row.status === 0) {
    newStatus = 1;
  } else if (row.status === 1) {
    newStatus = 2;
  } else {
    newStatus = 0;
  }
  const newStatusLabel = statusOptions.find(
    (opt) => opt.value === newStatus,
  )?.label;

  try {
    await confirm(
      `你要将${row.taskName}的状态从【${currentStatus?.label}】修改为【${newStatusLabel}】吗？`,
      `修改状态`,
    );

    await updateTask(row.taskId, { ...row, status: newStatus });
    message.success(`状态已修改为【${newStatusLabel}】`);
    onRefresh();
  } catch (error) {
    if (error instanceof Error && error.message !== '已取消') {
      message.error('状态修改失败');
    }
  }
}
</script>
<template>
  <Page auto-content-height>
    <div class="mb-3 flex justify-center">
      <Radio.Group v-model:value="viewMode" button-style="solid">
        <Radio.Button value="calendar">日历视图</Radio.Button>
        <Radio.Button value="list">列表视图</Radio.Button>
      </Radio.Group>
    </div>
    <template v-if="viewMode === 'list'">
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
    </template>
    <template v-else>
      <CalendarView />
    </template>
  </Page>
</template>
