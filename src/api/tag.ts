/*
 * @Description:博客标签
 */
import request from '@/utils/request.ts';

export const countTags = () =>
  request({
    url: '/blog-tags/count',
    method: 'get'
  });

// 分页
export const pageTags = (params: any) =>
  request({
    url: '/blog-tags',
    method: 'get',
    params
  });

// 根据标签统计博客
export const listWithBlogs = (params: any) =>
  request({
    url: '/blog-tags/with-blogs',
    method: 'get',
    params
  });

// 删除标签
export const deleteTags = (ids: string[]) =>
  request({
    url: '/blog-tags/batch-delete',
    method: 'delete',
    data: ids
  });

// 保存标签
export const saveTag = (data: any) =>
  request({
    url: '/blog-tags',
    method: 'post',
    data
  });

// 更新标签
export const updateTag = (data: any) =>
  request({
    url: '/blog-tags/' + data.tagId,
    method: 'put',
    data
  });

// 根据标签id查询标签
export const getTagById = (tagId: string) =>
  request({
    url: '/blog-tags/' + tagId,
    method: 'get'
  });
