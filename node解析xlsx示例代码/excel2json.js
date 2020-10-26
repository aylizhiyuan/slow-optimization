/*
 * @Author: lizhiyuan
 * @Date: 2020-10-26 21:09:26
 * @LastEditors: lizhiyuan
 * @LastEditTime: 2020-10-26 22:11:26
 */
// 将excel里面的内容读出来
const Excel = require('exceljs');
const workbook = new Excel.Workbook();
async function main(){
    await workbook.xlsx.readFile('./1.xlsx');
    workbook.eachSheet(function(worksheet, sheetId) {
        var worksheet = worksheet;
        worksheet.eachRow(function(row, rowNumber) {
            console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
        });
    });
    
}
main();

