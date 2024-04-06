const { remote } = require("webdriverio");
const { delay } = require("./helpers/helper.js");
const { LDPlayer } = require("./helpers/ldplayer.js");
const { AppiumHelper } = require("./helpers/AppiumHelper.js");

async function createSession(device) {
  const session = await remote({
    port: 4723,
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": `emulator-55${54 + Number(device.index) * 2}`,
    },
  });
  return session;
}

async function startDevices(devices) {
  try {
    const allLdDevices = await getDevices();
    const needDevices = allLdDevices.filter((i) => devices.includes(i.name));
    const promises = [];

    for (const device of needDevices) {
      const profile = new LDPlayer();
      profile.info("index", device.index);
      profile.start();
      promises.push(
        (async () => {
          let driver;

          try {
            const appiumHelper = new AppiumHelper(
              await createSession(device),
              profile
            );
            const { driver, ldDriver } = appiumHelper;
            ldDriver.openApp("net.typeblog.socks");

            await driver.deleteSession();
          } catch (error) {
            console.error("Error occurred:", error);
            if (driver) {
              await driver.deleteSession();
            }
          }
        })()
      );
    }

    await Promise.all(promises);
  } catch (error) {
    console.error("Error starting devices:", error);
  }
}

async function getDevices() {
  const ldInstance = new LDPlayer();
  return ldInstance.getDevices2();
}

module.exports = { getDevices, startDevices };
