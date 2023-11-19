const { Cluster } = require("puppeteer-cluster");

const fs = require("fs");
const { download } = require("./downloadImage");

module.exports = class ScrapCluster {
  streamOK;
  streamKO;
  cluster;

  constructor(category) {
    const dir = `./categories_products/${category.category}/${category.subCategory}`;
    const okFile = `${dir}/products.info.ok.json`;
    const koFile = `${dir}/products.info.ko.json`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.rmSync(okFile, { force: true });
    fs.rmSync(koFile, { force: true });
    this.streamOK = fs.createWriteStream(okFile, { flags: "a" });
    this.streamKO = fs.createWriteStream(koFile, { flags: "a" });
    this.streamOK.write("[ \n");
    this.streamKO.write("[ \n");
  }

  async queueLinks(products, cb) {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      puppeteerOptions: { headless: true, ignoreHTTPSErrors: true },
      maxConcurrency: 10,
      timeout: 320000,
    });
    this.cluster.on("taskerror", (err, data, willRetry) => {
      if (willRetry) {
        console.warn(
          `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
        );
      } else {
        console.error(`Failed to crawl ${data}: ${err.message}`);
        this.streamKO.write(JSON.stringify(data) + ",\n");
      }
    });
    for (const product of products) {
      const task = async ({ page }) => {
        const data = await cb(product.productLink, page);
        const productData = {
          ...data,
          link: product.productLink,
          category: product.category,
          subCategory: product.subCategory,
        };
        this.writeData(product.productLink, productData);
        if ("bareCode" in productData) {
          download(productData);
        }
      };
      this.cluster.queue(product.productLink, task);
    }
    await this.cluster.idle();
  }

  writeData(link, data) {
    if (!!data) {
      this.streamOK.write(JSON.stringify(data) + ",\n");
    } else {
      this.streamKO.write(JSON.stringify(link) + ",\n");
    }
  }

  async close() {
    await this.cluster.close();
    this.streamOK.write("]");
    this.streamKO.write("]");
    this.streamOK.end();
    this.streamKO.end();
  }
};
