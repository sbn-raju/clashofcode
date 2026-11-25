# clashofcode backend

## Creating an admin account

Admins create, test, and publish problems. Public sign-up only creates developer
accounts, so admin accounts are created from the command line.

### Before you start

- Run the commands from the `backend/` folder.
- Run `npm install` once.
- Make sure `backend/.env` contains `MONGODB_URL`, `MONGODB_PASSWORD`, and `JWT_SECRET`
  (see `.env.example`). The script connects to the same database as the API.

### Option 1: interactive (recommended)

```bash
npm run create-admin
```

The script asks for:

| Prompt   | Rules                                                          |
| -------- | -------------------------------------------------------------- |
| Name     | 2–60 characters                                                |
| Handle   | 3–24 characters: letters, numbers, or underscores              |
| Email    | A valid email address                                          |
| Password | At least 8 characters, with a letter and a number. Typing is hidden. |

### Option 2: one command

Pass the details as flags. The password is read from `ADMIN_PASSWORD`, or prompted for if
that is not set:

```bash
npm run create-admin -- --name "Jane Admin" --handle jane_admin --email jane@company.com
```

Note the `--` after `create-admin`: npm needs it to pass the flags to the script.

To create an admin without any prompts (for example, in a setup script):

```bash
ADMIN_PASSWORD='choose-a-strong-pass1' npm run create-admin -- --name "Jane Admin" --handle jane_admin --email jane@company.com
```

Avoid this form on shared machines: the password ends up in your shell history.

### On success

```text
Admin created: @jane_admin <jane@company.com>. Sign in at /admin/login.
```

Then open `http://localhost:5173/admin/login` (or `/admin/login` on your deployed site) and
sign in with the email or handle and the password.

### Troubleshooting

| Message | What to do |
| ------- | ---------- |
| `A user with that email already exists (role: professional)` | The email or handle is already in use, possibly by a developer account. Admins need their own email and handle. An existing account's role can't be changed. |
| `Password must be at least 8 characters and include a letter and a number.` | Choose a stronger password. |
| `User validation failed: handle: ...` | The name, handle, or email breaks one of the rules in the table above. |
| `Missing required environment variable: ...` | Add the named variable to `backend/.env`. |
| `querySrv ENOTFOUND` or another connection error | Check `MONGODB_URL` and `MONGODB_PASSWORD`, and that your IP is allowed in MongoDB Atlas network access. |
| `This account does not have admin access.` when signing in | You're signing in at `/admin/login` with a developer account. Use the admin account you created. |

### Removing an admin

There is no command for this yet. Delete the user document from the `users` collection
in MongoDB (for example in Atlas → Browse Collections). Problems the admin created stay.
