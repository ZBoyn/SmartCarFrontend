export interface SystemParam {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string; // 'Y' | 'N'
  remark?: string;
  createTime: string;
  updateTime?: string;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const {
    page = 1,
    pageSize = 10,
    _configName,
    _configKey,
    _configType,
  } = query;

  return useResponseSuccess({
    items: [],
    page: Number(page),
    pageSize: Number(pageSize),
    total: 0,
  });
});
