import { expect, Page } from "@playwright/test";
import { removeLastUrl } from "../utils";

export class CheckoutInformationPage {

    private baseUrl: string = "https://www.saucedemo.com/checkout-step-one.html";
    private page: Page;

    private inputFirstName: string = "#first-name";
    private inputLastName: string = "#last-name";
    private inputPostCode: string = "#postal-code";

    private buttonCancel: string = "#cancel";
    private buttonContinue: string = "#continue";

    private locatorTitle: string = "Checkout: Your Information";

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
        await expect(this.page.getByText(this.locatorTitle)).toBeVisible({ timeout: 5000 });
    }

    async fillFirstName(text: string): Promise<void> {
        await this.page.fill(this.inputFirstName, text);
        expect.soft(await this.page.locator(this.inputFirstName).inputValue(), `Fistname not equal to ${text}`).toBe(text);
    }

    async fillLastName(text: string): Promise<void> {
        await this.page.fill(this.inputLastName, text);
        expect.soft(await this.page.locator(this.inputLastName).inputValue(), `Lastname not equal to ${text}`).toBe(text);
    }

    async fillPostCode(text: string): Promise<void> {
        await this.page.fill(this.inputPostCode, text);
        expect.soft(await this.page.locator(this.inputPostCode).inputValue(), `Postcode not equal to ${text}`).toBe(text);
    }

    async fillInfomation(firstName: string, lastName: string, postCode: string): Promise<void> {
        await this.fillFirstName(firstName);
        await this.fillLastName(lastName);
        await this.fillPostCode(postCode);
    }

    async isFoundErrorMessage(): Promise<boolean> {
        try {
            await this.page.waitForSelector('.error-message-container h3', { timeout: 1000 })
            return true;
        } catch (e) {
            return false;
        }
    }

    async goToCheckoutOverviewPage(): Promise<void> {
        await this.page.click(this.buttonContinue);
        expect.soft(await this.isFoundErrorMessage(), 'Found error message').toBe(false);

        const url = removeLastUrl(this.page.url());
        expect.soft(url === this.baseUrl).toBe(false);
    }

    async gotoContinue(): Promise<void> {
        await this.page.click(this.buttonContinue);
    }

    async gotoCancel(): Promise<void> {
        await this.page.click(this.buttonCancel);

        expect(this.isValidURL()).toBe(false);
    }
}