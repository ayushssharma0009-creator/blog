# DRP B2B Parts Portal: design handoff for Shopify

This folder is a **clickable front-end design sample** for a dealer-only (B2B) parts store. It is plain HTML, CSS and JavaScript with no backend. Everything that would normally come from Shopify (sign-in, prices, cart, saved orders) is simulated in the browser so the flows can be clicked through. Your job is to rebuild it as a Shopify theme backed by real store data.

## 1. View it

1. Open `login.html` in Chrome, Edge or Safari. Keep all files in the same folder.
2. Sign in with the sample account: **ayush@ayush.com / 1234**.
3. Click through: portal (`index.html`), any product title (opens `product.html`), the nav menus, Quick Order, Reorder, Submit Vehicle Info, Your Build, Add Build to Cart.

Online preview (product images and logo are blocked there): https://claude.ai/artifact/SVgcjy1CLYVDfd4dMoW3sY

## 2. Files

| File | What it is |
|---|---|
| `login.html` | Pre-login page: pitch, dealer sign-in, program benefits, steps to get access, dealer application form. The only page visible before sign-in. |
| `index.html` | The portal: 4-step workspace (engine → product type → results → Your Build), search-as-you-type, saved builds. Contains the sample catalog (`const P=[…]`). |
| `product.html` | Product page template, shown for **every** product in this sample. |
| `drp.css` | Shared design tokens (colours, fonts), header, nav, buttons, forms. **Start here for the visual system.** |
| `drp.js` | Shared behaviour: sign-in gate, header, nav menus, Submit Vehicle Info form, toasts. Also holds the engine list and the Parts/Tuning category lists. |

## 3. Design system (from `drp.css`)

- **Colours:** brand `#c2410c`, brand hover `#9a3412`, pastel orange `#fdf0e8`, pastel white page `#fffbf8`, text `#24170f` / `#4f3f35` / `#74645a`, success `#157a3a`, warning `#9a5b00`. All text pairings meet WCAG AA contrast.
- **Fonts (Google Fonts):** Archivo 700 and 900 italic (headings, hero), IBM Plex Sans 400–700 (body). SKUs use the system monospace font.
- **Headings** use Title Case (every word capitalised). Product names are left as catalog data.
- **Logo:** `https://cdn.shopify.com/s/files/1/0900/4122/1424/files/DRP-logo.png?v=1773425897`, 64px tall (48px on phones).
- **Breakpoints:** 1500px (3 columns), 1000px (stacked, phone build bar appears), 640px (phone).

## 4. What is simulated, and the Shopify way to build it

| In the design | How it works now | Suggested Shopify implementation |
|---|---|---|
| Dealer-only site, sign-in gate | `drp.js` checks browser storage and redirects to `login.html` | Shopify B2B (Plus) with "require login", or theme check `{% unless customer %}` → redirect to login, plus an approved-dealer customer tag |
| Sign-in form | Hard-coded sample account | `customers/login` template / new customer accounts |
| Dealer application | Validates, shows a success message, sends nothing | Shopify Forms (or a form app) creating a customer tagged `dealer-pending`; staff approve by changing the tag |
| Dealer price / "Your price" after 5% | Fixed 5% in `index.html` (`disc:5`) | B2B catalogs and price lists per company, or customer-tag pricing via Shopify Functions. Show `{{ product.price }}` per customer context |
| Volume discounts on select products | Copy only | B2B quantity rules / volume pricing in catalogs |
| Drop shipping for Pro Accounts | Copy only | Customer tag `pro` + allow a different ship-to address at checkout |
| Product catalog, types, brands | JS array in `index.html` | Products, product type or collections per category, vendor = brand |
| Engine / fitment ("Fits 6.7L Powerstroke 2011–2019") | `e:[…]` engine ids per product | Product metafield (list of engine metaobjects). Filter with Search & Discovery metafield filters, or a YMM fitment app |
| Parts / Tuning menus (sorted by label width) | Lists in `drp.js` | Navigation menus (Online Store → Navigation) linking to collections. Keep the order as listed |
| Shop by Vehicle menu | Engine list in `drp.js` | Menu or metaobject-driven mega menu linking to filtered collections |
| Search as you type | Filters the JS catalog | Predictive Search API (`/search/suggest.json`) including SKU |
| Your Build panel | Browser storage | Cart via the Ajax Cart API (`/cart/add.js`, `/cart/change.js`). "Add Build to Cart" can simply be the cart, or a draft list stored as a cart attribute |
| Quick Order by SKU | Looks up the JS catalog | Variant lookup by SKU, then `/cart/add.js`. Shopify B2B Quick Order List is an alternative |
| Saved builds / Reorder | Browser storage, 2 example builds | Customer metafields (via an app or the Customer Account API), or reorder from past orders |
| Submit Vehicle Info (VIN, mods, photos) | Form validates, sends nothing | Form app or app proxy saving to a metaobject or emailing staff. Photo upload needs an app |
| Support menu items, My Account | Toast placeholders | Links to real pages / customer account |
| Product images | Shopify CDN URLs | `{{ image | image_url: width: 320 }}` with `loading="lazy"` |

## 5. Placeholders to replace before launch

- Phone number **(800) 555-0199** (header on all pages).
- "In-stock parts ship the same business day" (sign-in page tiles and product page): confirm or reword.
- The 5% dealer discount shown everywhere.
- Copy written for the sample: hero sub text, benefit card supporting lines, product overview text. Client to confirm.
- Most Parts and Tuning categories show 0 products because the sample catalog has only 21 items.
- Logo red vs. site orange `#c2410c`: client to decide whether to match the site colour to the logo.

## 6. Notes for the build

- Browser storage keys used by the sample (safe to drop): `drp_session`, `drp_build`, `drp_cart`, `drp_saved`.
- Measured in the sample: fonts 87 KB per page, portal loads in about 0.55 s on a throttled phone. Keep fonts to the two families and image sizes to the slot they fill.
- Accessibility already in the design: visible focus states, keyboard support for menus and search (`/` focuses search, arrows, Enter, Esc), labelled form fields, 4.5:1 text contrast, larger tap targets on touch screens.
