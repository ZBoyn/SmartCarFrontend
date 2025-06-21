import type { SystemUserApi } from '#/api';

import { computed, ref } from 'vue';

import { getUserList } from '#/api';

// 将状态移至函数外部，实现单例模式
const userList = ref<SystemUserApi.SystemUser[]>([]);
const loading = ref(false);
const isFetched = ref(false); // 添加一个标志位，防止重复请求

/**
 * 用户数据管理 (Singleton)
 */
export function useUserData() {
  // 获取用户列表
  async function fetchUserList() {
    // 如果正在加载或已获取数据，则不再请求
    if (loading.value || isFetched.value) return;

    loading.value = true;
    try {
      const response = await getUserList({ page: 1, pageSize: 1000 });
      userList.value = response?.items || [];
      isFetched.value = true; // 标记为已获取
    } catch (error) {
      console.error('获取用户列表失败:', error);
      isFetched.value = false; // 失败时允许重试
    } finally {
      loading.value = false;
    }
  }

  // 根据用户ID获取用户名
  function getUserNameById(userId: number | string): string {
    const user = userList.value.find((u) => {
      return u.userId === Number(userId);
    });

    const result = user ? user.nickname : String(userId);
    return result;
  }

  // 根据用户ID获取用户昵称
  function getUserNicknameById(userId: number | string): string {
    const user = userList.value.find((u) => u.userId === Number(userId));
    return user ? user.nickname : String(userId);
  }

  // 用户选项
  const userOptions = computed(() =>
    userList.value.map((user) => ({
      label: user.nickname || user.username,
      value: user.userId,
    })),
  );

  // 用户昵称选项
  const userNicknameOptions = computed(() =>
    userList.value.map((user) => ({
      label: user.nickname || user.username,
      value: user.userId,
    })),
  );

  return {
    userList,
    loading,
    fetchUserList,
    getUserNameById,
    getUserNicknameById,
    userOptions,
    userNicknameOptions,
  };
}
