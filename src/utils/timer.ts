/*
 * @Description:定时器方法
 */
//自动清理的单次定时器
export const autoClearTimer = (func: Function, delay: any = 0) => {
  let timer = setTimeout(() => {
    func();
    clearInterval(timer);
  }, delay);
};
