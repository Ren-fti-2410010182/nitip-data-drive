const mysql = require('mysql');
const fs = require('fs');
console.log('START');
const c = mysql.createConnection({host:'127.0.0.1', port:3306, user:'root', password:'', database:'nitip_data_drive', connectTimeout:30000});
c.connect(err => {
  if (err) {
    console.error('CONNECT_ERROR', err.code, err.message);
    process.exit(1);
  }
  console.log('CONNECTED');
  c.end(err2 => {
    if (err2) console.error('END_ERROR', err2.message);
    else console.log('END_OK');
    process.exit(0);
  });
});

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
