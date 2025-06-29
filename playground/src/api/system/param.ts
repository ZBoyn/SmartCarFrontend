import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemParamApi {
  export interface SystemParam {
    [key: string]: any;
    /** 参数主键 */
    configId: number;
    /** 参数键名 */
    configKey: string;
    /** 参数名称 */
    configName: string;
    /** 系统内置（Y/N） */
    configType: string;
    /** 参数键*/
    configValue: string;
    /** 创建时间 */
    createTime: string;
    /** 备注 */
    remark?: string;
    /** 更新时间 */
    updateTime?: string;
  }

  export interface PageResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }
}

/**
 * 获取参数列表数据
 */
async function getParamList(params: Recordable<any>) {
  return requestClient.get<
    SystemParamApi.PageResult<SystemParamApi.SystemParam>
  >('/system/config/list', { params });
}

/**
 * 创建参数
 */
async function createParam(data: Partial<SystemParamApi.SystemParam>) {
  return requestClient.post<SystemParamApi.SystemParam>('/system/config', data);
}

/**
 * 更新参数
 */
async function updateParam(
  configId: number,
  data: Partial<SystemParamApi.SystemParam>,
) {
  return requestClient.put<SystemParamApi.SystemParam>(
    `/system/config/${configId}`,
    data,
  );
}

/**
 * 删除参数
 */
async function deleteParam(configId: number) {
  return requestClient.delete(`/system/config/${configId}`);
}

/**
 * 获取参数详情
 */
async function getParamDetail(configId: number) {
  return requestClient.get<SystemParamApi.SystemParam>(
    `/system/config/${configId}`,
  );
}

export { createParam, deleteParam, getParamDetail, getParamList, updateParam };
