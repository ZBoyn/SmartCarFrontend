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

  // 角色信息接口
  export interface ShowRoleDto {
    description?: string;
    roleCode?: string;
    roleId: string;
    roleName: string;
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

/**
 * 导出用户列表
 * @param params 查询参数
 */
async function exportUsers(params: Recordable<any>) {
  return requestClient.download('/system/user/export', { params });
}

/**
 * 导入用户列表
 * @param file 文件对象
 * @param onProgress 进度回调
 */
async function importUsers(
  file: File,
  onProgress?: (progress: { percent: number }) => void,
) {
  return requestClient.upload(
    '/system/user/import',
    { file },
    {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress?.({ percent });
        }
      },
    },
  );
}

// 获取所有角色
async function getAllRoles() {
  return requestClient.get('/system/role/list');
}

// 分配角色
async function changeUserRole(userId: number, roleId: string) {
  return requestClient.put(
    `/system/user/${userId}/change-role?roleId=${roleId}`,
  );
}

// 获取指定用户的当前角色列表
async function getUserRoles(userId: number) {
  return requestClient.get<SystemUserApi.ShowRoleDto[]>(
    `/system/user/${userId}/roles`,
  );
}

export {
  changeUserRole,
  createUser,
  deleteUser,
  exportUsers,
  getAllRoles,
  getUserList,
  getUserRoles,
  importUsers,
  resetUserPassword,
  updateUser,
};
