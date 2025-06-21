import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { InspectionTaskApi } from '#/api';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskName',
      label: $t('inspection.task.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'taskId',
      label: $t('inspection.task.taskId'),
      rules: 'required',
    },
    {
      component: 'Select', // 将 Input 修改为 Select
      fieldName: 'creatorId',
      label: $t('inspection.task.creatorId'),

      rules: 'required', // 建议设为必填
    },
    {
      component: 'Input',
      fieldName: 'executorId',
      label: $t('inspection.task.executorId'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskName',
      label: $t('inspection.task.name'),
    },
    {
      component: 'Input',
      fieldName: 'taskId',
      label: $t('inspection.task.taskId'),
    },
    {
      component: 'Select', // 将 Input 修改为 Select
      fieldName: 'creatorId',
      label: $t('inspection.task.creatorId'),
      componentProps: {
        allowClear: true, // 搜索时通常允许清空
      },
    },
    {
      component: 'Input',
      fieldName: 'executorId',
      label: $t('inspection.task.executorId'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('inspection.task.createTime'),
    },
  ];
}

export function useColumns<T = InspectionTaskApi.Task>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 60,
      fixed: 'left', // 将复选框列固定在左侧
    },
    {
      field: 'taskId',
      title: $t('inspection.task.taskId'),
      width: 150,
    },
    {
      field: 'taskName',
      title: $t('inspection.task.name'),
      width: 150,
    },
    {
      field: 'startLocation',
      title: $t('inspection.task.startLocation'),
      width: 80,
    },
    {
      field: 'distance',
      title: $t('inspection.task.distance'),
      width: 80,
    },
    {
      field: 'creatorId',
      title: $t('inspection.task.creatorId'),
      width: 100,
    },
    {
      field: 'executorId',
      title: $t('inspection.task.executorId'),
      width: 100,
    },
    {
      field: 'deadlineTime',
      title: $t('inspection.task.deadlineTime'),
      width: 150,
      formatter: 'formatDateTime',
    },
    {
      field: 'completionTime',
      title: $t('inspection.task.completionTime'),
      width: 150,
      formatter: 'formatDateTime',
    },
    {
      field: 'createTime',
      title: $t('inspection.task.createTime'),
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'taskName',
          nameTitle: $t('inspection.task.name'),
          onClick: onActionClick,
        },
        options: [
          {
            code: 'edit',
            title: $t('ui.actionTitle.edit'),
          },
          {
            code: 'delete',
            title: $t('ui.actionTitle.delete'),
          },
        ],
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('inspection.task.operation'),
      width: 200,
    },
  ];
}
