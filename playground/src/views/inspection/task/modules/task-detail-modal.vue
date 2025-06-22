<script lang="ts" setup>
import type { InspectionTaskApi } from '#/api';

import { computed, onMounted } from 'vue';

import { Descriptions, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useUserData } from '#/composables';

interface Props {
  task?: InspectionTaskApi.Task | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  task: undefined,
});

const { getUserNameById, initUserData } = useUserData();

onMounted(() => {
  initUserData();
});

const taskStatusMap = {
  0: { text: '待执行', color: 'orange' },
  1: { text: '执行中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'red' },
};

const statusInfo = computed(() => {
  if (!props.task) return null;
  return (
    taskStatusMap[props.task.status as keyof typeof taskStatusMap] || {
      text: '未知',
      color: 'default',
    }
  );
});
</script>

<template>
  <div v-if="task" class="p-4">
    <div class="mb-4">
      <h3 class="mb-2 text-lg font-bold">{{ task.taskName }}</h3>
      <Tag :color="statusInfo?.color">{{ statusInfo?.text }}</Tag>
    </div>

    <Descriptions :column="1" bordered>
      <Descriptions.Item label="任务ID">
        {{ task.taskId }}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {{ dayjs(task.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </Descriptions.Item>
      <Descriptions.Item label="开始时间">
        {{ dayjs(task.startTime).format('YYYY-MM-DD HH:mm:ss') }}
      </Descriptions.Item>
      <Descriptions.Item label="截止时间">
        {{ dayjs(task.deadlineTime).format('YYYY-MM-DD HH:mm:ss') }}
      </Descriptions.Item>
      <Descriptions.Item label="完成时间" v-if="task.completionTime">
        {{ dayjs(task.completionTime).format('YYYY-MM-DD HH:mm:ss') }}
      </Descriptions.Item>
      <Descriptions.Item label="上传时间" v-if="task.uploadTime">
        {{ dayjs(task.uploadTime).format('YYYY-MM-DD HH:mm:ss') }}
      </Descriptions.Item>
      <Descriptions.Item label="距离">
        {{ task.distance }}km
      </Descriptions.Item>
      <Descriptions.Item label="起始位置">
        {{ task.startLocation }}
      </Descriptions.Item>
      <Descriptions.Item label="创建者">
        {{ getUserNameById(task.creatorId) }}
      </Descriptions.Item>
      <Descriptions.Item label="执行者">
        {{ getUserNameById(task.executorId) }}
      </Descriptions.Item>
    </Descriptions>
  </div>
</template>
