import { test, expect } from "@playwright/test";
import * as fs from "node:fs/promises";

export interface Round {
    id: string;
    resultAssetsUrl: string;
    resultJsonAssetUrl: string;
    resultAssetsKey: string;
}

test("go to cock-fighting", async ({ page }) => {
    const events: Array<string> = [];
    const rounds: Array<Round> = [];

    page.on("websocket", async (ws) => {
        ws.on("framereceived", async (msg: any) => {
            const { payload } = msg ?? "";
            if (payload.includes("roundCloseBet")) {
                try {
                    console.log("Found roundCloseBet");

                    const parsedJson = payload.replace('["roundCloseBet",', "");
                    console.log(parsedJson);
                    const final = parsedJson.slice(0, parsedJson.length - 1);
                    console.log(final);

                    const { round } = JSON.parse(final);
                    rounds.push({
                        id: round.id,
                        resultAssetsUrl: round.resultAssetsUrl,
                        resultJsonAssetUrl: round.resultJsonAssetUrl,
                        resultAssetsKey: round.resultAssetsKey,
                    });

                    events.push(payload);
                } catch (err) {
                    console.log(err);
                }
            }
        });
    });

    try {
        await page.goto("https://demo7.kingmidasdev.net/games/cock-fighting?currency=USD&test=1");
        await page.frameLocator("iframe").locator("#startButtonContainer").getByRole("img").click();
        await page.waitForTimeout(1000);
        await page
            .frameLocator("iframe")
            .locator("#GameCanvas")
            .click({
                position: {
                    x: 640,
                    y: 601,
                },
            });

        await page.waitForTimeout(300000);
        await fs.writeFile(`./test-results/rounds.json`, JSON.stringify(rounds));

        expect(page.frameLocator("iframe").locator("#test").textContent()).toBe("aaaa");
    } catch (err) {
        console.log(err);
    }
});
