/**
 * Script: generate_users_mongo.js
 * Purpose: Generate bcrypt-hashed user documents ready to paste into MongoDB Atlas
 * Usage: node scripts/generate_users_mongo.js
 */

import bcrypt from 'bcrypt';
import { writeFileSync } from 'fs';

const SALT_ROUNDS = 10;

const users = [
  {"name":"Trần Tuấn Chấn","email":"tuanchan1988@outlook.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Hồ Văn Bình","email":"hovanbinh08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đỗ Thanh Linh","email":"thanhlinh.do@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Ngô Quỳnh Phong","email":"ngoquynhphong09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Vũ Văn Phong","email":"vuvanphong01@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Như Linh","email":"lenhulinh2209@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trần Như Vy","email":"nhuvy.tran09@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Hồ Đức Trang","email":"ductrangho@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Nguyễn Thanh Bách","email":"nguyenthanhbach1987@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Phạm Tuấn Vy","email":"phamtuanvy08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Bùi Đức Khánh","email":"buiduckhanh98@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Thị Sơn","email":"thisondang@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Ngô Hữu Duy","email":"huuduy.ngo09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trần Thị Vy","email":"tranthivy08@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Phan Hoài Vy","email":"phanhoaivy@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Như Sơn","email":"lenhuson08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Hồ Như Trang","email":"honhutrang@icloud.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Hoài Khánh","email":"lehoaikhanh1986@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Ngô Thanh Duy","email":"thanhduyngo08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Hoàng Thị Sơn","email":"hoangthison09@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Kim Linh","email":"kimlinhdang@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lâm Hoài Vy","email":"lamhoaivy1989@outlook.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Trịnh Hữu Phong","email":"trinhhuuphong@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Lê Quỳnh Linh","email":"quynhlinh.le08@icloud.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Hoài Sơn","email":"danghoaison1985@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Lê Hữu Vy","email":"huuvyle09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đỗ Khánh Vy","email":"dokhanhvy08@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Vũ Thanh Yến","email":"vuthanhyen@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trần Quỳnh Vy","email":"tranquynhvy09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Võ Kim Duy","email":"kimduy.vo@outlook.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đỗ Đức Chấn","email":"doducchan08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Phạm Thị Duy","email":"phamthiduy09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Trịnh Quỳnh Trang","email":"trinhquynhtrang1988@outlook.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Lâm Hoài Vy","email":"hoaivylam08@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Thị Hải","email":"dangthihai08@hotmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Phạm Minh Vy","email":"phamminhvy1987@gmail.com","pass":"EduTech2026@","role":"teacher"},
  {"name":"Đỗ Quỳnh Phong","email":"doquynhphong09@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Đặng Như Yến","email":"nhuyendang@gmail.com","pass":"EduTech2026@","role":"student"},
  {"name":"Vũ Hữu Vy","email":"vuhuuvy1986@outlook.com","pass":"EduTech2026@","role":"teacher"}
];

async function generate() {
  const now = new Date().toISOString();
  const docs = [];

  for (const u of users) {
    const hash = await bcrypt.hash(u.pass, SALT_ROUNDS);
    docs.push({
      name: u.name,
      email: u.email,
      password: hash,
      role: u.role,
      plan: "free",
      createdAt: { "$date": now },
      updatedAt: { "$date": now },
      __v: 0
    });
  }

  // Write to output file
  const output = JSON.stringify(docs, null, 2);
  writeFileSync('scripts/users_to_insert.json', output, 'utf8');
  console.log(`✅ Generated ${docs.length} documents -> scripts/users_to_insert.json`);
  console.log('📋 Paste the content of users_to_insert.json into MongoDB Atlas Insert Document dialog');
}

generate().catch(console.error);
