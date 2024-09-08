import { expect, Locator, Page } from "@playwright/test";
import { removeLastUrl } from "../utils";

const SELECT_SORT = {
    az: 'Name (A to Z)',
    za: 'Name (Z to A)',
    lohi: 'Price (low to high)',
    hilo: 'Price (high to low)',
}

export class InventoryPage {

    private baseUrl: string = "https://www.saucedemo.com/inventory.html";
    private page: Page;

    private locatorItem: string = "div.inventory_item";
    private locatorItemName: string = "div.inventory_item_name";
    private locatorItemPrice: string = "div.inventory_item_price";
    private locatorItemDesc: string = "div.inventory_item_desc";
    private locatorItemImage: string = "img.inventory_item_img";

    private locatorSelectSort: string = "select.product_sort_container";
    private locatorSelectActive: string = "span.active_option";

    private locatorCartBadge: string = "span.shopping_cart_badge";
    private locatorCartIcon: string = "div.shopping_cart_container";
    private locatorTitle: string = ".title";
    private titleText: string = "Products";

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
        await expect(this.page.locator(this.locatorTitle).getByText(this.titleText)).toBeVisible({ timeout: 5000 });
    }

    async addToCart(element: Locator): Promise<void> {
        await element.getByRole("button", { name: "Add to cart" }).click({ timeout: 5000 });
    }

    async removeFromCart(element: Locator): Promise<void> {
        await element.getByRole("button", { name: "Remove" }).click({ timeout: 5000 });
    }

    async isItemAdded(element: Locator): Promise<boolean> {
        return await element.getByRole("button", { name: "Remove" }).isVisible();
    }

    async isItemRemoved(element: Locator): Promise<boolean> {
        return await element.getByRole("button", { name: "Add to cart" }).isVisible();
    }

    async getPrice(element: Locator): Promise<number> {
        const price = await element.locator(this.locatorItemPrice).textContent({ timeout: 1000 });
        return price ? Number(price.replace('$', '')) : 0;
    }

    async getName(element: Locator): Promise<string> {
        const name = await element.locator(this.locatorItemName).textContent({ timeout: 1000 });
        return name ? name : "";
    }

    async getCartCount(): Promise<number> {
        try {
            const count = await this.page.locator(this.locatorCartBadge).textContent({ timeout: 1000 });
            return count ? Number(count) : 0;
        } catch (e) {
            return 0;
        }
    }

    async countItem(): Promise<number> {
        return await this.page.locator(this.locatorItem).count();
    }

    getElement(index: number): Locator {
        return this.page.locator(this.locatorItem).nth(index);
    }

    async goToCartPage(): Promise<void> {
        await this.page.click(this.locatorCartIcon);

        const url = removeLastUrl(this.page.url());
        expect(url === this.baseUrl).toBe(false);
    }

    async isShownImage(element: Locator): Promise<boolean> {
        const attb = await element.locator(this.locatorItemImage).getAttribute('src');
        if (attb) {
            return attb === "" ? false : true;
        }

        return false;
    }

    async haveTitle(element: Locator): Promise<boolean> {
        const text = await element.locator(this.locatorItemName).textContent();
        if (text) {
            return text === "" ? false : true;
        }

        return false;
    }

    async haveDescription(element: Locator): Promise<boolean> {
        const text = await element.locator(this.locatorItemDesc).textContent();
        if (text) {
            return text === "" ? false : true;
        }

        return false;
    }

    async isShownAllItemImage(): Promise<boolean> {
        const count = await this.countItem();
        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            if (!await this.isShownImage(element))
                return false;
        }

        return true;
    }

    async isShownAllItemPrice(): Promise<boolean> {
        const count = await this.countItem();
        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            const price = await this.getPrice(element);
            if (isNaN(price))
                return false;
        }

        return true;
    }

    async isShownAllItemTitle(): Promise<boolean> {
        const count = await this.countItem();
        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            if (!await this.haveTitle(element))
                return false;
        }

        return true;
    }

    async isShownAllItemDesciption(): Promise<boolean> {
        const count = await this.countItem();
        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            if (!await this.haveDescription(element))
                return false;
        }

        return true;
    }

    async canAddRemoveToCart(): Promise<boolean> {
        const count = await this.countItem();
        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            let cartItemCount = await this.getCartCount();

            await this.addToCart(element);
            cartItemCount += 1;
            const cartItemCountAdded = await this.getCartCount();
            if (cartItemCount !== cartItemCountAdded) {
                expect.soft(cartItemCountAdded, `Count badge should change from ${cartItemCount - 1} to ${cartItemCount}`).toBe(cartItemCount);
                return false;
            }

            const isAdded = await this.isItemAdded(element);
            if (!isAdded) {
                expect.soft(isAdded, `Button should change to 'Remove'`).toBe(true);
                return false;
            }

            await this.removeFromCart(element);
            cartItemCount -= 1;

            const cartItemCountRemoved = await this.getCartCount();
            if (cartItemCount !== cartItemCountRemoved) {
                expect.soft(cartItemCountRemoved, `Count badge should change from ${cartItemCount + 1} to ${cartItemCount}`).toBe(cartItemCount);
                return false;
            }

            const isRemoved = await this.isItemRemoved(element);
            if (!isRemoved) {
                expect.soft(isRemoved, `Button should change to 'Add to cart'`).toBe(true);
                return false;
            }
        }

        return true;
    }

    async canAddAndRemoveAll(): Promise<boolean> {
        const count = await this.countItem();
        let cartItemCount = await this.getCartCount();
        let isError = false;
        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);

            await this.addToCart(element);
            cartItemCount += 1;
            const cartItemCountAdded = await this.getCartCount();
            if (cartItemCount !== cartItemCountAdded) {
                expect.soft(cartItemCountAdded, `Count badge should change from ${cartItemCount - 1} to ${cartItemCount}`).toBe(cartItemCount);
                isError = true;

                // reset back
                cartItemCount = await this.getCartCount();
            }

            const isAdded = await this.isItemAdded(element);
            if (!isAdded) {
                expect.soft(isAdded, `Button should change to 'Remove'`).toBe(true);
                isError = true;
            }
        }

        for (let i = 0; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            await this.removeFromCart(element);
            cartItemCount -= 1;

            const cartItemCountRemoved = await this.getCartCount();
            if (cartItemCount !== cartItemCountRemoved) {
                expect.soft(cartItemCountRemoved, `Count badge should change from ${cartItemCount + 1} to ${cartItemCount}`).toBe(cartItemCount);
                isError = true;

                // reset back
                cartItemCount = await this.getCartCount();
            }

            const isRemoved = await this.isItemRemoved(element);
            if (!isRemoved) {
                expect.soft(isRemoved, `Button should change to 'Add to cart'`).toBe(true);
                isError = true;
            }
        }

        return isError ? false : true;
    }

    async selectItems(items: string[]): Promise<any[]> {
        await this.page.waitForSelector(this.locatorItem, { timeout: 5000 });
        const numItem = await this.page.locator(this.locatorItem).count();

        const carts = <any>[];
        for (let i = 0; i < numItem; i++) {
            const el = this.getElement(i);
            const name: string = await this.getName(el);

            for (let j = 0; j < items.length; j++) {
                const searchItem = items[j];

                if (name.toLocaleLowerCase().includes(searchItem.toLocaleLowerCase())) {
                    if (!await this.isItemAdded(el)) {
                        const cartItemCount = await this.getCartCount();
                        await this.addToCart(el);
                        expect.soft(await this.getCartCount(), `Count badge should change from ${cartItemCount} to ${cartItemCount + 1}`).toBe(cartItemCount + 1);
                        expect.soft(await this.isItemAdded(el), `Button should change to 'Remove'`).toBe(true);

                        const price = await this.getPrice(el);
                        carts.push({ name: name, price: price });
                    }
                }
            }
        }

        return carts;
    }

    async selectItem(num: number): Promise<void> {
        await this.page.waitForSelector(this.locatorItem, { timeout: 5000 });
        const numItem = await this.page.locator(this.locatorItem).count();

        const carts = <any>[];
        for (let i = 0; i < numItem && i < num; i++) {
            const element = this.getElement(i);

            await this.addToCart(element);
            if (!await this.isItemAdded(element)) {
                continue;
            }

            const name = await this.getName(element);
            const price = await this.getPrice(element);

            carts.push({ name: name, price: price });
        }

        return carts;
    }

    async selectSort(value: string): Promise<void> {
        await this.page.locator(this.locatorSelectSort).selectOption(value);
        const text = await this.page.locator(this.locatorSelectActive).textContent();
        expect(text).toContain(SELECT_SORT[value]);
    }

    async isSortAtoZ(): Promise<boolean> {
        return await this.isSortFrom('az');
    }

    async isSortZtoA(): Promise<boolean> {
        return await this.isSortFrom('za');
    }

    async isSortFrom(value: string): Promise<boolean> {
        const count = await this.countItem();
        let element = this.page.locator(this.locatorItem).nth(0);
        let text = await element.locator(this.locatorItemName).textContent();
        if (!text) {
            text = "";
        }
        for (let i = 1; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            let title = await element.locator(this.locatorItemName).textContent();
            if (!title) {
                title = "";
            }

            // console.log(text, title, text.localeCompare(title));
            if (value === 'az') {
                if ((text.localeCompare(title)) > 0) {
                    return false;
                }
            } else {
                if ((text.localeCompare(title)) < 0) {
                    return false;
                }
            }

            text = title;
        }

        return true;
    }

    async isSortLowToHigh(): Promise<boolean> {
        return await this.isSortPriceFrom('lohi');
    }

    async isSortHighToLow(): Promise<boolean> {
        return await this.isSortPriceFrom('hilo');
    }

    async isSortPriceFrom(value: string): Promise<boolean> {
        const count = await this.countItem();
        let element = this.page.locator(this.locatorItem).nth(0);
        let priceOne = await this.getPrice(element);
        for (let i = 1; i < count; i++) {
            const element = this.page.locator(this.locatorItem).nth(i);
            let priceTwo = await this.getPrice(element);

            // console.log(priceOne, priceTwo);
            if (value === 'lohi') {
                if (priceOne > priceTwo) {
                    return false;
                }
            } else {
                if (priceOne < priceTwo) {
                    return false;
                }
            }

            priceOne = priceTwo;
        }

        return true;
    }

}