import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { $t } from '#/locales';

import { departments, getDepartmentName } from './department';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
      rules: 'required',
    },
    {
      component: 'Select', // 将 Input 修改为 Select
      fieldName: 'deptId',
      label: $t('system.user.department'),
      componentProps: () => ({
        // allowClear: true, // 如果需要清空选项，可以开启
        options: departments.value.map((dept) => ({
          label: dept.name,
          value: dept.id,
        })),
      }),
      rules: 'required', // 建议设为必填
    },
    {
      component: 'Input',
      fieldName: 'phoneNumber',
      label: $t('system.user.phoneNumber'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: '1' },
          { label: $t('common.disabled'), value: '0' },
        ],
        optionType: 'button',
      },
      defaultValue: '1',
      fieldName: 'status',
      label: $t('system.user.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.user.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
    },
    {
      component: 'Select', // 将 Input 修改为 Select
      fieldName: 'deptId',
      label: $t('system.user.department'),
      componentProps: () => ({
        allowClear: true, // 搜索时通常允许清空
        options: departments.value.map((dept) => ({
          label: dept.name,
          value: dept.id,
        })),
      }),
    },
    {
      component: 'Input',
      fieldName: 'phoneNumber',
      label: $t('system.user.phoneNumber'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: '1' },
          { label: $t('common.disabled'), value: '0' },
        ],
      },
      fieldName: 'status',
      label: $t('system.user.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('system.user.createTime'),
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 60,
      fixed: 'left', // 将复选框列固定在左侧
    },
    {
      field: 'userId',
      title: $t('system.user.userId'),
      width: 100,
    },
    {
      field: 'username',
      title: $t('system.user.username'),
      width: 150,
    },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      width: 150,
    },
    {
      field: 'deptId',
      title: $t('system.user.department'), // 建议修改国际化文本为"部门"而非"部门ID"
      width: 120, // 可适当调整宽度
      formatter: ({ cellValue }: { cellValue: string }) =>
        getDepartmentName(cellValue),
      // cellRender 可以移除，formatter 更直接
    },
    {
      field: 'phoneNumber',
      title: $t('system.user.phoneNumber'),
      width: 150,
    },
    {
      cellRender: {
        attrs: {
          beforeChange: onStatusChange,
          activeValue: '1',
          inactiveValue: '0',
        },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.user.createTime'),
      width: 220,
      formatter: 'formatDateTime',
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.user.remark'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('system.user.username'),
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
          {
            code: 'reset-password',
            title: $t('system.user.resetPassword'),
          },
          {
            code: 'assign-role',
            title: $t('system.user.assignRole'),
          },
        ],
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 250,
    },
  ];
}
