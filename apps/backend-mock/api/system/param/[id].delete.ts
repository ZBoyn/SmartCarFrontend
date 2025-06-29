export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    setResponseStatus(event, 400);
    return useResponseError('BadRequestException', 'Parameter ID is required');
  }

  return useResponseSuccess({
    message: `Parameter with ID ${id} deleted successfully`,
  });
});
