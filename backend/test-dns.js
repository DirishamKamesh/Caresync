const dns = require('dns');

console.log('Testing SRV lookup for: _mongodb._tcp.caresync.jpcpw3k.mongodb.net');

dns.resolveSrv('_mongodb._tcp.caresync.jpcpw3k.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV lookup failed:', err.message);
    console.log('Checking standard A record...');
    dns.lookup('caresync.jpcpw3k.mongodb.net', (err, address) => {
      if (err) {
        console.error('Standard lookup failed too:', err.message);
      } else {
        console.log('Standard lookup succeeded! IP:', address);
      }
    });
  } else {
    console.log('DNS SRV lookup succeeded! Addresses:', JSON.stringify(addresses, null, 2));
  }
});
