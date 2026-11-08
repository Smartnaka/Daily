import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { BACKGROUND_TASK_INTERVAL_SECONDS, BACKGROUND_TASK_NAME } from '@/constants/app';
import { ensureDailyQuote } from '@/services/quoteManager';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const result = await ensureDailyQuote();
    return result.status === 'failed'
      ? BackgroundTask.BackgroundTaskResult.Failed
      : BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    if (__DEV__) console.warn('Background quote task failed', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerQuoteBackgroundTask(): Promise<boolean> {
  if (!(await TaskManager.isAvailableAsync())) return false;
  if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)) return true;
  await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: BACKGROUND_TASK_INTERVAL_SECONDS,
  });
  return true;
}

export async function isQuoteBackgroundTaskRegistered(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  } catch {
    return false;
  }
}
