import { useQuery } from '@tanstack/react-query';
import { getTaskHistory } from '$lib/database/history';

export const useTaskHistory = (taskUid: string) => {
  return useQuery({
    queryKey: ['taskHistory', taskUid],
    queryFn: () => getTaskHistory(taskUid),
  });
};
