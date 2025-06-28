import { requestClient } from '#/api/request';

export namespace InspectionDefectApi {
  export interface Defect {
    [key: string]: any;
    defectArea?: number; // 缺陷面积(m²)
    defectId: string; // 缺陷编号
    defectLength?: number; // 缺陷长度(m)
    defectQuantity?: number; // 缺陷数量
    defectType?: string; // 缺陷类型
    distanceFromOrigin?: string; // 缺陷距离原点位置
    imageUrls?: string; // 缺陷图片URL列表（建议后端返回为逗号分隔字符串或数组）
    isVerified?: number; // 是否属实（0否 1是）
    recommendedAction?: string; // 建议整改方式
    reportedTime?: string; // 缺陷上报时间
    severity?: string; // 严重程度
    status?: string; // 缺陷状态（0已上报 1已整改）
    taskId?: string; // 所属任务编号
  }
  export interface PageResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }

  // 搜索参数接口
  export interface SearchParams {
    defectType?: string; // 缺陷类型
    isVerified?: number; // 是否属实（0否 1是）
    page?: number;
    pageSize?: number;
    taskId?: string; // 所属任务名称
  }
}

/**
 * 分页查询缺陷列表
 * @param params 查询参数
 * @returns 缺陷分页列表
 */
async function getDefectList(params: InspectionDefectApi.SearchParams) {
  return requestClient.get<
    InspectionDefectApi.PageResult<InspectionDefectApi.Defect>
  >('/inspection/defect/list', { params });
}

/**
 * 创建缺陷
 * @param data 缺陷数据
 * @returns 创建结果
 */
async function createDefect(
  data: Omit<InspectionDefectApi.Defect, 'defectId'>,
) {
  return requestClient.post<InspectionDefectApi.Defect>(
    '/inspection/defect/create',
    data,
  );
}

/**
 * 更新缺陷
 * @param data 缺陷数据
 * @returns 更新结果
 */
async function updateDefect(
  id: string,
  data: Omit<InspectionDefectApi.Defect, 'defectId'>,
) {
  return requestClient.put<InspectionDefectApi.Defect>(
    '/inspection/defect/update',
    data,
  );
}

/**
 * 删除缺陷
 */
async function deleteDefect(id: string) {
  return requestClient.delete<InspectionDefectApi.Defect>(
    `/inspection/defect/${id}`,
  );
}

export { createDefect, deleteDefect, getDefectList, updateDefect };
