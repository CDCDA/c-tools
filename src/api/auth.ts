/*
 * @Description:鉴权
 */
import request from "@/utils/request.ts";
import type { AxiosInstance } from "axios";
import axios from "axios";
// 登录
export const login = (params: any) =>
  request({
    url: "/auth/login",
    method: "post",
    data: params,
  });

//游客登录
export const touristLogin = () =>
  request({
    url: "/auth/touristLogin",
    method: "get",
  });

//获取验证码
export const getCode = (params: any) =>
  request({
    url: "/auth/getCode",
    method: "get",
    params,
  });

//注册
export const register = (params: Object) =>
  request({
    url: "/auth/register",
    method: "get",
    params,
  });

//验证token
export const verifyToken = () =>
  request({
    url: "/auth/validate",
    method: "get",
  });
let userData = window.localStorage.getItem("userData") as any;
if (userData) userData = JSON.parse(userData) as any;
const service: AxiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? "/dev-api" : "/prod-api",
  timeout: 150000,
  headers: {
    Authorization: `Bearer ${userData?.token}`,
  },
});

//验证token（无拦截）
export const verifyTokenNoIntercept = () =>
  service({
    url: "/auth/validate",
    method: "get",
  });
