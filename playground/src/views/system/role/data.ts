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
  return [
    {
      type: 'checkbox',
      width: 60,
      fixed: 'left', // 将复选框列固定在左侧
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
      title: $t('system.role.dataScope'), // 建议修改国际化文本为"部门"而非"部门ID"
      width: 120, // 可适当调整宽度
      
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
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },
    {
      field: 'createTime',
      title: $t('system.role.createTime'),
      width: 180,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.role.remark'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'roleName',
          nameTitle: $t('system.role.roleName'),
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
      title: $t('system.user.operation'),
      width: 200,
    },
  ];
}
