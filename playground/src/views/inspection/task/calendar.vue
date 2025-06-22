<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { InspectionTaskApi } from '#/api';

import { onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Badge, Button, Calendar, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { getTaskList } from '#/api';
import { $t } from '#/locales';

import TaskDetailModal from './modules/task-detail-modal.vue';

const tasks = ref<InspectionTaskApi.Task[]>([]);
const currentDate = ref<Dayjs>(dayjs());
const selectedTask = ref<InspectionTaskApi.Task | undefined>(undefined);

const [TaskModal, taskModalApi] = useVbenModal({
  destroyOnClose: true,
  onCancel() {
    taskModalApi.close();
    selectedTask.value = undefined;
  },
  onConfirm() {
    taskModalApi.close();
    selectedTask.value = undefined;
  },
});

watch(currentDate, (newDate) => {
  if (newDate) {
    fetchTasks(newDate);
  }
});

async function fetchTasks(date: Dayjs) {
  const startDate = date.startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const endDate = date.endOf('month').format('YYYY-MM-DD HH:mm:ss');

  try {
    const { items } = await getTaskList({
      page: 1,
      pageSize: 9999, // 获取当月所有任务
      startTime: startDate,
      endTime: endDate,
    });
    // 按照createTime进行排序，最新的在前面
    tasks.value = items.sort((a, b) => {
      const timeA = dayjs(a.createTime);
      const timeB = dayjs(b.createTime);
      return timeB.isAfter(timeA) ? 1 : -1;
    });
  } catch (error) {
    message.error('获取任务列表失败');
    console.error(error);
  }
}

onMounted(() => {
  fetchTasks(currentDate.value);
});

function getListData(value: Dayjs) {
  return (
    tasks.value.filter((task) => {
      const taskDate = dayjs(task.createTime);
      return taskDate.isSame(value, 'day');
    }) || []
  );
}

function onPanelChange(value: Dayjs | string) {
  currentDate.value = dayjs(value);
}

function onTaskClick(task: InspectionTaskApi.Task) {
  selectedTask.value = task;
  taskModalApi.open();
}
</script>
<template>
  <div class="dark:bg-v-dark p-3">
    <TaskModal
      append-to-main
      class="w-[800px]"
      title="任务详情"
      :footer="false"
    >
      <TaskDetailModal :task="selectedTask" />
    </TaskModal>

    <Calendar
      v-model:value="currentDate"
      class="!bg-transparent"
      @panel-change="onPanelChange"
    >
      <template #headerRender="{ value, onChange }">
        <div class="flex items-center justify-between p-3">
          <div class="text-lg font-bold">
            {{ value.year() }}年 {{ value.month() + 1 }}月
            {{ $t('inspection.task.calendar') }}
          </div>
          <div class="space-x-2">
            <Button
              size="small"
              @click="() => onChange(value.subtract(1, 'month'))"
            >
              {{ $t('inspection.task.prevMonth') }}
            </Button>
            <Button size="small" @click="() => onChange(dayjs())">
              {{ $t('inspection.task.today') }}
            </Button>
            <Button size="small" @click="() => onChange(value.add(1, 'month'))">
              {{ $t('inspection.task.nextMonth') }}
            </Button>
          </div>
        </div>
      </template>
      <template #dateCellRender="{ current }">
        <ul class="m-0 max-h-24 list-none overflow-y-auto p-0" @click.stop>
          <li
            v-for="item in getListData(current)"
            :key="item.taskId"
            class="cursor-pointer truncate hover:text-blue-400"
            @click="onTaskClick(item)"
          >
            <Badge status="success" :text="item.taskName" />
          </li>
        </ul>
      </template>
    </Calendar>
  </div>
</template>
