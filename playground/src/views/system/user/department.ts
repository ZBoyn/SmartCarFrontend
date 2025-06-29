import { ref } from 'vue';

import { getDeptList } from '#/api';

export interface Department {
  id: string;
  name: string;
}

// 使用 ref 来存储动态获取的部门数据
export const departments = ref<Department[]>([]);

// 部门数据映射，用于快速查找
export const departmentMap = ref<Map<string, string>>(new Map());

/**
 * 初始化部门数据
 */
export async function initDepartments() {
  try {
    const deptList = await getDeptList();
    // 将树形结构扁平化为数组
    const flatDepts = flattenDepartments(deptList);

    departments.value = flatDepts.map((dept) => ({
      id: dept.deptId.toString(),
      name: dept.deptName,
    }));

    // 更新部门映射
    departmentMap.value.clear();
    departments.value.forEach((dept) => {
      departmentMap.value.set(dept.id, dept.name);
    });
  } catch (error) {
    console.error('获取部门列表失败:', error);
    // 如果获取失败，使用默认数据
    departments.value = [
      { id: '1', name: '研发部' },
      { id: '2', name: '市场部' },
      { id: '3', name: '销售部' },
      { id: '4', name: '人事部' },
      { id: '5', name: '财务部' },
    ];
  }
}

/**
 * 将树形部门结构扁平化
 */
function flattenDepartments(deptList: any[]): any[] {
  const result: any[] = [];

  function traverse(depts: any[]) {
    depts.forEach((dept) => {
      result.push({
        deptId: dept.deptId,
        deptName: dept.deptName,
      });
      if (dept.children && dept.children.length > 0) {
        traverse(dept.children);
      }
    });
  }

  traverse(deptList);
  return result;
}

export function getDepartmentName(id: number | string): string {
  const deptId = String(id);
  return departmentMap.value.get(deptId) || '未知部门';
}
