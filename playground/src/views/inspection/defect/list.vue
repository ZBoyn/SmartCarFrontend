<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { SvgDownloadIcon } from '@vben/icons';

import { Button, Image, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { gridOptions, useGridFormSchema } from './data';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions,
});

function isVerifiedTrue(val: any) {
  return val === 1 || val === '1' || val === '是' || val === true;
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
    </Grid>
  </Page>
</template>
