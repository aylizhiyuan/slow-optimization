/*
 * @Author: lizhiyuan
 * @Date: 2020-12-30 10:59:07
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-12-30 17:56:20
 */
// 让CPU保持100%运行状态的代码
// const fib = n => {
//     if (n === 0) return 0;
//     else if (n === 1) return 1;
//     else return fib(n - 1) + fib(n - 2);
// }
// const now = Date.now();
// const result1 = fib(1000);
// console.log(Date.now() - now);
// const result2 = fib(1000);
// console.log(Date.now() - now);
// const result3 = fib(1000);
// console.log(Date.now() - now);

// CPU标高的主要原因还是执行运算,取指不会造成CPU标高,从寄存器中读入数据也不会造成标高,访问内存
// 以及写回到寄存器文件也不会造成大面积的CPU标高

// 单纯的大量循环也会让CPU标高..毕竟也是运算的,比较大小

// var arr = [];
// for(var i=0;i<10000000000;i++){
//     // arr.push[i];
// }
// console.log('执行完毕了.....');

// 从这个理论推导的话,大量的数据的过滤、排序、都需要循环去做,同样会导致CPU升高....












