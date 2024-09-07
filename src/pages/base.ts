import { test as base } from "@playwright/test";
import { LoginPage } from "./login-page";
import { InventoryPage } from "./inventory-page";
import { CartPage } from "./cart-page";
import { CheckoutOverviewPage } from "./checkout-overview-page";
import { CheckoutInformationPage } from "./checkout-infomation-page";
import { CheckoutCompletePage } from "./checkout-complete-page";

type baseFixtures = {
    loginPage: LoginPage,
    inventoryPage: InventoryPage,
    cartPage: CartPage,
    checkoutInformationPage: CheckoutInformationPage,
    checkoutOverviewPage: CheckoutOverviewPage,
    checkoutCompletePage: CheckoutCompletePage,
}

export const test = base.extend<baseFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    checkoutInformationPage: async ({ page }, use) => {
        await use(new CheckoutInformationPage(page));
    },
    checkoutOverviewPage: async ({ page }, use) => {
        await use(new CheckoutOverviewPage(page));
    },
    checkoutCompletePage: async ({ page }, use) => {
        await use(new CheckoutCompletePage(page));
    },
})