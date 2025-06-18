export interface Department {
  id: string;
  name: string;
}

export const departments: Department[] = [
  { id: '1', name: '研发部' },
  { id: '2', name: '市场部' },
  { id: '3', name: '销售部' },
  { id: '4', name: '人事部' },
  { id: '5', name: '财务部' },
];

export function getDepartmentName(id: number | string): string {
  const dept = departments.find((d) => d.id === String(id));
  return dept?.name || '未知部门';
}
