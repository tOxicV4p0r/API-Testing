import { expect, Page } from "@playwright/test";
import { removeLastUrl } from "../utils";

export class LoginPage {

    private baseUrl: string = "https://www.saucedemo.com";
    private page: Page;

    private buttonLogin: string = "#login-button";
    private inputUsername: string = "#user-name";
    private inputPassword: string = "#password";

    private titleText: string = "Swag Labs";
    private locatorLogo: string = ".login_logo";
    private errorMessage: string = ".error-message-container h3";


    constructor(page: Page) {
        this.page = page;
    }

    async goto(): Promise<void> {
        await this.page.goto(this.baseUrl);
        await this.waitForTitle();
    }

    async login(username: string, password: string): Promise<void> {
        await this.page.fill(this.inputUsername, username, { timeout: 5000 });
        await this.page.fill(this.inputPassword, password, { timeout: 5000 });
        await this.page.click(this.buttonLogin);
        expect(await this.isFoundErrorMessage(), 'Found error message').toBe(false);
    }

    async fillUsername(username: string): Promise<void> {
        await this.page.fill(this.inputUsername, username, { timeout: 5000 });
        expect(await this.page.locator(this.inputUsername).inputValue()).toBe(username);
    }

    async fillPassword(password: string): Promise<void> {
        await this.page.fill(this.inputPassword, password, { timeout: 5000 });
        expect(await this.page.locator(this.inputPassword).inputValue()).toBe(password);
    }

    async clickLogin(): Promise<void> {
        await this.page.click(this.buttonLogin);
    }

    async isFoundErrorMessage(): Promise<boolean> {
        try {
            await this.page.waitForSelector(this.errorMessage, { timeout: 1000 })
            return true;
        } catch (e) {
            return false;
        }
    }

    async getErrorMessage(): Promise<string> {
        try {
            const text = await this.page.locator(this.errorMessage).textContent({ timeout: 1000 });
            return text ? text : "";
        } catch (e) {
            return "";
        }
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
        await expect(this.page.locator(this.locatorLogo).getByText(this.titleText)).toBeVisible({ timeout: 5000 });
    }
}