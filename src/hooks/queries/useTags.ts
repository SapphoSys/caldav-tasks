/**
 * TanStack Query hooks for tags
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '$lib/queryClient';
import * as taskData from '$lib/taskData';
import type { Tag } from '$types/index';

/**
 * Hook to get all tags
 */
export const useTags = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    return taskData.subscribeToDataChanges(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => taskData.getAllTags(),
    staleTime: Infinity,
  });
};

/**
 * Hook to get a single tag by ID
 */
export const useTag = (id: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    return taskData.subscribeToDataChanges(() => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags.byId(id) });
      }
    });
  }, [queryClient, id]);

  return useQuery({
    queryKey: queryKeys.tags.byId(id || ''),
    queryFn: () => (id ? taskData.getTagById(id) : undefined),
    enabled: !!id,
    staleTime: Infinity,
  });
};

/**
 * Hook to get tasks by tag
 */
export const useTasksByTag = (tagId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    return taskData.subscribeToDataChanges(() => {
      if (tagId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byTag(tagId) });
      }
    });
  }, [queryClient, tagId]);

  return useQuery({
    queryKey: queryKeys.tasks.byTag(tagId || ''),
    queryFn: () => (tagId ? taskData.getTasksByTag(tagId) : []),
    enabled: !!tagId,
    staleTime: Infinity,
  });
};

/**
 * Hook to create a tag
 */
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagInput: Partial<Tag>) => {
      return Promise.resolve(taskData.createTag(tagInput));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
};

/**
 * Hook to update a tag
 */
export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tag> }) => {
      return Promise.resolve(taskData.updateTag(id, updates));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.byId(id) });
    },
  });
};

/**
 * Hook to delete a tag
 */
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      taskData.deleteTag(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};
