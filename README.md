# PharmacyPOS

A Point-of-Sale (POS) system for pharmacies, built using Google Apps Script and Google Sheets.

## Features

- Inventory management: Fetches inventory from Google Sheets.
- Sales entry: Add medicines to a cart, calculate totals, and checkout.
- Sales recording: Records each sale in a separate Google Sheet.
- User-friendly web interface with auto-complete for medicines and error handling.

## Project Structure

```
src/
  appsscript.json         # Apps Script project manifest
  Code.js                 # Server-side Apps Script code
  index.html              # Main web app UI
  script-js.html          # Client-side JavaScript logic
  styles-css.html         # Custom styles
.github/
  workflows/deploy.yml    # GitHub Actions workflow for deployment
.clasp.json               # CLASP configuration
README.md                 # Project documentation
```

## How It Works

- Inventory is loaded from a Google Sheet via the [`getInvetory`](src/Code.js) function.
- Sales are entered through the web UI ([`index.html`](src/index.html)), with logic in [`script-js.html`](src/script-js.html).
- On checkout, sale data is sent to the [`recordSale`](src/Code.js) function, which appends the sale to a Google Sheet.

## Deployment

1. Clone the repository.
2. Install [Node.js](https://nodejs.org/) and [CLASP](https://github.com/google/clasp).
3. Authenticate CLASP and set up your Apps Script project.
4. Update the Google Sheet URLs in [`Code.js`](src/Code.js) as needed.
5. Deploy using CLASP:

   ```sh
   clasp push
   clasp deploy
   ```

## Usage

- Open the deployed web app URL.
- Enter medicine name, quantity, and price.
- Add items to the cart and checkout.
- Sales are recorded in the configured Google Sheet.

## License

nit trichy


