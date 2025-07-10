import type { DatePickerProps } from 'ant-design-vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { InspectionTaskApi } from '#/api';

import { useUserData } from '#/composables';
import { $t } from '#/locales';

const taskStatusMap = {
  0: { text: '待执行', color: 'orange' },
  1: { text: '执行中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'red' },
};

const taskStatusOptions = Object.entries(taskStatusMap).map(([key, value]) => ({
  label: value.text,
  value: key,
}));

export function useFormSchema(): VbenFormSchema[] {
  const { userOptions, initUserData } = useUserData();

  initUserData();

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
      componentProps: {
        placeholder: '系统将自动生成任务ID',
        readonly: true,
        defaultValue: generateTaskId(),
      },
    },
    {
      component: 'Select',
      fieldName: 'creatorId',
      label: $t('inspection.task.creatorId'),
      rules: 'required',
      componentProps: {
        options: userOptions,
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
      rules: 'required',
      componentProps: {
        options: userOptions,
        allowClear: true,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()),
      },
    },
    {
      component: 'Input',
      fieldName: 'startLocation',
      label: $t('inspection.task.startLocation'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'distance',
      label: $t('inspection.task.distance'),
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'deadlineTime',
      label: $t('inspection.task.deadlineTime'),
      rules: 'required',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
      } as DatePickerProps,
    },
    {
      component: 'DatePicker',
      fieldName: 'completionTime',
      label: $t('inspection.task.completionTime'),
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
      } as DatePickerProps,
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('inspection.task.status'),
      componentProps: {
        options: taskStatusOptions,
      },
    },
  ];
}

// 生成任务ID的函数
function generateTaskId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 生成3位随机数
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `TASK_${dateStr}-${randomNum}`;
}

export function useGridFormSchema(): VbenFormSchema[] {
  const { userOptions, initUserData } = useUserData();
  initUserData();
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
        options: userOptions,
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
        options: userOptions,
        allowClear: true,
        showSearch: true,
        filterOption: (input: string, option: any) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('inspection.task.status'),
      componentProps: {
        options: taskStatusOptions,
      },
    },
  ];
}

export function useColumns<T = InspectionTaskApi.Task>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  const { getUserNameById, initUserData } = useUserData();
  initUserData();

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
      width: 120,
    },
    {
      field: 'distance',
      title: $t('inspection.task.distance'),
      width: 120,
    },
    {
      field: 'creatorId',
      title: $t('inspection.task.creatorId'),
      width: 120,
      formatter: ({ cellValue }) => getUserNameById(cellValue),
    },
    {
      field: 'executorId',
      title: $t('inspection.task.executorId'),
      width: 120,
      formatter: ({ cellValue }) => getUserNameById(cellValue),
    },
    {
      field: 'deadlineTime',
      title: $t('inspection.task.deadlineTime'),
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'completionTime',
      title: $t('inspection.task.completionTime'),
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'createTime',
      title: $t('inspection.task.createTime'),
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'orange', label: '待执行', value: 0 },
          { color: 'blue', label: '执行中', value: 1 },
          { color: 'green', label: '已完成', value: 2 },
          { color: 'red', label: '已取消', value: 3 },
        ],
      },
      field: 'status',
      title: $t('inspection.task.status'),
      width: 120,
      formatter: 'formatStatus',
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
            code: 'change-status',
            title: '修改状态',
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
      width: 280,
    },
  ];
}
