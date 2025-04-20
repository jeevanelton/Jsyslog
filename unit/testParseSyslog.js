const { parseSyslog } = require('../lib/parseSyslog');

function testCase(name, input, rinfo, expected) {
  const result = parseSyslog(input, rinfo);
  const pass = Object.keys(expected).every(key => result[key] === expected[key]);
  console.log(pass ? `✅ ${name}` : `❌ ${name}`, pass ? "" : result);
}

// Test RFC 3164
testCase("RFC 3164 basic",
  "<34>Oct 11 22:14:15 myhost sshd: Failed password for user",
  { address: "192.168.0.1" },
  {
    severity: "crit",
    facility: "auth",
    hostname: "myhost",
    host_address: "192.168.0.1",
    message: "Failed password for user"
  }
);

// Test FortiGate-style
testCase("FortiGate log",
  'date=2024-04-20 time=11:45:10 devname="FGT60" severity="warning" msg="Attack blocked"',
  { address: "10.10.10.5" },
  {
    severity: "warning",
    facility: "device",
    hostname: "FGT60",
    host_address: "10.10.10.5",
    message: "Attack blocked",
    date: "2024-04-20 11:45:10"
  }
);

// You can add more test cases here...
