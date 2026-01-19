# Dependency Visualizer

**Dependency Visualizer** is a desktop application (Electron + Vite + Vue 3) that analyzes your `package.json` and visualizes:

✔ Dependencies and DevDependencies  
✔ Current vs Latest version  
✔ Outdated flag  
✔ Security flag (deprecated / warning)  
✔ GitHub link for each package  
✔ Interactive dependency graph  
✔ Export JSON report  

Perfect for developers, team leads, or anyone needing a quick audit before upgrading a project.

---

##  Features

- 📁 **Import `package.json`**
- 🔍 **Parse dependencies & devDependencies**
- 🆚 **Compare versions (current vs latest)**
- ⚠️ **Security flags**
  - `deprecated`
  - `warning` (beta/alpha/rc)
- 🔗 **GitHub repository link**
- 🌐 **Visualize Dependency Graph**
- 📤 **Export JSON report**
- 📊 **Progress bar during analysis**

---

##  Demo UI

> _(Add screenshot here if needed)_

---

##  Tech Stack

| Layer           | Technology      |
|----------------|----------------|
| Desktop shell  | Electron       |
| Frontend       | Vue 3 + Vite   |
| Language       | TypeScript     |
| UI Graph       | vis-network    |
| HTTP           | axios          |
| Version parsing| semver         |

---

##  Install & Run

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/dependency-visualizer.git
cd dependency-visualizer
```

### 2. Install dependencies

```sh
npm install
```

### 3. Development mode

Run Electron and Vite together:

```sh
npm run dev
```

The desktop app will open automatically.

###  Build Production (.exe / .dmg / .AppImage)

To build the full app:

```sh
npm run dist
```

Build output will be in:

```
release/
```

Build separately:

Build UI:

```sh
npm run build
```

Build Electron and package installer:

```sh
npm run build:electron
```

---

##  Main UI Features

- **Import file**: Select any package.json from your computer
- **Analyze Dependencies**: Fetch metadata from npm registry
- **Compare and flag outdated packages**
- **Render interactive dependency graph**
- **Assign security flags (deprecated/beta/…)**
- **Extract GitHub repo link**
- **Export JSON**: Save dependency-report.json

The exported JSON contains all analysis details.

---

## 📁 Project Structure

```
dependency-visualizer/
 ├─ src/
 │   ├─ analyzer/         # Dependency metadata analysis
 │   ├─ renderer/         # Vue frontend for Electron Renderer
 │   ├─ main/             # Electron Main process
 │   ├─ shared/           # Shared types & utilities
 │   └─ preload/          # (optional) IPC bridge
 ├─ public/
 ├─ dist/                 # Vite build output
 ├─ dist-electron/        # Electron build output
 ├─ release/              # .exe / .dmg / .AppImage files
 ├─ electron-builder.yml  # Packaging config
 ├─ package.json
 └─ README.md
```

---

##  How It Works

1. User imports a package.json
2. App parses JSON and extracts:
   - dependencies
   - devDependencies
3. For each package:
   - Fetch info from https://registry.npmjs.org/<pkg>
   - Get latest, deprecated, repository.url
   - Compare semver
   - Update progress bar
   - Render graph and details table

---

##  Security Flags

| Flag       | Meaning                                 |
|------------|-----------------------------------------|
| deprecated | Package is deprecated on npm            |
| warning    | Latest version is alpha / beta / rc     |
| none       | Normal                                  |

---

##  Graph Visualization

- Root node: project
- Each dependency is a child node
- Node colors:
  - Green → OK
  - Orange → Outdated
  - Red → Deprecated

---

##  Export Report

JSON format:

```json
{
  "deps": [
    {
      "name": "vue",
      "requested": "^3.4.0",
      "latest": "3.4.15",
      "isOutdated": false,
      "securityFlag": "none",
      "githubUrl": "https://github.com/vuejs/core"
    }
  ],
  "generatedAt": "2026-01-18T20:12:32.123Z"
}
```

---

##  Troubleshooting

⚠ Build error on Windows:
Windows may block symbolic links when unpacking winCodeSign.

Quick fixes:

✔ Enable Developer Mode
✔ Run terminal as Admin
✔ Or disable signing:

```yaml
win:
  sign: false
```

---

##  License
MIT — free to use, modify & contribute.

---

##  Contributing
PRs and feedback are very welcome!
If you want to add features:
- npm audit integration
- Export PDF/Markdown
- Automatic upgrade scripts
- Dark mode
- CI auto analysis
just open an Issue or PR.

---

##  Author
Le Anh Minh
Email: leanhminh2404@gmail.com
