<script setup lang="ts">
import type { SystemUserApi } from '#/api';

import { ref, watch } from 'vue';

import { message, Modal, Select, Tag } from 'ant-design-vue';

import { changeUserRole, getAllRoles } from '#/api';
import { getUserRoles } from '#/api/system/user';

const props = defineProps<{
  user: null | SystemUserApi.SystemUser;
  visible: boolean;
}>();
const emit = defineEmits(['update:visible', 'success']);

const roles = ref<{ roleId: string; roleName: string }[]>([]);
const selectedRole = ref<string>();
const currentUserRoles = ref<SystemUserApi.ShowRoleDto[]>([]);
const loading = ref(false);

watch(
  () => props.visible,
  async (val) => {
    if (val && props.user?.userId) {
      const userId = props.user.userId;
      loading.value = true;
      try {
        // 先获取所有角色
        const rolesRes = await getAllRoles();
        roles.value = rolesRes.items || [];

        // 再获取用户当前角色
        let userRolesRes: SystemUserApi.ShowRoleDto[] = [];
        try {
          userRolesRes = await getUserRoles(userId);
        } catch (error) {
          console.warn('获取用户角色失败:', error);
        }
        currentUserRoles.value = userRolesRes || [];

        // 如果用户有当前角色，默认选中第一个
        if (currentUserRoles.value.length > 0) {
          selectedRole.value = currentUserRoles.value[0]?.roleId || '';
        }
      } catch (error) {
        console.error('获取角色信息失败:', error);
        message.error('获取角色信息失败');
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);

function handleOk() {
  if (!selectedRole.value) {
    message.warning('请选择角色');
    return;
  }
  changeUserRole(props.user!.userId, selectedRole.value)
    .then(() => {
      message.success('分配角色成功');
      emit('success');
      emit('update:visible', false);
    })
    .catch(() => {
      message.error('分配角色失败');
    });
}
function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :visible="visible"
    title="分配角色"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="确定"
    cancel-text="取消"
    :confirm-loading="loading"
  >
    <div v-if="loading" class="py-4 text-center">
      <span>加载中...</span>
    </div>
    <div v-else>
      <!-- 显示用户当前角色 -->
      <div v-if="currentUserRoles.length > 0" class="mb-4">
        <div class="mb-2 text-sm text-gray-600">当前角色：</div>
        <div class="flex flex-wrap gap-2">
          <Tag v-for="role in currentUserRoles" :key="role.roleId" color="blue">
            {{ role.roleName }}
          </Tag>
        </div>
      </div>
      <div v-else class="mb-4">
        <div class="mb-2 text-sm text-gray-600">当前角色：</div>
        <Tag color="default">未分配角色</Tag>
      </div>

      <!-- 角色选择 -->
      <div class="mb-4">
        <div class="mb-2 text-sm text-gray-600">选择新角色：</div>
        <Select
          v-model:value="selectedRole"
          style="width: 100%"
          placeholder="请选择角色"
        >
          <Select.Option
            v-for="role in roles"
            :key="role.roleId"
            :value="role.roleId"
          >
            {{ role.roleName }}
          </Select.Option>
        </Select>
      </div>
    </div>
  </Modal>
</template>
