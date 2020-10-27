/*
 * @Author: lizhiyuan
 * @Date: 2020-10-26 21:09:35
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-27 10:16:34
 */
// 将内容写入到excel文件中去
require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime');
const Excel = require('exceljs/dist/es5');
// 写入文件
const workbook = new Excel.Workbook();
const sheet = workbook.addWorksheet("my Sheet");
async function main(){
    sheet.getColumn(6).values = [1,2,3,4,5];
    await workbook.xlsx.writeFile('./test.xlsx');
}
main()

