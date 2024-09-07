const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
    keyFile: "credential.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

let authClientObject = {};
let googleSheetsInstance = {};
let countUpdated = 0;

/**
 * 
 * @param {*} data - report data from test-result.json
 * @param {*} configUpdate - { 
 * columnFind:'A' ,
 * columnUpdate:'I',
 * columnUpdatedAt:'J',
 * sheetRowStart: 7,
 * sheetName: '',
 * spreadsheetId: '',
 * }
 */
async function updateSheet(data, configUpdate) {
    authClientObject = await auth.getClient();
    googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    await readReport(data, configUpdate);
}

async function findCell(txtSearch, status, configUpdate) {
    try {
        //Read from the spreadsheet
        const {
            sheetName = '',
            columnFind = 'A',
            sheetRowStart = 1,
            spreadsheetId = '',
        } = configUpdate;
        const readData = await googleSheetsInstance.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}!${columnFind}${sheetRowStart}:${columnFind}`,
        })

        for (i = 0; i < readData.data.values.length; i++) {
            const tmp = readData.data.values[i]
            if (tmp[0]) { // Is cell blank -> undefined
                if (txtSearch.includes(tmp[0])) {
                    console.log(tmp[0], '->', txtSearch, status);
                    return updateCell(i, status, configUpdate);
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function updateCell(index, status, configUpdate) {
    try {
        countUpdated += 1;

        const {
            sheetName = '',
            columnUpdate = 'B',
            columnUpdatedAt = 'C',
            sheetRowStart = 1,
            spreadsheetId = '',
        } = configUpdate;

        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: `${sheetName}!${columnUpdate}${sheetRowStart + index}:${columnUpdate}${sheetRowStart + index}`, //sheet name and range of cells
            valueInputOption: "RAW", // The information will be passed according to what the usere passes in as date, number or text
            resource: {
                values: [[status ? 'Pass' : 'Fail']],
            },
        });

        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: `${sheetName}!${columnUpdatedAt}${sheetRowStart + index}:${columnUpdatedAt}${sheetRowStart + index}`, //sheet name and range of cells
            valueInputOption: "RAW", // The information will be passed according to what the usere passes in as date, number or text
            resource: {
                values: [[new Date().toLocaleString()]],
            },
        });
    } catch (e) {

    }
}

/**
 * 
 * @param {*} data 
 * @param {*} configUpdate - { columnFind:'A' ,columnUpdate:'I' ,columnUpdatedAt:'J'}
 */
async function readReport(data, configUpdate) {
    for (let i = 0; i < data.suites.length; i++) {
        const specsFile = data.suites[i].suites;
        for (let j = 0; j < specsFile.length; j++) {
            const { title = '', specs = [] } = specsFile[j];
            console.log(title);
            for (const item of specs) {
                // console.log(item.title);
                await findCell(item.title, item.ok, configUpdate);
            }
        }
    }

    console.log(`updated ${countUpdated} record${countUpdated > 1 ? 's' : ''}`);
}

module.exports = {
    updateSheet,
}