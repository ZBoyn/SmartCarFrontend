import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { InspectionTaskApi } from '#/api';

import { useUserData } from '#/composables';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  const { userOptions } = useUserData();

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
      component: 'Select',
      fieldName: 'creatorId',
      label: $t('inspection.task.creatorId'),
      rules: 'required',
      componentProps: {
        options: userOptions.value,
        allowClear: true,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()),
      },
    },
    {
      component: 'Select',
      fieldName: 'executorId',
      label: $t('inspection.task.executorId'),
      componentProps: {
        options: userOptions.value,
        allowClear: true,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()),
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const { userOptions } = useUserData();

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
      component: 'Select',
      fieldName: 'creatorId',
      label: $t('inspection.task.creatorId'),
      componentProps: {
        options: userOptions.value,
        allowClear: true,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()),
      },
    },
    {
      component: 'Select',
      fieldName: 'executorId',
      label: $t('inspection.task.executorId'),
      componentProps: {
        options: userOptions.value,
        allowClear: true,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()),
      },
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
  const { getUserNameById } = useUserData();

  return [
    {
      type: 'checkbox',
      width: 60,
      fixed: 'left',
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
      formatter: ({ cellValue }) => getUserNameById(cellValue),
    },
    {
      field: 'executorId',
      title: $t('inspection.task.executorId'),
      width: 100,
      formatter: ({ cellValue }) => getUserNameById(cellValue),
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
