import { expect, Locator, Page } from "@playwright/test";
import { removeLastUrl } from "../utils";

export class CartPage {

    private baseUrl: string = "https://www.saucedemo.com/cart.html";
    private page: Page;

    private buttonCheckout: string = "#checkout";
    private buttonContinue: string = "#continue-shopping";

    private locatorTitle: string = "Your Cart";
    private locatorCartBadge: string = "span.shopping_cart_badge";
    private locatorCartItem: string = "div.cart_item";
    private locatorItemName: string = "div.inventory_item_name";
    private locatorItemPrice: string = "div.inventory_item_price";


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

    async getCartCount(): Promise<number> {
        try {
            const count = await this.page.locator(this.locatorCartBadge).textContent({ timeout: 1000 });
            return count ? Number(count) : 0;
        } catch (e) {
            return 0;
        }
    }

    async getCartItemCount(): Promise<number> {
        return await this.page.locator(this.locatorCartItem).count();
    }

    async getItemName(element: Locator): Promise<string> {
        const text = await element.locator(this.locatorItemName).textContent();
        return text ? text : "";
    }

    async getItemPrice(element: Locator): Promise<number> {
        const price = await element.locator(this.locatorItemPrice).textContent();
        return price ? Number(price.replace('$', '')) : 0;
    }

    async gotoCheckout(): Promise<void> {
        await this.page.click(this.buttonCheckout);

        const url = removeLastUrl(this.page.url());
        expect(url === this.baseUrl).toBe(false);
    }

    async gotoContinueShopping(): Promise<void> {
        await this.page.click(this.buttonContinue);

        const url = removeLastUrl(this.page.url());
        expect(url === this.baseUrl).toBe(false);
    }

    async removeItem(element: Locator): Promise<void> {
        await element.getByRole("button", { name: "Remove" }).click();
    }

    async removeAllItem(): Promise<void> {
        const itemCount = await this.getCartItemCount();
        for (let i = itemCount - 1; i >= 0; i--) {
            const element = this.getElement(i);
            await this.removeItem(element);
        }
    }

    getElement(index: number): Locator {
        return this.page.locator(this.locatorCartItem).nth(index);
    }

    async isCartBadgeEqualToItem(): Promise<boolean> {
        const countBadge = await this.getCartCount();
        const countItem = await this.getCartItemCount();
        return countBadge === countItem ? true : false;
    }

    async adjustCartItem(items: any[]): Promise<void> {
        const itemCount = await this.getCartItemCount();

        for (let i = 0; i < items.length; i++) {
            let j = 0
            let found = false;

            let name = "";
            let el;
            for (; j < itemCount; j++) {
                el = this.getElement(j);
                const price = await this.getItemPrice(el);
                name = await this.getItemName(el);

                if (name.toLocaleLowerCase() === items[i].name.toLocaleLowerCase()) {
                    if (price === items[i].price) {
                        found = true;
                        break;
                    }
                }
            }

            if (el) {
                if (!found) {
                    expect.soft(false, `Incorrected item :${name}`).toBe(true);
                    await this.removeItem(el);
                }
            }
        }
    }

    async isCartMatchCartItem(items: any[]): Promise<boolean> {
        const itemCount = await this.getCartItemCount();

        for (let i = 0; i < items.length; i++) {

            let found = false;
            for (let j = 0; j < itemCount; j++) {
                const element = this.getElement(j);
                const price = await this.getItemPrice(element);
                const name = await this.getItemName(element);

                if (name.toLocaleLowerCase() === items[i].name.toLocaleLowerCase()) {
                    if (price === items[i].price) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                return false;
            }
        }

        return true;
    }
}