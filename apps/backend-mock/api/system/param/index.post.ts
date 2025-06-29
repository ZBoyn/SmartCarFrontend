export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { configName, configKey, configValue, configType, _remark } = body;

  if (!configName || !configKey || !configValue || !configType) {
    setResponseStatus(event, 400);
    return useResponseError(
      'BadRequestException',
      'ConfigName, configKey, configValue and configType are required',
    );
  }
  return useResponseSuccess({
    message: 'Parameter created successfully',
  });
});
