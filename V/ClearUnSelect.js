function deepCleanMain(target) {

  // 数组
  if (Array.isArray(target)) {
    let hasMain = false;
    for (let i = target.length - 1; i >= 0; i--) {
      const childHasMain = deepCleanMain(target[i]);
      if (!childHasMain) {
        target.splice(i, 1);          // 删除数组中无效元素
      } else {
        hasMain = true;
      }
    }
    return hasMain;
  }

  // 普通对象
  const keys = Object.keys(target);
  let hasMain = keys.includes('main');

  for (const key of keys) {
    if(typeof target[key]==='object'&&key!=='main'){
      const childHasMain = deepCleanMain(target[key]);
      if (!childHasMain) {
        delete target[key];             // 删除对象中无效属性
      } else {
        hasMain = true;
      }
    }
  }

  return hasMain;
} 