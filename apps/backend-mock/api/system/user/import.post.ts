import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 模拟处理上传的文件
  const formData = await readFormData(event);
  const file = formData.get('file') as File;

  if (!file) {
    return useResponseError('未找到上传的文件');
  }

  // 模拟处理时间
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return useResponseSuccess({
    message: '导入成功',
    importedCount: 10,
    failedCount: 0,
  });
});
