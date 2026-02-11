/*
 * @Description: 博客分类
 */
import request from "@/utils/request.ts";

// 查询分类数
export const countTypes = () =>
  request({
    url: "/blog-types/count",
    method: "get",
  });

// 分页
export const pageTypes = (params: any) =>
  request({
    url: "/blog-types",
    method: "get",
    params,
  });

// 删除博客分类
export const deleteTypes = (ids: string[]) =>
  request({
    url: "/blog-types/batch-delete",
    method: "delete",
    data: ids,
  });

// 保存博客分类
export const saveType = (data: any) =>
  request({
    url: "/blog-types",
    method: "post",
    data,
  });

// 修改博客分类
export const updateType = (data: any) =>
  request({
    url: "/blog-types/" + data.typeId,
    method: "put",
    data,
  });

// 博客分类列表（带统计）
export const listTypesWithStats = (params: any) =>
  request({
    url: "/blog-types/with-stats",
    method: "get",
    params,
  });

// 查询分类列表并列出指定数量的博客
export const pageBlogsWithTypes = () =>
  request({
    url: "/blog-types/with-blogs",
    method: "get",
  });

// 根据分类id查询分类
export const getTypeById = (typeId: string) =>
  request({
    url: "/blog-types/" + typeId,
    method: "get",
  });
