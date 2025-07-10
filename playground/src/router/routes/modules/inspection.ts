import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'carbon:vehicle-services',
      keepAlive: true,
      order: 9995,
      title: $t('inspection.title'),
    },
    name: 'Inspection',
    path: '/inspection',
    children: [
      {
        path: '/inspection/task',
        name: 'InspectionTask',
        meta: {
          icon: 'mdi:clipboard-list',
          title: $t('inspection.task.title'),
        },
        component: () => import('#/views/inspection/task/list.vue'),
      },
      {
        path: '/inspection/defect',
        name: 'InspectionDefect',
        meta: {
          icon: 'mdi:alert-circle',
          title: $t('inspection.defect.title'),
        },
        component: () => import('#/views/inspection/defect/list.vue'),
      },
    ],
  },
];

export default routes;
