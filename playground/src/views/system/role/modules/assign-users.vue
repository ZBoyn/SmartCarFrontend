<script setup lang="ts">
import type { TransferDirection } from 'ant-design-vue/es/transfer';

import type { SystemRoleApi, SystemUserApi } from '#/api';

import { computed, ref, watch } from 'vue';

import { message, Modal, Table, Transfer } from 'ant-design-vue';

import {
  assignUsersToRole,
  getRoleUsers,
  getUserList,
  removeUsersFromRole,
} from '#/api';
import { $t } from '#/locales';

const props = defineProps<{
  role: null | SystemRoleApi.SystemRole;
  visible: boolean;
}>();
const emit = defineEmits(['update:visible', 'success']);

const currentUsers = ref<SystemRoleApi.RoleUser[]>([]);
const allUsers = ref<SystemUserApi.SystemUser[]>([]);
const loading = ref(false);
const transferLoading = ref(false);

watch(
  () => props.visible,
  async (val) => {
    if (val && props.role) {
      await loadCurrentUsers(props.role.roleId);
      await loadAllUsers();
    }
  },
  { immediate: true },
);

async function loadCurrentUsers(roleId: string) {
  try {
    loading.value = true;
    const res = await getRoleUsers(roleId);
    currentUsers.value = res || [];
  } catch {
    message.error('获取角色用户失败');
  } finally {
    loading.value = false;
  }
}

async function loadAllUsers() {
  try {
    const res = await getUserList({ page: 1, pageSize: 1000 });
    allUsers.value = res.items || [];
  } catch {
    message.error('获取用户列表失败');
  }
}

async function handleTransfer(
  targetKeys: string[],
  direction: TransferDirection,
  moveKeys: string[],
) {
  if (!props.role?.roleId) return;
  try {
    transferLoading.value = true;
    const userIds = moveKeys.map((key) => Number.parseInt(key));
    if (direction === 'right') {
      await assignUsersToRole(props.role.roleId, userIds);
      message.success('添加用户成功');
    } else {
      await removeUsersFromRole(props.role.roleId, userIds);
      message.success('移除用户成功');
    }
    await loadCurrentUsers(props.role.roleId);
    emit('success');
  } catch {
    message.error(direction === 'right' ? '添加用户失败' : '移除用户失败');
  } finally {
    transferLoading.value = false;
  }
}

const currentUserIds = computed(() =>
  currentUsers.value.map((user) => user.userId.toString()),
);
const allUserOptions = computed(() =>
  allUsers.value.map((user) => ({
    key: user.userId.toString(),
    title: `${user.username} (${user.nickname})`,
    description: user.phoneNumber,
  })),
);
const currentRoleName = computed(() => props.role?.roleName || '');

function handleCancel() {
  emit('update:visible', false);
}

const currentUserColumns = [
  {
    title: $t('system.user.userId'),
    dataIndex: 'userId',
    key: 'userId',
    width: 80,
  },
  {
    title: $t('system.user.username'),
    dataIndex: 'username',
    key: 'username',
    width: 120,
  },
  {
    title: $t('system.user.nickname'),
    dataIndex: 'nickname',
    key: 'nickname',
    width: 120,
  },
  {
    title: $t('system.user.department'),
    dataIndex: 'deptName',
    key: 'deptName',
    width: 120,
  },
  {
    title: $t('system.user.phoneNumber'),
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 120,
  },
  {
    title: $t('system.user.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80,
    customRender: ({ text }: { text: string }) =>
      text === '1' ? '启用' : '禁用',
  },
  {
    title: $t('system.user.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
];
</script>

<template>
  <Modal
    :visible="visible"
    :title="$t('system.role.assignUsersTitle', [currentRoleName])"
    width="1000px"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="assign-users-container">
      <div class="current-users-section">
        <h3>
          {{ $t('system.role.currentUsers') }} ({{ currentUsers.length }})
        </h3>
        <Table
          :columns="currentUserColumns"
          :data-source="currentUsers"
          :loading="loading"
          :pagination="false"
          size="small"
          row-key="userId"
        />
      </div>
      <div class="transfer-section">
        <h3>{{ $t('system.role.assignUsers') }}</h3>
        <Transfer
          :data-source="allUserOptions"
          :target-keys="currentUserIds"
          :loading="transferLoading"
          :titles="[$t('system.role.allUsers'), $t('system.role.currentUsers')]"
          :show-search="true"
          :show-select-all="false"
          @change="handleTransfer"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.assign-users-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current-users-section h3,
.transfer-section h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.current-users-section {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.transfer-section {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

:deep(.ant-transfer) {
  width: 100%;
}

:deep(.ant-transfer-list) {
  width: 45%;
  height: 400px;
}

:deep(.ant-transfer-operation) {
  width: 10%;
}
</style>
