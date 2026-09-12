# DevPulse 🤖

> AI-powered CLI tool that automatically solves GitHub issues — from diagnosis to Pull Request.

![DevPulse Banner](https://img.shields.io/badge/DevPulse-AI%20Issue%20Solver-cyan?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![npm](https://img.shields.io/badge/npm-devpulse--core-red?style=for-the-badge)

---

## 🚀 What is DevPulse?

DevPulse is an AI-powered CLI tool that takes a GitHub issue URL and automatically:

1. Clones the repository to your machine
2. Reads and understands the issue
3. Sends the actual code + issue context to AI
4. Applies the AI-generated fix to the right files
5. Runs the test suite in a sandbox environment
6. Retries automatically if tests fail (up to 3 times)
7. Lets you review and edit the PR before submitting
8. Opens a Pull Request with a detailed description

All from a single command in your terminal.

---

## 🎬 How it works

```
devpulse solve https://github.com/owner/repo/issues/1
       │
       ▼
  ✅ Validate repo and issue via GitHub API
       │
       ▼
  📥 Clone/pull repository to ~/.devpulse/repos/
       │
       ▼
  📋 Fetch issue title and description
       │
       ▼
  🤖 Send code + issue context to AI
       │
       ▼
  ✨ Apply AI-generated fix to repo files
       │
       ▼
  🧪 Run test suite in sandbox
       │
       ├── PASS ──→ 📝 Review PR → 🚀 Submit PR 🎉
       │
       └── FAIL ──→ Send error back to AI → Retry (max 3x)
```

---

## 📦 Installation

```bash
npm install -g devpulse-core
```

---

## ⚙️ Requirements

Before using DevPulse you need:

| Requirement | Description |
|---|---|
| Node.js 18+ | JavaScript runtime |
| Git | Version control |
| GitHub Token | Personal Access Token with repo permissions |
| AI API Key | OpenRouter, OpenAI, or any compatible provider |
| PostgreSQL | Local (Docker) or cloud (Neon, Supabase) |

---

## 🛠️ First Time Setup

**Step 1 — Start DevPulse:**
```bash
devpulse
```

You will see:
```
  ____             ____        _
 |  _ \  _____   _|  _ \ _   _| |___  ___
 | | | |/ _ \ \ / / |_) | | | | / __|/ _ \
 | |_| |  __/\ V /|  __/| |_| | \__ \  __/
 |____/ \___| \_/ |_|    \__,_|_|___/\___|

AI-powered GitHub issue solver

Available Commands:
  solve <issue-url>   Solve a GitHub issue automatically
  auth                Connect your GitHub account
  config              View current settings
  history             Show recent solved issues
  help                Show this help message
  exit                Exit DevPulse

DevPulse >
```

**Step 2 — Connect your GitHub account:**
```
DevPulse > auth
? Paste your GitHub Personal Access Token: ****
✅ GitHub token saved successfully!
```

> Get your token at: https://github.com/settings/tokens
> Required permissions: `repo`, `read:user`

**Step 3 — Configure your AI provider:**
```
DevPulse > config set endpoint https://openrouter.ai/api/v1/chat/completions
DevPulse > config set key YOUR_API_KEY
DevPulse > config set model nvidia/nemotron-3-ultra-550b-a55b:free
```

> Recommended: Use [OpenRouter](https://openrouter.ai) — many free models available

**Step 4 — Configure your database:**
```
DevPulse > config set database postgresql://user:pass@host:5432/devpulse
```

> Free cloud databases: [Neon](https://neon.tech) or [Supabase](https://supabase.com)

---

## 💻 Usage

```bash
# Start DevPulse interactive mode
devpulse

# Solve a GitHub issue
DevPulse > solve https://github.com/owner/repo/issues/1

# View recent solved issues
DevPulse > history

# Check current configuration
DevPulse > config

# Update a setting
DevPulse > config set model gpt-4o

# Exit
DevPulse > exit
```

---

## 📋 Commands

| Command | Description |
|---|---|
| `solve <url>` | Solve a GitHub issue automatically |
| `auth` | Connect your GitHub account |
| `auth --status` | Check if GitHub token is saved |
| `config` | View current settings |
| `config set endpoint <url>` | Set AI API endpoint |
| `config set key <api-key>` | Set AI API key |
| `config set model <name>` | Set AI model name |
| `config set database <url>` | Set PostgreSQL database URL |
| `history` | Show last 10 solved issues |
| `help` | Show all available commands |
| `exit` | Exit DevPulse |

---

## 🤖 Supported AI Providers

DevPulse works with any OpenAI-compatible API:

| Provider | Free Plan | Notes |
|---|---|---|
| [OpenRouter](https://openrouter.ai) | ✅ Yes | Recommended — many free models |
| [OpenAI](https://openai.com) |  ✅ Yes | Best quality results |
| [Groq](https://groq.com) | ✅ Yes | Very fast inference |
| [Together AI](https://together.ai) | ✅ Yes | Good free tier |

**Recommended free models on OpenRouter:**
- `nvidia/nemotron-3-ultra-550b-a55b:free`
- `deepseek/deepseek-r1-0528:free`
- `tencent/hy3:free`

---

## 🗄️ Database Setup

DevPulse uses PostgreSQL to store your solve history.

**Option 1 — Local with Docker:**
```bash
# Start the database
docker compose up -d

# Configure DevPulse
DevPulse > config set database postgresql://postgres:postgres@localhost:5433/devpulse_local
```

**Option 2 — Cloud (Free):**

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set it in DevPulse:
```
DevPulse > config set database YOUR_NEON_CONNECTION_STRING
```

---

## 📁 How Files are Stored

```
~/.devpulse/
├── config.json          ← GitHub token (saved here)
└── repos/
    ├── owner-repo1/     ← cloned repositories
    └── owner-repo2/

your-working-directory/
└── setting.json         ← AI config and database URL
```

---

## 🔄 The Agent Retry Loop

When tests fail, DevPulse automatically retries with the error context:

```
Attempt 1: AI analyzes issue → applies fix → tests fail
              ↓ test error sent back to AI
Attempt 2: AI fixes with error context → tests fail
              ↓ test error sent back to AI
Attempt 3: AI fixes again → tests PASS ✅
              ↓
         PR Created 🎉
```

Maximum 3 retry attempts per issue.

---

## 📝 PR Review

Before submitting, DevPulse shows you a full PR preview:

```
📋 PR Preview:
────────────────────────────────────────────────────────────
Title: fix: resolve issue #42
────────────────────────────────────────────────────────────
## 🤖 DevPulse AI Agent — Automated Fix

### 📋 Issue Summary
Title: add multiplication function
Closes: #42

### 🔍 Root Cause Analysis
The math.js file was missing a multiply function...

### 🛠️ Files Changed
- `math.js`

### 🔄 Agent Performance
✅ Fixed on first attempt
────────────────────────────────────────────────────────────

📁 Files Changed:
  ✓ math.js

What do you want to do?
  1. Submit PR as is
  2. Edit title
  3. Edit description in editor
  4. Cancel

Your choice (1-4):
```

You have full control — edit the title, rewrite the description in your editor, or cancel entirely.

---

## ⚠️ Limitations

| Limitation | Description |
|---|---|
| Test required | Repo must have a `test` script in `package.json` |
| Language support | Works best with JavaScript/TypeScript repos |
| Model quality | Free AI models may struggle with complex issues |
| Fork required | For repos you don't own, DevPulse creates a fork first |
| Simple issues | Works best on isolated, well-described bugs |

---

## 🐛 Troubleshooting

**"No test script found"**
> Your repo needs a `test` script in `package.json`:
> ```json
> "scripts": { "test": "node test.js" }
> ```

**"Auth token not found"**
> Run `DevPulse > auth` to save your GitHub token first.

**"Database connection refused"**
> Make sure your PostgreSQL is running:
> ```bash
> docker compose up -d
> ```

**"AI model not responding"**
> Check your API key and endpoint in config:
> ```
> DevPulse > config
> ```

**"Max retries reached"**
> Try a different AI model:
> ```
> DevPulse > config set model deepseek/deepseek-r1-0528:free
> ```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing`
3. Commit your changes: `git commit -m 'add amazing feature'`
4. Push to the branch: `git push origin feature/amazing`
5. Open a Pull Request

---

## 🗺️ Roadmap

- [ ] `devpulse init` — guided first-time setup wizard
- [ ] Auto-generate test files if none exist
- [ ] Support for Python repositories
- [ ] Web dashboard to view solve history
- [ ] Multiple issue solving in batch
- [ ] Slack/Discord notifications

---

## 📄 License

MIT © [kikocodder](https://github.com/kikocodder)

---

## 🔗 Links

- [GitHub Repository](https://github.com/kikocodder/devpulse-core)
- [Report a Bug](https://github.com/kikocodder/devpulse-core/issues)
- [OpenRouter](https://openrouter.ai) — recommended AI provider
- [Neon](https://neon.tech) — recommended free database
- [npm Package](https://www.npmjs.com/package/devpulse-core)

---

*Built By kirtikumar Alone*