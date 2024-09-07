const { updateSheet } = require("./update-test-result");

(async () => {
    const data = require('../../test-results/e2e-test-results.json');
    await updateSheet(data, {
        columnFind: 'A',
        columnUpdate: 'I',
        columnUpdatedAt: 'J',
        sheetRowStart: 9,
        sheetName: 'Test UI',
        spreadsheetId: '1HOljVvGWaMCAPEnb0JLag8NJ6cXI7GPAJIZcmz33QvI',
    })
})();