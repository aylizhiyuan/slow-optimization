/*
 * @Author: lizhiyuan
 * @Date: 2020-10-26 21:09:26
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-27 10:05:15
 */
// 将excel里面的内容读出来
const Excel = require('exceljs');
const workbook = new Excel.Workbook();
const fs = require("fs");
const stream = fs.createReadStream('./1.xlsx');
async function main(){
    // await workbook.xlsx.readFile('./1.xlsx');
    // 以流的方式读出...
    await workbook.xlsx.read(stream);
    workbook.eachSheet(function(worksheet, sheetId) {
        var worksheet = worksheet;
        worksheet.eachRow(function(row, rowNumber) {
            console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
        });
    });
}
main();

