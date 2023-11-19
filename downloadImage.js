const fetch = require("node-fetch");
const fs = require("fs");

module.exports.download = async (product) => {
  let logoUrl = `${product.imageLink}`;
  const res = await fetch(logoUrl);
  await new Promise((resolve, reject) => {
    const dir = `./categories_products_images/${product.category}/${product.subCategory}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const fileStream = fs.createWriteStream(
      `./categories_products_images/${product.category}/${product.subCategory}/${product.name}.jpg`
    );
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
  });
};
