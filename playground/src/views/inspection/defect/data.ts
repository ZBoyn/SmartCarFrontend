import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDefectList } from '#/api/inspection/defect';

// 缺陷类型选项
const defectTypeOptions = [
  { label: '裂缝', value: '裂缝' },
  { label: '坑洞', value: '坑洞' },
  { label: '沉陷', value: '沉陷' },
  { label: '隆起', value: '隆起' },
  { label: '其他', value: '其他' },
];

// 是否属实选项
const isVerifiedOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

// 搜索表单配置
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskId',
      label: '所属任务',
      componentProps: {
        placeholder: '请输入任务名称',
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'defectType',
      label: '缺陷类型',
      componentProps: {
        options: defectTypeOptions,
        placeholder: '请选择缺陷类型',
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'isVerified',
      label: '是否属实',
      componentProps: {
        options: isVerifiedOptions,
        placeholder: '请选择是否属实',
        allowClear: true,
      },
    },
  ];
}

export const gridOptions: VxeGridProps = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'taskId', title: '任务名称', width: 120 },
    { field: 'defectType', title: '缺陷类型', width: 100 },
    { field: 'distanceFromOrigin', title: '缺陷距离原点位置', width: 120 },
    {
      field: 'imageUrls',
      title: '缺陷图片',
      slots: { default: 'imageUrls' },
      width: 120,
    },
    {
      field: 'isVerified',
      title: '是否属实',
      slots: { default: 'isVerified' },
      width: 80,
    },
    { field: 'severity', title: '严重程度', width: 80 },
    { field: 'defectLength', title: '缺陷长度', width: 80 },
    { field: 'defectArea', title: '缺陷面积', width: 80 },
    { field: 'defectQuantity', title: '缺陷数量', width: 80 },
    { field: 'recommendedAction', title: '建议整改方式', width: 120 },
    {
      field: 'reportedTime',
      title: '缺陷上报时间',
      width: 150,
      formatter: 'formatDateTime',
    },
    {
      field: 'action',
      title: '操作',
      slots: { default: 'action' },
      fixed: 'right',
      width: 100,
    },
  ],
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getDefectList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: { code: 'query' },
    zoom: true,
  },
  height: 'auto',
};
