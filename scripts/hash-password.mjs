#!/usr/bin/env node
// Usage : npm run hash-admin -- 'mon-mot-de-passe'
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error("Usage: npm run hash-admin -- '<password>'");
  process.exit(1);
}
const hash = bcrypt.hashSync(pw, 12);
console.log(hash);
