const fs = require("fs");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const ScrapCluster = require("./cluster");
const { JSDOM } = jsdom;

const get = (e, r) =>
  e != null && e != undefined ? (r in e ? e[r] : null) : null;

const getLinks = async function (category) {
  const dir = `./categories_product_links/${category.category}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const stream = fs.createWriteStream(
    `${dir}/${category.subCategory}_links.json`,
    {
      flags: "a",
    }
  );
  stream.write("[ \n");

  let pagination = await fetch(`${category.categorylink}`)
    .then((r) => r.text())
    .then((html) => {
      const document = new JSDOM(html).window.document;
      const list =
        get(document.querySelector(".page-list"), "childElementCount") || 0;
      const isPaginate =
        list > 1
          ? get(
              document.querySelector(".page-list li:nth-last-child(2) a"),
              "innerHTML"
            )
          : list;
      return isPaginate;
    });
  console.log(pagination);
  // pagination = pagination > 1 ? parseInt(pagination) + 1 : pagination;
  Promise.all(
    Array.from(Array(parseInt(pagination)).keys()).map(async (i) => {
      await fetch(`${category.categorylink}?page=${i + 1}`)
        .then((r) => r.text())
        .then((html) => {
          const document = new JSDOM(html).window.document;

          Array.from(
            document.querySelectorAll(
              "div.products article div div.product-description h1 a"
            )
          ).forEach((e) => {
            stream.write(
              JSON.stringify({
                ...category,
                productName: e.text,
                productLink: e.href,
              }) + ",\n"
            );
          });
        })
        .catch((r) => {});
    })
  ).then((all) => {
    stream.write("]");
    stream.end();
  });
};

const scrapProducts = async function (category) {
  const dir = `./categories_product_links/${category.category}`;
  const products = require(`${dir}/${category.subCategory}_links.json`);
  const cluster = new ScrapCluster(category);

  const scrapProductInfo = () => {
    try {
      const get = (e, r) =>
        e != null && e != undefined ? (r in e ? e[r] : null) : null;
      const document = window.document;
      const bareCode = get(
        document.querySelector("div.product-reference span"),
        "innerText"
      );
      const name = get(
        document.querySelector("div.top-product div div:nth-child(2) h1"),
        "innerText"
      ).replace(/\//g, " ");
      const price =
        get(document.querySelector("div.current-price span"), "innerText") ||
        "0 DA";
      let tastes = get(document.querySelector("#group_5"), "innerText") || "-";
      tastes = tastes.split("\n");
      const splitBareCode = bareCode.replace(/(\d{3})(?=\d{4})/g, "$1/");
      const imageLink_1 = `https://images.openfoodfacts.org/images/products/${splitBareCode}/1.400.jpg`;

      const imageLink =
        get(
          document.querySelector(
            "div.images-container img.js-qv-product-cover"
          ),
          "src"
        ) || "https://corailmarket.com/img/p/fr-default-large_default.jpg";

      return { bareCode, name, price, tastes, imageLink, imageLink_1 };
    } catch (e) {
      console.log(e);
    }
  };

  const task = async (link, page) => {
    console.log("Loading " + link);
    try {
      await page.goto(link, { waitUntil: "networkidle2", timeout: 0 });
      await page.waitForSelector("div.product-reference span", {
        visible: true,
        timeout: 0,
      });
      return await page.evaluate(scrapProductInfo);
    } catch (err) {
      console.error(err); // Log any errors
    }
  };

  await cluster.queueLinks(products, task);
  await cluster.close();
};

const categories = require("./categories_product_links/categories.json");

(async () => {
  // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const category of categories) {
    const updatedCategory = {
      ...category,
      category: category.category.replace(/ /g, "_"),
      subCategory: category.subCategory.replace(/ /g, "_"),
    };

    await scrapProducts(updatedCategory);
    // Introduce a delay of, for example, 1000 ms (1 second) between each category
    // await delay(180000);
  }
})();

// (async () => {
//   for (const category of categories) {
//     const updatedCategory = {
//       ...category,
//       category: category.category.replace(/ /g, "_"),
//       subCategory: category.subCategory.replace(/ /g, "_"),
//     };

//     await getLinks(updatedCategory);
//   }
// })();
