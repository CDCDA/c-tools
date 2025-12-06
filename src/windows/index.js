/**
 * @desc    tauri2多窗口管理类
 * @author: andy  Q：282310962
 * @time    2024/9
 */

import { getAllWindows, getCurrentWindow } from '@tauri-apps/api/window'
import { WebviewWindow, getAllWebviewWindows, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { relaunch, exit } from '@tauri-apps/plugin-process'
import { emit, listen } from '@tauri-apps/api/event'
import { useRouter } from 'vue-router'
const router = useRouter()
const appWindow = getCurrentWindow()

// 窗口参数配置
export const windowConfig = {
  label: null,            // 窗口唯一label
  title: '',              // 窗口标题
  url: '',                // 路由地址url
  width: 800,            // 窗口宽度
  height: 600,            // 窗口高度
  minWidth: null,         // 窗口最小宽度
  minHeight: null,        // 窗口最小高度
  skipTaskbar: true,      // 是否跳过任务栏
  // x: null,                // 窗口相对于屏幕左侧坐标
  // y: null,                // 窗口相对于屏幕顶端坐标
  // center: true,           // 窗口居中显示
  // resizable: true,        // 是否支持缩放
  // maximizable: true,      // 是否支持最大化
  // minimizable: true,      // 是否支持最小化
  // transparent: false,     // 窗口是否透明
  // fullscreen: false,      // 窗口是否全屏
  // decorations: false,     // 窗口是否装饰边框及导航条
  // alwaysOnTop: false,     // 置顶窗口
  // dragDropEnabled: false, // 禁止系统拖放
  visible: false,         // 隐藏窗口

  // // ...
}

class Windows {
  constructor() {
    // ...
  }

  // 创建新窗口
  async createWin(options, params) {
    const args = Object.assign({}, windowConfig, options)
    console.log("创建窗口参数:", options, args)
    // 判断窗口是否存在
    const existWin = await this.getWin(args.label)
    if (existWin) {
      console.log("新窗口存在:", args.label)
      await existWin.close()
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 300)
    })
    // 创建窗口对象
    const win = new WebviewWindow(args.label, args)

    // 窗口创建完毕/失败
    win.once('tauri://created', async () => {
      win.hide()
    })

    win.once(`window-ready-${args.label}`, async () => {
      console.log(`收到窗口 ${args.label} 就绪信号，正在发送数据...`);
      // 收到就绪信号后，再发送数据
      await emit(`init-data-${args.label}`, params);
    });

    win.once('tauri://error', async (error) => {
      // 窗口创建失败
      console.log('窗口创建失败>>', error)
    })
    return win
  }

  // 获取窗口
  async getWin(label) {
    return await WebviewWindow.getByLabel(label)
  }

  // 获取全部窗口
  async getAllWin() {
    //  return getAll()
    return await getAllWindows()
  }

  // 开启主进程监听事件
  async listen() {
    console.log('——+——+——+——+——+开始监听窗口')

    // 创建新窗体
    await listen('win-create', (event) => {
      console.log(event)
      this.createWin(event.payload)
    })

    // 显示窗体
    await listen('win-show', async (event) => {
      if (appWindow.label.indexOf('main') == -1) return
      await appWindow.show()
      await appWindow.unminimize()
      await appWindow.setFocus()
    })

    // 隐藏窗体
    await listen('win-hide', async (event) => {
      if (appWindow.label.indexOf('main') == -1) return
      await appWindow.hide()
    })

    // 关闭窗体
    await listen('win-close', async (event) => {
      await appWindow.close()
    })

    // ...
  }
}

export default Windows
