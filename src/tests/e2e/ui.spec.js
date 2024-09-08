const { expect } = require("@playwright/test");
const { test } = require("../../pages/base");
const { validUsers, lockedUsers, problemUsers } = require("../../test-data/e2e/users");
const { LoginPage } = require("../../pages/login-page");

const userInfo = require('../../test-data/e2e/user-information.json');

const VALID_USERNAME = problemUsers[0].username;
const VALID_PASSWORD = problemUsers[0].password;
const TAX = 0.08;

test.describe('LOGIN PAGE', () => {
    /*
        Input fields display as the data that was filled
        Show an error message if attempting to log in without a username
        Show an error message if attempting to log in without a password
        Show an error message if attempting to log in with both fields blank
        Should logged in successfully with valid credentials
        Should logged in fails with a error message when using locked credentials
    */
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
        expect.soft(await loginPage.isValidPage()).toBe(true);
    })

    test('TC-001: Input fields display as the data that was filled', async ({ loginPage }) => {
        await loginPage.fillUsername(VALID_USERNAME);
        await loginPage.fillPassword(VALID_PASSWORD);
    });

    test('TC-002: Show an error message if attempting to log in without a username', async ({ loginPage }) => {
        await loginPage.fillPassword(VALID_PASSWORD);
        await loginPage.clickLogin();
        expect(await loginPage.getErrorMessage()).toContain('Username is required');
    });

    test('TC-003: Show an error message if attempting to log in without a password', async ({ loginPage }) => {
        await loginPage.fillUsername(VALID_USERNAME);
        await loginPage.clickLogin();
        expect(await loginPage.getErrorMessage()).toContain('Password is required');
    });

    test('TC-004: Show an error message if attempting to log in with both fields blank', async ({ loginPage }) => {
        await loginPage.fillUsername("");
        await loginPage.fillPassword("");
        await loginPage.clickLogin();
        expect(await loginPage.getErrorMessage()).toContain('Username is required');
    });

    validUsers.forEach(({ username, password }) => {
        test(`TC-005: Should logged in successfully with valid credentials :"${username}"`, async ({ loginPage }) => {
            await loginPage.fillUsername(username);
            await loginPage.fillPassword(password);
            await loginPage.clickLogin();
            expect(await loginPage.getErrorMessage()).toEqual("");
            expect(loginPage.isValidURL()).toBe(false);
        });
    });

    lockedUsers.forEach(({ username, password }) => {
        test(`TC-006: Should logged in fails with a error message when using locked credentials :"${username}"`, async ({ loginPage }) => {
            await loginPage.fillUsername(username);
            await loginPage.fillPassword(password);
            await loginPage.clickLogin();
            expect(await loginPage.getErrorMessage()).toContain("user has been locked out");
            expect(loginPage.isValidURL()).toBe(true);
        });
    });
});

test.describe('PRODUCT PAGE', () => {
    /*
        More than 0 products are displayed
        Each Item displays a picture
        Each item displays a price
        Each item displays a title
        Each item displays a description
        Add all items to the cart, then remove all items from the cart.
        items are sorted by title from A to Z
        items are sorted by title from Z to A
        items are sorted by price from low to high
        items are sorted by price from high to low
        Navigate to the cart page when clicking the cart icon
    */

    test.beforeEach(async ({ page, inventoryPage }) => {
        await setupValidLogin(page, VALID_USERNAME, VALID_PASSWORD);
        await inventoryPage.goto();
    });

    test('TC-007: More than 0 products are displayed', async ({ inventoryPage }) => {
        expect(await inventoryPage.countItem()).toBeGreaterThan(0);
    });

    test('TC-008: Each Item displays a picture', async ({ inventoryPage }) => {
        expect(await inventoryPage.isShownAllItemImage()).toBe(true);
    });

    test('TC-009: Each item displays a price', async ({ inventoryPage }) => {
        expect(await inventoryPage.isShownAllItemPrice()).toBe(true);
    });

    test('TC-010: Each item displays a title', async ({ inventoryPage }) => {
        expect(await inventoryPage.isShownAllItemTitle()).toBe(true);
    });

    test('TC-011: Each item displays a description', async ({ inventoryPage }) => {
        expect(await inventoryPage.isShownAllItemDesciption()).toBe(true);
    });

    test('TC-012: Add all items to the cart, then remove all items from the cart', async ({ inventoryPage }) => {
        expect(await inventoryPage.canAddAndRemoveAll()).toBe(true);
    });

    test('TC-013: items are sorted by title from A to Z', async ({ inventoryPage, page }) => {
        await inventoryPage.selectSort('az');
        expect(await inventoryPage.isSortAtoZ()).toBe(true);
    });

    test('TC-014: items are sorted by title from Z to A', async ({ inventoryPage }) => {
        await inventoryPage.selectSort('za');
        expect(await inventoryPage.isSortZtoA()).toBe(true);
    });

    test('TC-015: items are sorted by price from low to high', async ({ inventoryPage }) => {
        await inventoryPage.selectSort('lohi');
        expect(await inventoryPage.isSortLowToHigh()).toBe(true);
    });

    test('TC-016: items are sorted by price from high to low', async ({ inventoryPage }) => {
        await inventoryPage.selectSort('hilo');
        expect(await inventoryPage.isSortHighToLow()).toBe(true);
    });

    test('TC-017: Navigate to the cart page when clicking the cart icon', async ({ inventoryPage, cartPage }) => {
        await inventoryPage.goToCartPage();
        expect(await cartPage.isValidPage()).toBe(true);
    });

});

test.describe('CART PAGE', () => {
    /*
        Display the number of items as the cart badge number
        Item name and price match the selection from the product page
        When clicking "Remove", the item should be removed from the cart
        When clicking "Continue Shopping", navigate back to the product page
        When clicking "Checkout", proceed to the checkout information page
    */

    let cartItems = [];

    test.beforeEach(async ({ page, inventoryPage }) => {
        await setupValidLogin(page, VALID_USERNAME, VALID_PASSWORD);
        await inventoryPage.goto();
        cartItems = await inventoryPage.selectItem(2);
        await inventoryPage.goToCartPage();
    });

    test('TC-018: Display the number of items as the cart badge number', async ({ cartPage }) => {
        expect(await cartPage.isCartBadgeEqualToItem()).toBe(true);
    });

    test('TC-019: Item name and price match the selection from the product page', async ({ cartPage }) => {
        await cartPage.isCartMatchCartItem(cartItems);
    });

    test('TC-020: When clicking "Remove", the item should be removed from the cart', async ({ cartPage }) => {
        await cartPage.removeAllItem();
        const cartCount = await cartPage.getCartCount();
        const itemCartCount = await cartPage.getCartItemCount();
        expect(cartCount).toBe(0);
        expect(itemCartCount).toBe(0);
    });

    test('TC-021: When clicking "Continue Shopping", navigate back to the product page', async ({ cartPage, inventoryPage }) => {
        await cartPage.gotoContinueShopping();
        expect(inventoryPage.isValidURL()).toBe(true);
    });

    test('TC-022: When clicking "Checkout", proceed to the checkout information page', async ({ cartPage, checkoutInformationPage }) => {
        await cartPage.gotoCheckout();
        expect(checkoutInformationPage.isValidURL()).toBe(true);
    });

});

test.describe('CHECKOUT INFORMATION PAGE', () => {
    /*
        When clicking "Cancel", navigate back to the cart page
        When clicking "Continue" without any client information, display an error message
        When clicking "Continue" with some client information, display an error message
        When clicking "Continue" with all client information, proceed to the checkout overview page
    */

    test.beforeEach(async ({ page, inventoryPage, cartPage }) => {
        await setupValidLogin(page, VALID_USERNAME, VALID_PASSWORD);
        await inventoryPage.goto();
        await inventoryPage.selectItem(2);
        await inventoryPage.goToCartPage();
        await cartPage.gotoCheckout();
    });

    test('TC-023: When clicking "Cancel", navigate back to the cart page', async ({ checkoutInformationPage, cartPage }) => {
        await checkoutInformationPage.gotoCancel();
        expect(cartPage.isValidURL()).toBe(true);
    });

    test('TC-024: When clicking "Continue" without any client information, display an error message', async ({ checkoutInformationPage }) => {
        await checkoutInformationPage.gotoContinue();

        expect(await checkoutInformationPage.isFoundErrorMessage()).toBe(true);
    });

    test('TC-025: When clicking "Continue" with some client information, display an error message', async ({ checkoutInformationPage }) => {
        await checkoutInformationPage.goto();
        await checkoutInformationPage.fillFirstName(userInfo.firstName)
        await checkoutInformationPage.gotoContinue();
        expect.soft(await checkoutInformationPage.isFoundErrorMessage(), 'Should show error message').toBe(true);

        await checkoutInformationPage.goto();
        await checkoutInformationPage.fillFirstName("")
        await checkoutInformationPage.fillLastName(userInfo.lastName);
        await checkoutInformationPage.gotoContinue();
        expect.soft(await checkoutInformationPage.isFoundErrorMessage(), 'Should show error message').toBe(true);

        await checkoutInformationPage.goto();
        await checkoutInformationPage.fillFirstName("")
        await checkoutInformationPage.fillLastName("");
        await checkoutInformationPage.fillPostCode(userInfo.postCode);
        await checkoutInformationPage.gotoContinue();
        expect.soft(await checkoutInformationPage.isFoundErrorMessage(), 'Should show error message').toBe(true);

        await checkoutInformationPage.goto();
        await checkoutInformationPage.fillFirstName(userInfo.firstName)
        await checkoutInformationPage.fillLastName("");
        await checkoutInformationPage.fillPostCode(userInfo.postCode);
        await checkoutInformationPage.gotoContinue();
        expect.soft(await checkoutInformationPage.isFoundErrorMessage(), 'Should show error message').toBe(true);

        await checkoutInformationPage.goto();
        await checkoutInformationPage.fillFirstName(userInfo.firstName)
        await checkoutInformationPage.fillLastName(userInfo.lastName);
        await checkoutInformationPage.fillPostCode("");
        await checkoutInformationPage.gotoContinue();
        expect.soft(await checkoutInformationPage.isFoundErrorMessage(), 'Should show error message').toBe(true);
    });

    test('TC-026: When clicking "Continue" with all client information, proceed to the checkout overview page', async ({ checkoutInformationPage, checkoutOverviewPage }) => {
        await checkoutInformationPage.fillInfomation(userInfo.firstName, userInfo.lastName, userInfo.postCode);
        await checkoutInformationPage.goToCheckoutOverviewPage();
        expect(checkoutOverviewPage.isValidURL()).toBe(true);
    });
});

test.describe('CHECKOUT OVERVIEW PAGE', () => {
    /*
        Display the number of items as the cart badge number
        Item name and price match the selection from the product page
        Correctly calculate the total, tax, and grand total
        When clicking "Cancel", navigate back to the product page
        When clicking "Finish", process to the checkout complete page
    */

    let cartItems = [];

    test.beforeEach(async ({ page, inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage }) => {
        await setupValidLogin(page, VALID_USERNAME, VALID_PASSWORD);
        await inventoryPage.goto();
        cartItems = await inventoryPage.selectItem(2);
        await inventoryPage.goToCartPage();
        // await cartPage.gotoCheckout();
        // await checkoutInformationPage.fillInfomation(userInfo.firstName, userInfo.lastName, userInfo.postCode, false);
        // await checkoutInformationPage.goToCheckoutOverviewPage();
        await checkoutOverviewPage.goto();
    });

    test('TC-027: Display the number of items as the cart badge number', async ({ checkoutOverviewPage }) => {
        const cartBadgeCount = await checkoutOverviewPage.getCartCount();
        const itemCartCount = await checkoutOverviewPage.getCartItemCount();
        expect(cartBadgeCount === itemCartCount).toBe(true);
    });

    test('TC-028: Item name and price match the selection from the product page', async ({ checkoutOverviewPage }) => {
        expect(await checkoutOverviewPage.isCorrectedCartItem(cartItems)).toBe(true);
    });

    test('TC-029: Correctly calculate the total, tax, and grand total', async ({ checkoutOverviewPage }) => {
        const totalPrice = sumPrice(cartItems);

        expect.soft(await checkoutOverviewPage.getTotalPrice(), `Total price :${totalPrice}`).toBe(totalPrice);

        const totalTax = Number((totalPrice * TAX).toFixed(2))
        expect.soft(await checkoutOverviewPage.getTax(), `Tax :${totalTax}`).toBe(totalTax);

        const totalPriceWTax = totalPrice + Number((totalPrice * TAX).toFixed(2));
        expect.soft(await checkoutOverviewPage.getGrandTotalPrice(), `Total price with tax :${totalPriceWTax}`).toBe(totalPriceWTax);
    });

    test('TC-030: When clicking "Cancel", navigate back to the product page', async ({ checkoutOverviewPage, inventoryPage }) => {
        await checkoutOverviewPage.gotoCancel();
        expect(inventoryPage.isValidURL()).toBe(true);
    });

    test('TC-031: When clicking "Finish", process to the checkout complete page', async ({ checkoutOverviewPage, checkoutCompletePage }) => {
        await checkoutOverviewPage.goToCheckoutCompletePage();
        expect(checkoutCompletePage.isValidURL()).toBe(true);
    });

});

test.describe('CHECKOUT COMPLETE PAGE', () => {
    /*
        Remove the cart badge number
        Display the complete message correctly
        When clicking "Back Home", navigate back to the product page
    */

    test.beforeEach(async ({ page, inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage }) => {
        await setupValidLogin(page, VALID_USERNAME, VALID_PASSWORD);
        await inventoryPage.goto();
        await inventoryPage.selectItem(2);
        await inventoryPage.goToCartPage();
        await cartPage.gotoCheckout();
        await checkoutInformationPage.fillInfomation(userInfo.firstName, userInfo.lastName, userInfo.postCode, false);
        await checkoutInformationPage.goToCheckoutOverviewPage();
        await checkoutOverviewPage.goToCheckoutCompletePage();
        await checkoutCompletePage.goto();
    });

    test('TC-032: Remove the cart badge number', async ({ checkoutCompletePage }) => {
        expect(await checkoutCompletePage.getCartCount()).toBe(0);
    });

    test('TC-033: Display the complete message correctly', async ({ checkoutCompletePage }) => {
        expect.soft(await checkoutCompletePage.getTitleText()).toEqual('Checkout: Complete!');
        expect.soft(await checkoutCompletePage.getCompleteHeaderText()).toEqual('Thank you for your order!');
        expect.soft(await checkoutCompletePage.getCompleteText()).toEqual('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
    });

    test('TC-034: When clicking "Back Home", navigate back to the product page', async ({ checkoutCompletePage, inventoryPage }) => {
        await checkoutCompletePage.gotoHomePage();
        expect(inventoryPage.isValidURL()).toBe(true);
    });
});

async function setupValidLogin(page, username, password) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillUsername(username);
    await loginPage.fillPassword(password);
    await loginPage.clickLogin();
}

function sumPrice(items) {

    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        const price = items[i].price;
        sum += price;
    }

    return sum;
}