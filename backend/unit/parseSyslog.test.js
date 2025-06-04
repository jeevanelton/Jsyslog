const { parseSyslog } = require('../lib/parseSyslog');

test('RFC 3164: sshd failure', () => {
  const result = parseSyslog('<34>Oct 11 22:14:15 server1 sshd: Failed password for root', { address: '192.168.1.100' });
  expect(result).toMatchObject({
    severity: 'crit',
    facility: 'auth',
    hostname: 'server1',
    host_address: '192.168.1.100',
    message: 'Failed password for root'
  });
});

test('RFC 5424: app log', () => {
  const result = parseSyslog('<165>1 2024-04-20T10:20:30Z webhost appname 1234 MSGID - User logged in', { address: '10.10.10.10' });
  expect(result).toMatchObject({
    severity: 'notice',
    facility: 'local4',
    hostname: 'webhost',
    host_address: '10.10.10.10',
    message: 'User logged in'
  });
});
