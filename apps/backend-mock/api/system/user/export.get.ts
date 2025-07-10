import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 模拟CSV数据
  const csvData = `用户ID,用户名,昵称,部门,手机号,状态,创建时间,备注
1,admin,管理员,技术部,13800138000,启用,2024-01-01 00:00:00,系统管理员
2,user1,用户1,销售部,13800138001,启用,2024-01-02 00:00:00,普通用户
3,user2,用户2,市场部,13800138002,禁用,2024-01-03 00:00:00,普通用户`;

  // 设置响应头
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="用户列表_${new Date().toISOString().slice(0, 10)}.csv"`,
  );

  return csvData;
});
