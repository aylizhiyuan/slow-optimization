/*
 * @Author: lizhiyuan
 * @Date: 2020-10-26 21:09:35
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-26 22:27:10
 */
// 将内容写入到excel文件中去
const Excel = require('exceljs');
// 写入文件
const workbook = new Excel.Workbook();
async function main(){
    await workbook.xlsx.writeFile('./test.xlsx');
}
main()

