export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    title: '待办事项',
    subtitle: '管理你的日常任务',
    stats: {
      total: '总任务',
      active: '进行中',
      done: '已完成',
    },
    input: {
      placeholder: '添加新任务...',
      add: '添加',
    },
    filters: {
      all: '全部',
      active: '进行中',
      done: '已完成',
    },
    empty: {
      all: '还没有任务，添加一个开始吧！',
      active: '没有进行中的任务',
      completed: '没有已完成的任务',
    },
    footer: {
      noTasks: '暂无任务',
      activeCount: '个进行中任务',
      clear: '清除已完成',
    },
    priority: {
      high: '高',
      medium: '中',
      low: '低',
    },
  },
  en: {
    title: 'TASKS',
    subtitle: 'Manage your daily tasks',
    stats: {
      total: 'Total',
      active: 'Active',
      done: 'Done',
    },
    input: {
      placeholder: 'Add new task...',
      add: 'Add',
    },
    filters: {
      all: 'ALL',
      active: 'ACTIVE',
      done: 'DONE',
    },
    empty: {
      all: 'No tasks yet. Add one to get started!',
      active: 'No active tasks',
      completed: 'No completed tasks',
    },
    footer: {
      noTasks: 'No tasks',
      activeCount: ' active',
      clear: 'Clear Done',
    },
    priority: {
      high: 'HI',
      medium: 'MD',
      low: 'LO',
    },
  },
};
