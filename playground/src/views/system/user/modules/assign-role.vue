<script setup lang="ts">
import { ref, watch } from 'vue';
import { Modal, Select, message } from 'ant-design-vue';
import { getAllRoles, changeUserRole } from '#/api';
import type { SystemUserApi } from '#/api';

const props = defineProps<{
  user: SystemUserApi.SystemUser | null;
  visible: boolean;
}>();
const emit = defineEmits(['update:visible', 'success']);

const roles = ref<{ roleId: string; roleName: string }[]>([]);
const selectedRole = ref<string>();

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      const res = await getAllRoles();
      roles.value = res.items || [];
      selectedRole.value = props.user?.roleId;
    }
  },
  { immediate: true }
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
  >
    <Select
      v-model:value="selectedRole"
      style="width: 100%"
      placeholder="请选择角色"
    >
      <Select.Option v-for="role in roles" :key="role.roleId" :value="role.roleId">
        {{ role.roleName }}
      </Select.Option>
    </Select>
  </Modal>
</template>
