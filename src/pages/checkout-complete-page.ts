import { expect, Locator, Page } from "@playwright/test";
import { removeLastUrl } from "../utils";

export class CheckoutCompletePage {

    private baseUrl: string = "https://www.saucedemo.com/checkout-complete.html";
    private page: Page;

    private buttonBackToHome: string = "#back-to-products";

    private titleText: string = "Checkout: Complete!";
    private locatorTitle: string = "span.title";
    private locatorCompleteHeader: string = ".complete-header";
    private locatorCompleteText: string = ".complete-text";
    private locatorCartBadge: string = "span.shopping_cart_badge";

    constructor(page: Page) {
        this.page = page;
    }

    async goto(): Promise<void> {
        await this.page.goto(this.baseUrl);
        await this.waitForTitle();
    }

    async isValidPage(): Promise<boolean> {
        await this.waitForTitle();
        return this.isValidURL();
    }

    isValidURL(): boolean {
        const url = removeLastUrl(this.page.url());
        return url === this.baseUrl;
    }

    async waitForTitle(): Promise<void> {
        await expect(this.page.getByText(this.titleText)).toBeVisible({ timeout: 5000 });
    }

    async getCompleteHeaderText(): Promise<string> {
        const text = await this.page.locator(this.locatorCompleteHeader).textContent();
        return text ? text : "";
    }

    async getCompleteText(): Promise<string> {
        const text = await this.page.locator(this.locatorCompleteText).textContent();
        return text ? text : "";
    }

    async getTitleText(): Promise<string> {
        const text = await this.page.locator(this.locatorTitle).textContent();
        return text ? text : "";
    }

    async getCartCount(): Promise<number> {
        try {
            const count = await this.page.locator(this.locatorCartBadge).textContent({ timeout: 1000 });
            return count ? Number(count) : 0;
        } catch (e) {
            return 0;
        }
    }

    async gotoHomePage(): Promise<void> {
        await this.page.click(this.buttonBackToHome);

        expect(this.isValidURL()).toBe(false);
    }
}