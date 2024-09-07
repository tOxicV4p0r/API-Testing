const { expect } = require("@playwright/test");
const { test } = require("../../pages/base");

const users = require('../../test-data/e2e/users.json');
const userInfo = require('../../test-data/e2e/user-information.json');
const searchItems = require('../../test-data/e2e/search-items.json');

test.describe('Buy item', () => {

    test.describe.configure({ mode: "serial" });
    let cartItems = [];

    test('Buy item from search', async ({
        page,
        loginPage,
        inventoryPage,
        cartPage,
        checkoutInformationPage,
        checkoutOverviewPage,
        checkoutCompletePage,
    }, testInfo) => {

        // login page
        await test.step('Log in', async () => {
            await loginPage.goto();
            expect.soft(await loginPage.isValidPage()).toBe(true);

            await loginPage.login(users[3].username, users[3].password);

            expect.soft(await loginPage.isValidURL()).toBe(false);
        });

        // Product page
        await test.step('Navigate to to product page', async () => {
            await inventoryPage.goto();
            expect.soft(await inventoryPage.isValidPage()).toBe(true);
        });

        await test.step('Search for an item and add it to the cart', async () => {
            expect.soft(await inventoryPage.isValidPage(), 'correct page').toBe(true);
            cartItems = await inventoryPage.selectItems(searchItems);
        });

        await test.step('Is item found', async () => {
            expect.soft(cartItems.length, `Found ${cartItems.length} item`).toBeGreaterThan(0);
        });

        await test.step('Proceed to the next page', async () => {
            await inventoryPage.goToCartPage();
            expect.soft(await inventoryPage.isValidURL()).toBe(false);
        })

        // Cart page
        await test.step('Navigate to the cart page', async () => {
            await cartPage.goto();
            expect.soft(await cartPage.isValidPage()).toBe(true);
        });

        await test.step('Verify the item count matches the badge number', async () => {
            const cartCount = await cartPage.getCartCount();
            expect.soft(cartCount === cartItems.length).toBe(true);
        });

        await test.step('Verify the item count matches the item element', async () => {
            const itemCartCount = await cartPage.getCartItemCount();
            expect.soft(itemCartCount === cartItems.length).toBe(true);
        });

        await test.step('Confirm the item name and price are displayed correctly', async () => {
            // Check Item name , price -remove
            await cartPage.adjustCartItem(cartItems);
        });

        await test.step('Proceed to the next page', async () => {
            await cartPage.gotoCheckout();
            expect(await cartPage.isValidURL()).toBe(false);
        });

        // Checkout information page
        await test.step('Navigate to the checkout information page', async () => {
            await checkoutInformationPage.goto();
            expect.soft(await checkoutInformationPage.isValidPage()).toBe(true);
        });

        await test.step('Fill in the client information', async () => {
            await checkoutInformationPage.fillInfomation(userInfo.firstName, userInfo.lastName, userInfo.postCode);
        });

        await test.step('Proceed to the next page', async () => {
            await checkoutInformationPage.goToCheckoutOverviewPage();
            expect.soft(await checkoutInformationPage.isValidURL()).toBe(false);
        });

        // Checkout overview page
        await test.step('Navigate to the checkout overview page', async () => {
            await checkoutOverviewPage.goto();
            expect.soft(await checkoutOverviewPage.isValidPage()).toBe(true);
        });

        await test.step('Verify the cart item list', async () => {
            expect.soft(await checkoutOverviewPage.isCorrectedCartItem(cartItems), 'Incorrect cart item list').toBe(true);
        });

        await test.step('Confirm the price is calculated correctly', async () => {
            const totalPrice = sumPrice(cartItems);
            expect.soft(await checkoutOverviewPage.isCorrectedTotalPrice(totalPrice), 'Incorrect total price').toBe(true);;
            expect.soft(await checkoutOverviewPage.isCorrectedGrandTotalPrice(totalPrice), 'Incorrect grand total').toBe(true);
            expect.soft(await checkoutOverviewPage.isCorrectedTax(totalPrice), 'Incorrect tax').toBe(true);
        });

        await test.step('Proceed to the next page', async () => {
            await checkoutOverviewPage.goToCheckoutCompletePage();
            expect.soft(await checkoutOverviewPage.isValidURL()).toBe(false);
        });

        // Checkout complete page
        await test.step('Navigate to the checkout complete page', async () => {
            await checkoutCompletePage.goto();
            expect.soft(await checkoutCompletePage.isValidPage()).toBe(true);
        });

        await test.step('Verify the completion message is displayed', async () => {
            expect.soft(await checkoutCompletePage.getCompleteHeaderText()).toEqual('Thank you for your order!');
            expect.soft(await checkoutCompletePage.getCompleteText()).toEqual('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
        });

        await test.step('Return to the product page', async () => {
            await checkoutCompletePage.gotoHomePage();
            expect.soft(await inventoryPage.isValidPage()).toBe(true);
        });
    });

});

function sumPrice(items) {

    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        const price = items[i].price;
        sum += price;
    }

    return sum;
}

