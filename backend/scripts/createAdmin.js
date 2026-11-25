#!/usr/bin/env node
/**
 * Create an admin account. Admins cannot sign up through the public API.
 *
 * Usage:
 *   npm run create-admin -- --name "Jane Admin" --handle jane_admin --email jane@company.com
 *
 * The password is read from the ADMIN_PASSWORD env var, or prompted for (hidden).
 */
const readline = require("readline");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const m = argv[i].match(/^--([a-z]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] ?? argv[++i];
  }
  return out;
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args.name || (await ask("Name: "));
  const handle = (args.handle || (await ask("Handle: "))).toLowerCase();
  const email = (args.email || (await ask("Email: "))).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (await ask("Password (min 8 chars): ", { hidden: true }));

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must be at least 8 characters and include a letter and a number.");
  }

  await connectDB();
  const existing = await User.findOne({ $or: [{ email }, { handle }] }).lean();
  if (existing) {
    throw new Error(
      `A user with that ${existing.email === email ? "email" : "handle"} already exists (role: ${existing.role}).`,
    );
  }

  const admin = await User.create({ name, handle, email, password, role: "admin" });
  console.log(`Admin created: @${admin.handle} <${admin.email}>. Sign in at /admin/login.`);
}

main()
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
