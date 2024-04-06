const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
class AppiumHelper {
  constructor(driver, ldDriver) {
    this.driver = driver;
    this.ldDriver = ldDriver;
  }

  async resizeImageSameExpImage(expImagePath, filePath, filename) {
    try {
      // Đọc kích thước của ảnh đầu vào
      const { width, height } = await sharp(expImagePath).metadata();

      const outputPath = path.join(filePath, "resized", `${uuidv4()}.png`);
      await sharp(path.join(filePath, filename))
        .resize(width, height)
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error("Error resizing images:", error);
      return null;
    }
  }

  async readFileToBase64(filePath) {
    return new Promise((resolve, reject) => {
      // Đọc tệp hình ảnh vào buffer
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        // Mã hóa buffer thành chuỗi base64 và trả về
        const base64Image = data.toString("base64");
        resolve(base64Image);
      });
    });
  }

  async compareImages(img1, img2) {
    try {
      const options = {
        threshold: 0.9,
      };
      const result = await this.driver.compareImages(
        "getSimilarity",
        img1,
        img2,
        options
      );

      return result;
    } catch (error) {
      return false;
    }
  }
  async captureImgEle(xpath, filePath, filename) {
    try {
      const ele = await this.driver.$(xpath);
      // Lấy kích thước và vị trí của phần tử
      const location = await ele.getLocation();
      const size = await ele.getSize();

      console.log("Location:", location);
      console.log("Size:", size);

      // Chụp ảnh của phần tử
      const screenshot = await this.driver.takeScreenshot();

      // Tính toán kích thước của phần tử trên ảnh tổng thể
      const width = size.width;
      const height = size.height;
      const startX = location.x;
      const startY = location.y;

      // Cắt ảnh để lấy chỉ phần của phần tử
      const base64Data = screenshot.toString("base64");
      const decodedImage = Buffer.from(base64Data, "base64");
      const elementImage = await sharp(decodedImage)
        .extract({ left: startX, top: startY, width, height })
        .toBuffer();

      // Ghi ảnh vào file
      fs.writeFileSync(path.join(filePath, filename), elementImage);

      if (fs.existsSync(path.join(filePath, "expImg.png"))) {
        return await this.resizeImageSameExpImage(
          path.join(filePath, "expImg.png"),
          filePath,
          filename
        );
      }

      return path.join(process.cwd(), filePath, filename);
    } catch (error) {
      console.log({ error });
      return null;
    }
  }

  async getImagesFromCaptcha(saveFolder) {
    try {
      let challengeImgs = [];
      const expPathImg = await this.captureImgEle(
        `//android.widget.Image[@text="Example image 1"]`,
        saveFolder,
        "expImg.png"
      );
      const xpathChallenges = [
        '//android.widget.ToggleButton[@text="Challenge Image 1, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 2, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 3, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 4, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 5, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 6, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 7, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 8, Off"]',
        '//android.widget.ToggleButton[@text="Challenge Image 9, Off"]',
      ];

      for (let index = 0; index < xpathChallenges.length; index++) {
        const pathImg = await this.captureImgEle(
          xpathChallenges[index],
          saveFolder,
          `challengeImg${index + 1}.png`
        );

        challengeImgs.push(pathImg);
      }

      return { status: "ok", expPathImg, challengeImgs };
    } catch (error) {
      console.log(error);

      return {
        status: "fail",
      };
    }
  }

  async switchToWebContext() {
    try {
      // Lấy danh sách các context có sẵn
      const contexts = await this.driver.getContexts();
      console.log("Contexts:", contexts);

      // Chuyển sang context của webview (hybrid app mode)
      await this.driver.switchContext(contexts[1]); // Chọn context có index phù hợp

      // Kiểm tra lại context hiện tại sau khi chuyển đổi
      const currentContext = await this.driver.getContext();
      console.log("Current Context:", currentContext);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  async click(elementLocator) {
    try {
      const element = await this.driver.$(elementLocator);
      await element.click();
    } catch (error) {
      console.error("Error occurred while clicking element:", error);
    }
  }

  async writeText(elementLocator, text) {
    try {
      const element = await this.driver.$(elementLocator);
      await element.setValue(text);
    } catch (error) {
      console.error("Error occurred while writing text:", error);
    }
  }

  async swipeElement(elementLocator, direction, duration) {
    try {
      // Implement swipe logic here
      console.log(
        "Swiping element:",
        elementLocator,
        "in direction:",
        direction,
        "with duration:",
        duration
      );
    } catch (error) {
      console.error("Error occurred while swiping element:", error);
    }
  }

  async waitForElement(elementLocator, timeout) {
    try {
      await this.driver.waitUntil(
        async () => {
          const elements = await this.driver.$$(elementLocator);
          return elements.length > 0;
        },
        { timeout }
      );
    } catch (error) {
      console.error("Error occurred while waiting for element:", error);
    }
  }

  async switchToWebView() {
    try {
      const contexts = await this.driver.getContexts();
      const webViewContext = contexts.find((context) =>
        context.includes("WEBVIEW")
      );
      if (webViewContext) {
        await this.driver.switchToContext(webViewContext);
        console.log("Switched to WebView context.");
      } else {
        console.error("WebView context not found.");
      }
    } catch (error) {
      console.error("Error occurred while switching to WebView:", error);
    }
  }

  async switchToNative() {
    try {
      await this.driver.switchToNativeContext();
      console.log("Switched to native context.");
    } catch (error) {
      console.error("Error occurred while switching to native:", error);
    }
  }
}

module.exports = { AppiumHelper };
