import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    dataScope: string;
    remark?: string;
    roleId: string;
    roleKey: string;
    roleName: string;
    roleSort: number;
    status: 0 | 1;
  }

  export interface RoleUser {
    createTime: string;
    deptId: number;
    deptName: string;
    nickname: string;
    phoneNumber: string;
    status: string;
    userId: number;
    username: string;
  }
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/list',
    { params },
  );
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/system/role', data);
}

/**
 * 更新角色
 * @param roleId 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  roleId: string,
  data: Omit<SystemRoleApi.SystemRole, 'roleId'>,
) {
  return requestClient.put(`/system/role/${roleId}`, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: string) {
  return requestClient.delete(`/system/role/${id}`);
}

/**
 * 获取角色下的用户列表
 * @param roleId 角色ID
 */
async function getRoleUsers(roleId: string) {
  return requestClient.get<SystemRoleApi.RoleUser[]>(
    `/system/role/${roleId}/users`,
  );
}

/**
 * 分配用户到角色
 * @param roleId 角色ID
 * @param userIds 用户ID数组
 */
async function assignUsersToRole(roleId: string, userIds: number[]) {
  return requestClient.post(`/system/role/${roleId}/users`, {
    userIds,
  });
}

/**
 * 从角色中移除用户
 * @param roleId 角色ID
 * @param userIds 用户ID数组
 */
async function removeUsersFromRole(roleId: string, userIds: number[]) {
  return requestClient.delete(`/system/role/${roleId}/users`, {
    data: { userIds },
  });
}

export {
  assignUsersToRole,
  createRole,
  deleteRole,
  getRoleList,
  getRoleUsers,
  removeUsersFromRole,
  updateRole,
};
