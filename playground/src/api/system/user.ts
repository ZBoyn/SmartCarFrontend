import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    accessToken?: string;
    createTime: string;
    deptId: number;
    nickname: string;
    password?: string;
    phoneNumber: string;
    remark?: string;
    status: string;
    updateTime?: string;
    userId: number;
    username: string;
  }
  export interface PageResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<SystemUserApi.PageResult<SystemUserApi.SystemUser>>(
    '/system/user/list',
    { params },
  );
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'userId'>) {
  return requestClient.post('/system/user', data);
}

/**
 * 更新用户
 * @param id 用户ID
 * @param data 用户数据
 */
async function updateUser(
  id: number,
  data: Omit<SystemUserApi.SystemUser, 'userId'>,
) {
  return requestClient.put(`/system/user/${id}`, data);
}

/**
 * 删除用户
 * @param id 用户ID
 */
async function deleteUser(id: number) {
  return requestClient.delete(`/system/user/${id}`);
}

/**
 * 重置用户密码
 * @param id 用户ID
 */
async function resetUserPassword(id: number) {
  return requestClient.put(`/system/user/${id}/reset-password`);
}

export { createUser, deleteUser, getUserList, resetUserPassword, updateUser };
