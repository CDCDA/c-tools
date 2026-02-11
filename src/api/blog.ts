/*
 * @Description: 博客接口
 * @Author: cyd 1205489124@qq.com
 * @Date: 2023-07-07 16:59:41
 * @LastEditTime: 2026-02-11 15:55:23
 */
import request from "@/utils/request.ts";
// 分页
export const pageBlogs = (params: any) =>
  request({
    url: "/blogs",
    method: "get",
    params,
  });

export const listBlogsByType = (params: any) =>
  request({
    url: "/blogs/by-type",
    method: "get",
    params,
  });

// 保存
export const saveBlog = (params: any) =>
  request({
    url: "/blogs",
    method: "post",
    data: params,
  });

// 保存
export const updateBlog = (params: any) =>
  request({
    url: "/blogs/" + params.blogId,
    method: "put",
    data: params,
  });

// 博客详情
export const getBlogById = (id: any) =>
  request({
    url: "/blogs/" + id,
    method: "get",
  });

// 查询博客数
export const countBlogs = (params: any) =>
  request({
    url: "/blogs/count",
    method: "get",
    params,
  });

// 批量删除
export const deleteBlogs = (ids: Array<string>) =>
  request({
    url: "/blogs/batch-delete",
    method: "delete",
    data: ids,
  });

// 按时间范围统计
export const countBlogsByDate = (params: any) =>
  request({
    url: "/blogs/stats/date-range",
    method: "get",
    params,
  });

// 按分类统计
export const countBlogsByType = (params: any) =>
  request({
    url: "/blogs/stats/type",
    method: "get",
    params,
  });

// 按标签统计
export const countBlogsByTag = (params: any) =>
  request({
    url: "/blogs/stats/tag",
    method: "get",
    params,
  });

// 随机博客
export const getRandomBlog = () =>
  request({
    url: "/blogs/random",
    method: "get",
  });

// 获取前后博客
export const getNeighborBlogs = (id: string) =>
  request({
    url: "/blogs/neighbors/" + id,
    method: "get",
  });
