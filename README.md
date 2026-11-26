# clashofcode

**Code. Compete. Conquer.**

clashofcode is a self-hosted competitive programming platform. Developers solve
problems in a browser code editor and have their code judged against hidden test
cases. Admins write the problems, attach test cases and a reference solution, and
publish them once the reference solution passes every test.

---

## What's in this repo

| Folder | What it is | Stack |
| ------ | ---------- | ----- |
| [`frontend/`](frontend/) | The web app: landing page, sign-up/login, problem list, code workspace, and admin console | React 19, TypeScript, Vite, Chakra UI, CodeMirror |
| [`backend/`](backend/) | The REST API: accounts, problems, test cases, submissions, and judging | Node.js, Express 5, MongoDB (Mongoose), JWT cookies |
| [`townhall/`](townhall/) | The code execution engine that runs submitted code in a sandbox. It has a Judge0-compatible API. | Node.js, Redis + BullMQ, isolate / Docker / Firecracker |

```text
 Browser ──► frontend (static files)
    │
    └── /api/* ──► backend :4000 ──► MongoDB
                      │
                      └── X-Auth-Token ──► townhall API :3000 ──► Redis queue ──► worker (sandbox)
```

- The browser only talks to the backend, through `/api`. Sessions use an
  httpOnly cookie (`coc_token`), so the frontend and the API should be served
  from the **same origin**.
- The backend is the only client of townhall. It sends code in batches of up to
  20 test cases, polls for results, and decides the verdict.
- townhall is included as a git subtree. Its own [README](townhall/README.md)
  covers it in more detail.

### Supported languages

| ID | Language |
| -- | -------- |
| 71 | Python 3 (3.8) |
| 63 | JavaScript (Node.js 18) |
| 74 | TypeScript (5.0) |
| 62 | Java 17 |
| 54 | C++17 (GCC 9) |
| 50 | C (GCC 9) |

Every problem reads from **stdin** and writes to **stdout**. Leading and
trailing whitespace is trimmed before the output is compared.

---

## How to use the platform

### As a developer

1. Go to `/signup` and create an account (name, handle, email, password). You
   can sign in at `/login` with either your email or your handle.
2. Open **Problems** (`/problems`). Each problem shows its difficulty, tags,
   acceptance rate, and whether you have solved or attempted it.
3. Open a problem to get the workspace: the statement on the left and the
   editor on the right. Choose a language to load a starter template.
4. **Run** checks your code against the sample tests. If you give custom
   input, your code and the admin's reference solution both run on it, so you
   can compare your output with the expected output.
5. **Submit** judges your code against every test case, hidden ones included.
   The verdict is one of: Accepted, Wrong Answer, Time Limit Exceeded,
   Compilation Error, Runtime Error, or Internal Error. If a sample test fails,
   you see its details; for a hidden test you only see the test number and the
   verdict.
6. Your past submissions for a problem are listed in the workspace.

Runs and submissions are limited to 20 per minute for each user.

### As an admin

Public sign-up only creates developer accounts. Admin accounts are created from
the command line:

```bash
cd backend
npm run create-admin
```

All options are described in [`backend/README.md`](backend/README.md).

Then:

1. Sign in at `/admin/login`.
2. Under **Problems** (`/admin/problems`), create a problem: title, slug,
   difficulty, tags, and a Markdown description, input format, output format,
   and constraints. Set the time limit (0.5–15 s) and the memory limit
   (32–500 MB).
3. Add test cases. Mark at least one as a **sample**. Samples are shown to
   developers; the others stay hidden.
4. Add a **reference solution**. You can run it against your tests from the
   editor before saving.
5. **Publish.** The server runs the reference solution against every test case
   and only publishes the problem if all of them pass. Saving changes to a
   published problem verifies it again, so developers never see a broken
   problem. **Unpublish** takes it back to draft.

---

## Run it locally

**You need:** Node.js 22 LTS (Vite 8 needs 20.19+ or 22.12+), Docker, and a
MongoDB database (a free MongoDB Atlas cluster or a local `mongod` both work).

### 1. Start townhall (code execution)

```bash
cd townhall
npm install
./scripts/build-images.sh      # builds the language runtime images (first run takes a while)
docker compose up -d           # API on :3000, plus a worker and Redis
curl http://localhost:3000/health
```

The development stack uses the token `dev-token`.

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Value |
| -------- | ----- |
| `MONGODB_URL` | Your connection string. It can contain `{MONGODB_PASSWORD}`, which is replaced by `MONGODB_PASSWORD`. A plain URL such as `mongodb://127.0.0.1:27017` also works. |
| `MONGODB_PASSWORD` | Only needed if the URL contains the placeholder. |
| `JWT_SECRET` | A long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `TOWNHALL_URL` | `http://localhost:3000` |
| `TOWNHALL_TOKEN` | `dev-token` |

```bash
npm run dev                    # API on http://localhost:4000
npm run create-admin           # optional: create an admin account
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

The Vite dev server forwards `/api` to `http://localhost:4000`, so no extra
configuration is needed.

---

## Deploy on your own server

This guide puts all three parts on **one Linux server** (Ubuntu 22.04/24.04,
x86_64) behind one HTTPS domain:

```text
https://example.com            ──► frontend/dist (static files)
https://example.com/api/*      ──► backend on 127.0.0.1:4000
backend ──► townhall API on 127.0.0.1:3000 (never public)
```

### What you need

- A server with at least **2 vCPU and 4 GB RAM**. Use 4 vCPU / 8 GB for more
  traffic; see the sizing table in [`townhall/README.md`](townhall/README.md#server-sizing).
  It must be **x86_64**: the townhall worker image doesn't build on ARM.
- A domain with an `A` record pointing at the server, and ports **80** and
  **443** open, both in `ufw` and in your provider's firewall.
- A MongoDB database: MongoDB Atlas (allow the server's IP under Network
  Access) or MongoDB installed on the server.

> **HTTPS is required.** With `NODE_ENV=production`, the backend marks the
> session cookie as `Secure`, and browsers won't send it over plain HTTP. If
> you serve the site over `http://`, sign-in will appear to work, but you will
> be signed out immediately.

### 1. Install the prerequisites

```bash
# Docker
curl -fsSL https://get.docker.com | sh

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Caddy (reverse proxy with automatic HTTPS)
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

# PM2 (keeps the backend running and restarts it on reboot)
sudo npm install -g pm2
```

### 2. Get the code

```bash
sudo git clone <your-repo-url> /opt/clashofcode
sudo chown -R $USER:$USER /opt/clashofcode
cd /opt/clashofcode
```

### 3. Deploy townhall

townhall's production compose file includes its own Caddy, which would take
ports 80/443. On a shared server, turn that Caddy off and publish the townhall
API on localhost only. Create `townhall/docker-compose.local.yml`:

```yaml
services:
  caddy:
    profiles: ["disabled"]        # the host-level Caddy handles HTTPS
  api:
    ports:
      - "127.0.0.1:3000:3000"     # reachable from this server only
```

Create `townhall/.env` with fresh secrets:

```bash
cd /opt/clashofcode/townhall
cat > .env <<EOF
AUTH_TOKEN=$(openssl rand -hex 32)
METRICS_TOKEN=$(openssl rand -hex 16)
GRAFANA_PASSWORD=$(openssl rand -hex 16)
DOMAIN=

# WORKER_CPUS must not be higher than the server's vCPU count.
WORKER_CPUS=1.5
WORKER_MEMORY=3G
WORKER_CONCURRENCY=2
EOF

docker compose -f docker-compose.prod.yml -f docker-compose.local.yml up -d --build
curl http://127.0.0.1:3000/health
grep AUTH_TOKEN .env            # the backend needs this value in step 4
```

The production worker uses **isolate** as its sandbox and already includes
every language runtime, so you don't need `build-images.sh` here.

> To run townhall on a **separate server** instead, follow
> [`townhall/README.md`](townhall/README.md) (for example "Mode 3 — Server with
> a domain and HTTPS"), then set `TOWNHALL_URL` in step 4 to
> `https://townhall.example.com`.

### 4. Deploy the backend

```bash
cd /opt/clashofcode/backend
npm ci --omit=dev
cp .env.example .env
nano .env
```

Production values:

```dotenv
MONGODB_URL=mongodb+srv://<user>:{MONGODB_PASSWORD}@<cluster>.mongodb.net/
MONGODB_PASSWORD=<your-db-password>
MONGODB_DB_NAME=clashofcode

JWT_SECRET=<output of: openssl rand -hex 48>
JWT_EXPIRES_IN=7d

PORT=4000
NODE_ENV=production
CLIENT_ORIGIN=https://example.com

TOWNHALL_URL=http://127.0.0.1:3000
TOWNHALL_TOKEN=<AUTH_TOKEN from townhall/.env>
```

Start it and make it start again after a reboot:

```bash
pm2 start src/server.js --name clashofcode-api
pm2 save
pm2 startup                    # run the command it prints

curl http://127.0.0.1:4000/api/health   # {"status":"ok","database":"connected"}

npm run create-admin           # create your first admin account
```

### 5. Build the frontend

```bash
cd /opt/clashofcode/frontend
npm ci
npm run build                  # writes frontend/dist
sudo mkdir -p /var/www/clashofcode
sudo cp -r dist/* /var/www/clashofcode/
```

Leave `VITE_API_URL` unset. The app then calls `/api` on the same origin, which
keeps the cookie setup simple.

### 6. Configure Caddy

Replace `/etc/caddy/Caddyfile` with:

```caddyfile
example.com {
    encode gzip

    # API
    handle /api/* {
        reverse_proxy 127.0.0.1:4000
    }

    # Single-page app: unknown paths fall back to index.html
    handle {
        root * /var/www/clashofcode
        try_files {path} /index.html
        file_server
    }

    header {
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
}
```

```bash
sudo systemctl reload caddy
```

Caddy gets and renews the Let's Encrypt certificate automatically. Open
`https://example.com`, sign up as a developer, and sign in as an admin at
`https://example.com/admin/login`.

### Updating

```bash
cd /opt/clashofcode && git pull

# townhall
cd townhall && docker compose -f docker-compose.prod.yml -f docker-compose.local.yml up -d --build

# backend
cd ../backend && npm ci --omit=dev && pm2 restart clashofcode-api

# frontend
cd ../frontend && npm ci && npm run build && sudo cp -r dist/* /var/www/clashofcode/
```

### Production checklist

- [ ] `JWT_SECRET` and townhall's `AUTH_TOKEN` are long random values, not the example values.
- [ ] Port 3000 (townhall) and port 4000 (backend) are **not** open to the internet. Only 22, 80, and 443 are.
- [ ] The site is served over HTTPS.
- [ ] `CLIENT_ORIGIN` matches the public URL exactly (scheme and host, no trailing slash).
- [ ] MongoDB access is limited to the server's IP.
- [ ] Server hardening is done (deploy user, SSH keys only, fail2ban); see [`townhall/README.md`](townhall/README.md#production-hardening-optional).

### Known limitation behind a reverse proxy

The backend doesn't set Express's `trust proxy`. Behind Caddy, every request
appears to come from `127.0.0.1`, so the sign-in rate limit (20 attempts per
15 minutes) is shared by **all** users rather than applied to each IP. Until
`app.set("trust proxy", 1)` is added in `backend/src/app.js`, a busy site may
see "Too many attempts" errors at sign-in. The run/submit limit is applied to
each user account, so it isn't affected.

---

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| "The code execution service is unavailable" | townhall isn't running, or `TOWNHALL_URL` is wrong. Check `curl $TOWNHALL_URL/health`. |
| "Execution service rejected our credentials" | `TOWNHALL_TOKEN` doesn't match townhall's `AUTH_TOKEN`. |
| Signed out immediately after signing in | The site is served over HTTP while `NODE_ENV=production`. Use HTTPS. |
| Backend exits with `Failed to connect to MongoDB` | Wrong `MONGODB_URL`/`MONGODB_PASSWORD`, or the server's IP isn't allowed in Atlas. |
| Backend exits with `Missing required environment variable` | Add the named variable to `backend/.env`. |
| townhall worker fails with `Range of CPUs is from 0.01 to N.00` | `WORKER_CPUS` is higher than the server's vCPU count. |
| Refreshing `/problems` returns 404 | The web server isn't falling back to `index.html`. Check the `try_files` line. |

More help: [`backend/README.md`](backend/README.md) (admin accounts) and
[`townhall/README.md`](townhall/README.md) (execution engine, API, and scaling).
