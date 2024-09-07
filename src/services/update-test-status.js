const testResult = require('../../test-results/test-results.json');

const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
    keyFile: "credential.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const sheetName = 'API Test';
const spreadsheetId = '1HOljVvGWaMCAPEnb0JLag8NJ6cXI7GPAJIZcmz33QvI';
const sheetRowStart = 7;

let authClientObject = {};
let googleSheetsInstance = {};
let countUpdated = 0;

async function init() {
    authClientObject = await auth.getClient();
    googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    readReport();
}

async function findCheckpoint(txtSearch, status) {
    try {
        //Read from the spreadsheet
        const readData = await googleSheetsInstance.spreadsheets.values.get({
            auth,
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!A${sheetRowStart}:A`,
        })

        for (i = 0; i < readData.data.values.length; i++) {
            const tmp = readData.data.values[i]
            if (tmp[0]) { // Is cell blank -> undefined
                if (txtSearch.toLowerCase().includes(tmp[0].toLowerCase())) {
                    console.log(tmp[0], '->', status);
                    return updateCheckpoint(i, status);
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function updateCheckpoint(index, status) {
    try {
        countUpdated += 1;
        // console.log('update: ', `${sheetName}!J${sheetRowStart + index}:J${sheetRowStart + index}`, status);
        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: `${sheetName}!I${sheetRowStart + index}:I${sheetRowStart + index}`, //sheet name and range of cells
            valueInputOption: "RAW", // The information will be passed according to what the usere passes in as date, number or text
            resource: {
                values: [[status ? 'Pass' : 'Fail']],
            },
        });

        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: `${sheetName}!J${sheetRowStart + index}:J${sheetRowStart + index}`, //sheet name and range of cells
            valueInputOption: "RAW", // The information will be passed according to what the usere passes in as date, number or text
            resource: {
                values: [[new Date().toLocaleString()]],
            },
        });
    } catch (e) {

    }
}

async function readReport() {
    for (let i = 0; i < testResult.suites.length; i++) {
        const specsFile = testResult.suites[i].suites;
        for (let j = 0; j < specsFile.length; j++) {
            const specSuites = specsFile[j].suites;
            for (let k = 0; k < specSuites.length; k++) {
                const { title = '', specs = [] } = specSuites[k];
                // console.log(title);
                for (const item of specs) {
                    await findCheckpoint(item.title, item.ok);
                }
            }
        }
    }

    console.log(`updated ${countUpdated} record${countUpdated > 1 ? 's' : ''}`);
}

init();