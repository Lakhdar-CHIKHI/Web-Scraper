# Web Scraper with Puppeteer

A Node.js script using Puppeteer to scrape product information and categories from a website.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Modifying for Other Websites](#modifying-for-other-websites)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/web-scraper.git
   ```

2. **Install dependencies:**

   ```bash
    cd Web-Scraper
    yarn install
   ```

## Usage

Run the scraper with the following command:

```bash
node index.js
```

This will launch Puppeteer, navigate to the target website, and start scraping product information and categories.

## Modifying for Other Websites

To use this script for another website, follow these steps:

1.  **Identify the HTML structure:**

    Inspect the target website to understand the HTML structure of the pages containing product information and categories.

2.  **Adapt the scraping logic in index.js and other files:**

    Update the scraping logic in index.js to extract the relevant data based on the HTML structure of the target website.

3.  **Test thoroughly:**

    Test the modified script on the new website to ensure it works correctly.

### Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or create a pull request.

### License

This project is licensed under the MIT License.
