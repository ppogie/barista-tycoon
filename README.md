# ☕ Barista Tycoon: Anime Café Story

**Alpha starter v0.1 — 2.5D Anime Isometric**

First development checkpoint for the Barista Tycoon project. Includes:

- Cozy main menu with concept art
- Functional **Create Player** screen (name, café name, gender style, hair style/colour, skin tone, apron colour)
- Procedural **anime avatar** preview
- True **3D isometric shop** rendered using Three.js with a 2D avatar sprite (the planned 2.5D effect)
- Initial **10 × 10 tiles** with furniture, espresso counter and plants
- Click/tap or WASD/arrow-key character movement with pathfinding around furniture
- Shop expansion to 15 × 15 tiles for $2,000 (starting demo wallet $3,500)
- LocalStorage save/continue for character, café, wallet, expansion and position
- Planned menu (five drinks), savings, staff and customer AI panels clearly marked as coming later

**Important:** The five drinks are listed but not yet sellable; deposit/withdraw, hiring and customer AI are not built in v0.1. This intentionally starts with the Create Player and tile-layout milestones.

## How to run locally

The 3D code uses an ES module from a CDN, so an internet connection is required. Run the project with a small web server, not by opening `index.html` directly from disk.

```bash
python -m http.server 8000
```

Open http://localhost:8000 in your browser. You can also use the **Live Server** extension in VS Code.

## How to publish to GitHub Pages (no build step)

1. Make a **public** repository named `barista-tycoon` on GitHub.
2. Upload the **contents of this folder** into the repository root: `index.html`, `styles.css`, `app.js`, `avatar.js`, `world.js`, the `assets/` directory, and `.nojekyll`.
3. Commit to the `main` branch.
4. Open your GitHub repository > **Settings** > **Pages**.
5. In **Build and deployment**, choose **Deploy from a branch**; select `main` and `/(root)`; save.
6. Once publishing is complete, open `https://YOUR-USERNAME.github.io/barista-tycoon/`.

Official documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## File layout

```
barista-tycoon/
├── index.html           # All game screens
├── styles.css           # Visual style + responsive layout
├── app.js               # Screens, save data, expansion + HUD
├── avatar.js            # Procedural 2D anime character renderer
├── world.js             # Three.js isometric café scene + movement
├── assets/
│   └── cafe-concept.png # Visual concept for the landing screen
├── .nojekyll
└── README.md
```

## Next features

1. Furniture placement/deletion on tiles
2. Five drink recipes, ingredients, preparation and sales
3. Business wallet and personal savings deposit/withdraw
4. Staff hiring and salaries
5. Customer pathfinding, queues, order preferences, patience, VIP status
6. Polish, mobile accessibility, balance and more avatar animation frames

## Notes

- Save data stays in this browser only. Clearing site data or switching devices loses the save.
- Three.js is loaded from `cdn.jsdelivr.net`, and Google Fonts are optional.
- This is a standalone static project; Node, npm, and GitHub Actions are **not required** to publish it.
- `localStorage` save data is not connected to real money or accounts.

## v0.2 update

- Real gameplay loop (`game.js`): NPC customers walk in, queue, order, sit, tip, leave, or storm off when impatient
- Press **E** (or the Serve button) near the counter to serve; income goes to your wallet
- Reputation, 120-second days, wages, and a ×1/×2/×3 speed button
- Savings deposit/withdraw with history, hire up to 3 helper baristas, live customer stats
- Old saves still load (new fields get defaults)
