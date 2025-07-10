import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    deptId: number;
    deptName: string;
    parentId?: number | string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 扁平数组转树结构
 */
function listToTree(
  list: SystemDeptApi.SystemDept[],
): SystemDeptApi.SystemDept[] {
  const map = new Map<number, SystemDeptApi.SystemDept>();
  const tree: SystemDeptApi.SystemDept[] = [];
  list.forEach((item) => {
    map.set(item.deptId, { ...item, children: [] });
  });
  map.forEach((item) => {
    if (item.parentId && item.parentId !== 0) {
      const parent = map.get(Number(item.parentId));
      if (parent && parent.children) {
        parent.children.push(item);
      }
    } else {
      tree.push(item);
    }
  });
  return tree;
}

/**
 * 获取部门列表数据
 */
async function getDeptList(params?: { deptName?: string; status?: number }) {
  const res = await requestClient.get<Array<SystemDeptApi.SystemDept>>(
    '/system/dept/list',
    { params },
  );
  return listToTree(res);
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post('/system/dept', data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  id: string,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(`/system/dept/${id}`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: string) {
  return requestClient.delete(`/system/dept/${id}`);
}

/**
 * 获取所有部门的 id -> name 映射
 */
async function getDeptIdNameMap() {
  // 获取原始扁平数组
  const res =
    await requestClient.get<Array<SystemDeptApi.SystemDept>>(
      '/system/dept/list',
    );
  const map: Record<number, string> = {};
  res.forEach((item) => {
    map[item.deptId] = item.deptName;
  });
  return map;
}

export { createDept, deleteDept, getDeptIdNameMap, getDeptList, updateDept };
