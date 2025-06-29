<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus, SvgDownloadIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMenu,
  getMenuList,
  SystemMenuApi,
  updateMenu,
} from '#/api/system/menu';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const selectedRows = ref<SystemMenuApi.SystemMenu[]>([]);
const expandedKeys = ref<string[]>([]);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          return await getMenuList(formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: { code: 'query' },
      zoom: true,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: false,
      expandAll: false,
      expandRowKeys: expandedKeys.value,
    },
    checkboxConfig: {
      checkField: 'checked',
    },
    onCheckboxChange: ({
      records,
    }: {
      records: SystemMenuApi.SystemMenu[];
    }) => {
      selectedRows.value = records;
    },
    onToggleTreeExpand: ({ row }: { row: SystemMenuApi.SystemMenu }) => {
      const key = row.id;
      const index = expandedKeys.value.indexOf(key);
      if (index === -1) {
        expandedKeys.value.push(key);
      } else {
        expandedKeys.value.splice(index, 1);
      }
    },
  } as VxeTableGridOptions,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemMenuApi.SystemMenu>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'toggle-status': {
      onToggleStatus(row);
      break;
    }
    default: {
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onAppend(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ pid: row.id }).open();
}

function onDelete(row: SystemMenuApi.SystemMenu) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenu(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

async function onToggleStatus(row: SystemMenuApi.SystemMenu) {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    await updateMenu(row.id, { ...row, status: newStatus });
    message.success(`状态已${newStatus === 1 ? '启用' : '禁用'}`);
    onRefresh();
  } catch {
    message.error('状态修改失败');
  }
}

function onExpandAll() {
  // 获取所有菜单ID并展开
  const allIds = getAllMenuIds(gridApi.grid.getTableData().tableData);
  expandedKeys.value = allIds;
  gridApi.grid.setAllTreeExpand(true);
}

function onCollapseAll() {
  expandedKeys.value = [];
  gridApi.grid.setAllTreeExpand(false);
}

function getAllMenuIds(menus: SystemMenuApi.SystemMenu[]): string[] {
  const ids: string[] = [];
  const traverse = (items: SystemMenuApi.SystemMenu[]) => {
    items.forEach((item) => {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    });
  };
  traverse(menus);
  return ids;
}

async function onBatchDelete() {
  if (selectedRows.value.length === 0) {
    message.warning('请选择要删除的菜单');
    return;
  }

  try {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        content: `确定要删除选中的 ${selectedRows.value.length} 个菜单吗？`,
        onCancel() {
          reject(new Error('已取消'));
        },
        onOk() {
          resolve(true);
        },
        title: '批量删除',
      });
    });

    // 使用 Promise.all 并行删除所有选中的菜单
    await Promise.all(selectedRows.value.map((row) => deleteMenu(row.id)));

    message.success({
      content: '批量删除成功',
      key: 'action_process_msg',
    });

    selectedRows.value = [];
    onRefresh();
  } catch (error) {
    if (error instanceof Error && error.message !== '已取消') {
      message.error('批量删除失败');
    }
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
            case 'meta.title': {
              value = row.meta?.title || '';

              break;
            }
            case 'status': {
              value = value === 1 ? '启用' : '禁用';

              break;
            }
            case 'type': {
              const typeMap = {
                catalog: '目录',
                menu: '菜单',
                button: '按钮',
                embedded: '内嵌',
                link: '外链',
              };
              value = typeMap[value as keyof typeof typeMap] || value;

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
      `菜单列表_${new Date().toISOString().slice(0, 10)}.csv`,
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
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
        <Button
          type="primary"
          danger
          :disabled="selectedRows.length === 0"
          @click="onBatchDelete"
        >
          批量删除
        </Button>
        <Button @click="onExpandAll">全部展开</Button>
        <Button @click="onCollapseAll">全部折叠</Button>
        <Button type="primary" @click="onExport">
          <SvgDownloadIcon class="size-5" />
          导出
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta?.title) }}</span>
          <div class="items-center justify-end">
            <Switch
              v-if="row.type !== 'button'"
              :checked="row.status === 1"
              size="small"
              @change="() => onToggleStatus(row)"
            />
          </div>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>
  </Page>
</template>

<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
