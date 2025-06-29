import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemParamApi } from '#/api/system/param';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'configName',
      label: $t('system.param.paramName'),
      componentProps: {
        placeholder: '请输入参数名称',
      },
      rules: z.string().min(2).max(50),
    },
    {
      component: 'Input',
      fieldName: 'configKey',
      label: $t('system.param.paramKey'),
      componentProps: {
        placeholder: '请输入参数键名',
      },
      rules: z.string().min(2).max(100),
    },
    {
      component: 'Input',
      fieldName: 'configValue',
      label: $t('system.param.paramValue'),
      componentProps: {
        placeholder: '请输入参数键值',
      },
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择系统内置',
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
      },
      defaultValue: 'N',
      fieldName: 'configType',
      label: $t('system.param.isBuiltIn'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.param.description'),
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
      rules: z.string().max(200).optional(),
    },
  ];
}

/**
 * 获取表格搜索表单的字段配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'configName',
      label: $t('system.param.paramName'),
      componentProps: {
        placeholder: '请输入参数名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'configKey',
      label: $t('system.param.paramKey'),
      componentProps: {
        placeholder: '请输入参数键名',
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '系统内置',
        options: [
          { label: '系统内置', value: '' },
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
      },
      fieldName: 'configType',
      label: $t('system.param.isBuiltIn'),
    },
  ];
}

/**
 * 获取表格列配置
 */
export function useColumns<T = SystemParamApi.SystemParam>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'configId',
      title: $t('system.param.paramId'),
      width: 100,
    },
    {
      field: 'configName',
      title: $t('system.param.paramName'),
      width: 150,
    },
    {
      field: 'configKey',
      title: $t('system.param.paramKey'),
      width: 180,
    },
    {
      field: 'configValue',
      title: $t('system.param.paramValue'),
      minWidth: 120,
      showOverflow: 'tooltip',
    },
    {
      field: 'configType',
      title: $t('system.param.isBuiltIn'),
      width: 100,
      cellRender: { name: 'CellTag', props: { type: 'success' } },
      formatter: ({ cellValue }) => (cellValue === 'Y' ? '是' : '否'),
    },
    {
      field: 'remark',
      title: $t('system.param.description'),
      minWidth: 150,
      showOverflow: 'tooltip',
    },
    {
      field: 'createTime',
      title: $t('system.param.createTime'),
      width: 160,
      formatter: 'formatDateTime',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'configName',
          nameTitle: $t('system.param.paramName'),
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
      title: $t('system.param.operation'),
      width: 120,
    },
  ];
}
