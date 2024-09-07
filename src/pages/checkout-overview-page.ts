import { expect, Locator, Page } from "@playwright/test";
import { removeLastUrl } from "../utils";

export class CheckoutOverviewPage {

    private baseUrl: string = "https://www.saucedemo.com/checkout-step-two.html";
    private page: Page;

    private locatorCartItem: string = "div.cart_item";
    private locatorItemName: string = "div.inventory_item_name";
    private locatorItemPrice: string = "div.inventory_item_price";
    private locatorCartBadge: string = "span.shopping_cart_badge";
    private buttonCancel: string = "#cancel";
    private buttonFinish: string = "#finish";

    private locatorTitle: string = "Checkout: Overview";

    private granTotalPrice: string = "div.summary_total_label";
    private totalPrice: string = "div.summary_subtotal_label";
    private tax: string = "div.summary_tax_label";

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

    async goToCheckoutCompletePage(): Promise<void> {
        await this.page.click(this.buttonFinish);

        expect(this.isValidURL()).toBe(false);
    }

    async gotoCancel(): Promise<void> {
        await this.page.click(this.buttonCancel);

        expect(this.isValidURL()).toBe(false);
    }

    async getItemName(element: Locator): Promise<string> {
        const text = await element.locator(this.locatorItemName).textContent();
        return text ? text : "";
    }

    async getItemPrice(element: Locator): Promise<number> {
        const price = await element.locator(this.locatorItemPrice).textContent();
        return price ? Number(price.replace('$', '')) : 0;
    }

    async getTotalPrice(): Promise<number> {
        return await this.getNumber(this.totalPrice);
    }

    async getTax(): Promise<number> {
        return await this.getNumber(this.tax);
    }

    async getGrandTotalPrice(): Promise<number> {
        return await this.getNumber(this.granTotalPrice);
    }

    async getNumber(strLocator: string): Promise<number> {
        const text = await this.page.locator(strLocator).textContent();
        if (!text) {
            return 0;
        }

        return Number(text.substring(text.indexOf('$') + 1));
    }

    getElement(index: number): Locator {
        return this.page.locator(this.locatorCartItem).nth(index);
    }

    async getCartItemCount(): Promise<number> {
        return await this.page.locator(this.locatorCartItem).count();
    }

    async getCartCount(): Promise<number> {
        try {
            const count = await this.page.locator(this.locatorCartBadge).textContent({ timeout: 1000 });
            return count ? Number(count) : 0;
        } catch (e) {
            return 0;
        }
    }

    async isCorrectedCartItem(items: any[]): Promise<boolean> {
        const itemCount = await this.getCartItemCount();

        let isCorrected = true;
        for (let i = 0; i < items.length; i++) {
            let found = false;
            let name = "";

            for (let j = 0; j < itemCount; j++) {
                const element = this.getElement(j);
                const price = await this.getItemPrice(element);
                name = await this.getItemName(element);

                if (name.toLocaleLowerCase() === items[i].name.toLocaleLowerCase()) {
                    if (price === items[i].price) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                expect.soft(false, `Incorrected item :${name}`).toBe(true);
                isCorrected = false;
            }
        }

        return isCorrected;
    }

    async isCorrectedGrandTotalPrice(total: number, tax: number = 0.08): Promise<boolean> {
        const totalPrice = total + Number((total * tax).toFixed(2));
        return (await this.getGrandTotalPrice()) === totalPrice;
    }

    async isCorrectedTotalPrice(total: number): Promise<boolean> {
        return (await this.getTotalPrice()) === total;
    }

    async isCorrectedTax(total: number, tax: number = 0.08): Promise<boolean> {
        return (await this.getTax()) === Number((total * tax).toFixed(2));
    }
}