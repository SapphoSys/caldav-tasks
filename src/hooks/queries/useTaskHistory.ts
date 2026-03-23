import { useQuery } from '@tanstack/react-query';
import { getTaskHistory } from '$lib/database';

export const useTaskHistory = (taskUid: string) => {
  return useQuery({
    queryKey: ['taskHistory', taskUid],
    queryFn: () => getTaskHistory(taskUid),
  });
};
