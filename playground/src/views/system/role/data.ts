import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.role.roleName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'roleKey',
      label: $t('system.role.roleKey'),
      rules: 'required',
    },
    {
      component: 'Select', // 将 Input 修改为 Select
      fieldName: 'dataScope',
      label: $t('system.role.dataScope'),

      rules: 'required', // 建议设为必填
    },
    {
      component: 'Input',
      fieldName: 'roleSort',
      label: $t('system.role.roleSort'),
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
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.role.roleName'),
    },
    {
      component: 'Input',
      fieldName: 'roleKey',
      label: $t('system.role.roleKey'),
    },
    {
      component: 'Select', // 将 Input 修改为 Select
      fieldName: 'dataScope',
      label: $t('system.role.dataScope'),
      componentProps: {
        allowClear: true, // 搜索时通常允许清空
      },
    },
    {
      component: 'Input',
      fieldName: 'roleSort',
      label: $t('system.role.roleSort'),
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
      label: $t('system.role.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('system.role.createTime'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  const options = [
    {
      code: 'edit',
      text: '修改',
    },
    {
      code: 'delete',
      text: '删除',
    },
    {
      code: 'assign-users',
      text: '分配用户',
    },
  ];
  const columns: VxeTableGridOptions['columns'] = [
    {
      type: 'checkbox',
      width: 60,
      fixed: 'left',
    },
    {
      field: 'roleId',
      title: $t('system.role.roleId'),
      width: 100,
    },
    {
      field: 'roleName',
      title: $t('system.role.roleName'),
      width: 150,
    },
    {
      field: 'roleKey',
      title: $t('system.role.roleKey'),
      width: 150,
    },
    {
      field: 'dataScope',
      title: $t('system.role.dataScope'),
      width: 120,
    },
    {
      field: 'roleSort',
      title: $t('system.role.roleSort'),
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
        props: {
          checkedValue: '1',
          unCheckedValue: '0',
        },
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.role.createTime'),
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.role.remark'),
    },
    {
      title: '分配用户权限',
      field: 'assignPermissions',
      align: 'center',
      width: 160,
      slots: {
        default: 'assignPermissions',
      },
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'roleName',
          nameTitle: $t('system.role.roleName'),
          onClick: onActionClick,
        },
        options,
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 200,
    },
  ];
  return columns;
}
