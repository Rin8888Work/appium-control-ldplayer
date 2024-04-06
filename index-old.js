import { remote } from "webdriverio";
import AppiumHelper from "./helpers/AppiumHelper.js";
import fs from "fs";

async function main() {
  const options = {
    hostname: "127.0.0.1",
    port: 4723,
    // path: "/wd/hub",
    capabilities: {
      platformName: "Android",
      "appium:deviceName": "emulator-5584",
      "appium:automationName": "UiAutomator2",
      // Add other capabilities as needed
    },
  };

  let driver;
  try {
    const appiumHelper = new AppiumHelper(await remote(options));
    driver = appiumHelper.driver;
    await appiumHelper.switchToWebContext();
    const challengeImg = await appiumHelper.getImagesFromCaptcha("images");
    const challengeImgBase64 = await appiumHelper.readFileToBase64(
      challengeImg.expPathImg
    );
    let result = [];

    for (let index = 0; index < challengeImg.challengeImgs.length; index++) {
      const pathImg = challengeImg.challengeImgs[index];
      const pathImgBase64 = await appiumHelper.readFileToBase64(pathImg);

      const compare = await appiumHelper.compareImages(
        challengeImgBase64,
        pathImgBase64
      );

      // if (same) {
      //   result.push("Hai hình giống nhau", index + 1);
      // } else {
      //   result.push("Hai hình không giống nhau", index + 1);
      // }
      result.push({ ...compare, index: index + 1 });
    }

    console.log({ result });
    // Tìm phần tử cụ thể

    // Use appiumHelper to perform actions
    // await appiumHelper.click({ xpath: '//button[@id="myButton"]' });
    // await appiumHelper.writeText(
    //   { xpath: '//input[@id="myInput"]' },
    //   "Hello, World!"
    // );

    // After completion, quit the driver
    await driver.deleteSession();
  } catch (error) {
    console.error("Error occurred:", error);
    if (driver) {
      await driver.deleteSession();
    }
  }
}

main();
