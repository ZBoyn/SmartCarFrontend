<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemParamApi } from '#/api/system/param';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus, RotateCw } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteParam, getParamList } from '#/api/system/param';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const selectedRows = ref<SystemParamApi.SystemParam[]>([]);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

function normalizeIsBuiltIn(row: SystemParamApi.SystemParam) {
  if (typeof row.isBuiltIn === 'string') {
    if (row.isBuiltIn === '1') {
      row.isBuiltIn = 1;
    } else if (row.isBuiltIn === '0') {
      row.isBuiltIn = 0;
    } else {
      row.isBuiltIn = undefined;
    }
  }
}

function onActionClick(e: OnActionClickParams<SystemParamApi.SystemParam>) {
  normalizeIsBuiltIn(e.row);
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

function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

function onEdit(row?: SystemParamApi.SystemParam) {
  if (!row) return;
  normalizeIsBuiltIn(row);
  formDrawerApi.setData(row).open();
}

function onDelete(row?: SystemParamApi.SystemParam) {
  if (!row) return;
  normalizeIsBuiltIn(row);
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.configName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteParam(row.configId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.configName]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

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
          return await getParamList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'configId',
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
    },
    onCheckboxChange: ({
      records,
    }: {
      records: SystemParamApi.SystemParam[];
    }) => {
      selectedRows.value = records;
    },
  } as VxeTableGridOptions<SystemParamApi.SystemParam>,
});

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

    await Promise.all(
      selectedRows.value.map((row) => deleteParam(row.configId)),
    );

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

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onEditSelected() {
  if (selectedRows.value.length === 1) {
    onEdit(selectedRows.value[0]);
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.param.list')">
      <template #toolbar-tools>
        <Button @click="onRefresh">
          <RotateCw class="size-5" />
          {{ $t('common.refresh') }}
        </Button>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.param.name')]) }}
        </Button>
        <Button @click="onEditSelected" :disabled="selectedRows.length !== 1">
          {{ $t('ui.actionTitle.edit') }}
        </Button>
        <Button
          danger
          @click="onBatchDelete"
          :disabled="selectedRows.length === 0"
        >
          {{ $t('ui.actionTitle.batchDelete') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
