const { updateSheet } = require("./update-test-result");

(async () => {
    const data = require('../../test-results/api-test-results.json');
    await updateSheet(data, {
        columnFind: 'A',
        columnUpdate: 'I',
        columnUpdatedAt: 'J',
        sheetRowStart: 7,
        sheetName: 'API Test',
        spreadsheetId: '1HOljVvGWaMCAPEnb0JLag8NJ6cXI7GPAJIZcmz33QvI',
    })
})();