import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace InspectionTaskApi {
  export interface Task {
    [key: string]: any;
    completionTime: Date;
    createTime: Date;
    creatorId: string;
    deadlineTime: Date;
    distance: number;
    executorId: string;
    startLocation: string;
    status: number;
    taskId: string;
    taskName: string;
    uploadTime: Date;
  }
  export interface PageResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }
}

/**
 * 获取任务列表
 * @param params 查询参数
 * @returns 任务列表
 */
async function getTaskList(params: Recordable<any>) {
  return requestClient.get<
    InspectionTaskApi.PageResult<InspectionTaskApi.Task>
  >('/inspection/task/list', { params });
}

/**
 * 创建任务
 * @param data 任务数据
 * @returns 创建结果
 */
async function createTask(data: Omit<InspectionTaskApi.Task, 'taskId'>) {
  return requestClient.post('/inspection/task', data);
}

/**
 * 更新任务
 * @param id 任务ID
 * @param data 任务数据
 * @returns 更新结果
 */
async function updateTask(
  id: string,
  data: Omit<InspectionTaskApi.Task, 'taskId'>,
) {
  return requestClient.put(`/inspection/task/${id}`, data);
}

/**
 * 删除任务
 * @param id 任务ID
 * @returns 删除结果
 */
async function deleteTask(id: string) {
  return requestClient.delete(`/inspection/task/${id}`);
}

export { createTask, deleteTask, getTaskList, updateTask };
