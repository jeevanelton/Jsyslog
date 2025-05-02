const { parseSyslog } = require('../lib/parseSyslog');


function testCase(name, input, rinfo, expectedPartial) {
  const result = parseSyslog(input, rinfo);
  const keys = Object.keys(expectedPartial);
  const pass = keys.every(k => result[k] === expectedPartial[k]);

  console.log(pass ? `✅ ${name}` : `❌ ${name}`);
  if (!pass) {
    console.log("Expected:", expectedPartial);
    console.log("Got     :", result);
  }
}

// 1️⃣ RFC 3164 (standard Linux)
testCase("RFC 3164: sshd failure",
  "<34>Oct 11 22:14:15 server1 sshd: Failed password for root",
  { address: "192.168.1.100" },
  {
    severity: "crit",
    facility: "auth",
    hostname: "server1",
    host_address: "192.168.1.100",
    message: "Failed password for root"
  }
);

// 2️⃣ RFC 5424 (structured log)
testCase("RFC 5424: app log",
  "<165>1 2024-04-20T10:20:30Z webhost appname 1234 MSGID - User logged in",
  { address: "10.10.10.10" },
  {
    severity: "notice",
    facility: "local4",
    hostname: "webhost",
    host_address: "10.10.10.10",
    message: "User logged in"
  }
);

// 3️⃣ FortiGate (key=value log)
testCase("FortiGate: detected virus",
  'date=2024-04-20 time=12:00:00 devname="FGT-100" severity="critical" msg="EICAR test virus blocked"',
  { address: "172.16.1.1" },
  {
    severity: "critical",
    facility: "device",
    hostname: "FGT-100",
    host_address: "172.16.1.1",
    message: "EICAR test virus blocked",
    date: "2024-04-20 12:00:00"
  }
);

// 4️⃣ Cisco ASA
testCase("Cisco ASA log",
  '<166>Apr 20 13:00:00 firewall01 : %ASA-6-302013: Built outbound TCP connection for ...',
  { address: "192.168.0.1" },
  {
    severity: "info",
    facility: "local4",
    hostname: "firewall01",
    host_address: "192.168.0.1",
    message: "%ASA-6-302013: Built outbound TCP connection for ..."
  }
);

// 5️⃣ pfSense (filterlog format)
testCase("pfSense filterlog",
  '<134>Apr 20 14:33:00 pfsense filterlog: 100,,,0,igb0,match,pass,in,4,0x0,...',
  { address: "192.168.0.2" },
  {
    severity: "info",
    facility: "local0",
    hostname: "pfsense",
    host_address: "192.168.0.2",
    message: "100,,,0,igb0,match,pass,in,4,0x0,..."
  }
);

// 6️⃣ Plain message, no priority (fallback)
testCase("Plain log, no PRI",
  "kernel: system boot completed",
  { address: "127.0.0.1" },
  {
    severity: "info",
    facility: "unknown",
    host_address: "127.0.0.1",
    message: "kernel: system boot completed"
  }
);

// 7️⃣ Malformed PRI (non-integer)
testCase("Malformed PRI",
  "<XYZ>Apr 20 15:00:00 host process: Invalid priority",
  { address: "10.0.0.1" },
  {
    severity: "info",
    facility: "unknown",
    host_address: "10.0.0.1",
    message: "<XYZ>Apr 20 15:00:00 host process: Invalid priority"
  }
);

// 8️⃣ Incomplete FortiGate (missing time)
testCase("FortiGate missing time",
  'date=2024-04-20 devname="FGT60E" severity="info" msg="Policy matched"',
  { address: "10.0.0.5" },
  {
    severity: "info",
    facility: "device",
    hostname: "FGT60E",
    host_address: "10.0.0.5",
    message: "Policy matched"
  }
);

// 9️⃣ Ubiquiti log
testCase("Ubiquiti: DHCP event",
    "<190>Apr 20 15:32:12 unifi dhcpd: DHCPACK on 192.168.1.50 to 00:11:22:33:44:55",
    { address: "192.168.1.20" },
    {
      severity: "info",
      facility: "local7",
      hostname: "unifi",
      host_address: "192.168.1.20",
      message: "DHCPACK on 192.168.1.50 to 00:11:22:33:44:55"
    }
  );
  
  // 🔟 Mikrotik-style syslog (RFC3164)
  testCase("Mikrotik router log",
    "<134>Apr 20 15:50:01 router1 system: login user=admin from 192.168.88.10",
    { address: "192.168.88.1" },
    {
      severity: "info",
      facility: "local0",
      hostname: "router1",
      host_address: "192.168.88.1",
      message: "login user=admin from 192.168.88.10"
    }
  );
  
  // 1️⃣1️⃣ Message with trailing whitespace
  testCase("Trailing whitespace in message",
    "<38>Apr 20 16:00:00 server2 app: Hello world     ",
    { address: "10.0.0.50" },
    {
      severity: "info", // ← fix this line
      facility: "auth",
      hostname: "server2",
      host_address: "10.0.0.50",
      message: "Hello world"
    }
  );
  
  
  // 1️⃣2️⃣ Structured JSON log via syslog
  testCase("JSON syslog message",
    '<134>{"timestamp":"2024-04-20T16:10:00Z","level":"info","msg":"Audit passed"}',
    { address: "172.17.0.1" },
    {
      severity: "info",
      facility: "local0",
      hostname: "unknown",
      host_address: "172.17.0.1",
      message: '{"timestamp":"2024-04-20T16:10:00Z","level":"info","msg":"Audit passed"}'
    }
  );
  
  // 1️⃣3️⃣ No date or hostname — fallback check
  testCase("Fallback: no date, no host",
    "<14>kernel panic: segmentation fault",
    { address: "127.0.0.10" },
    {
      severity: "info",
      facility: "user",
      host_address: "127.0.0.10",
      message: "kernel panic: segmentation fault"
    }
  );
  
  // 1️⃣4️⃣ RFC3164 with short tag (cron)
  testCase("RFC3164: cron log",
    "<15>Apr 20 17:01:00 node1 CRON: Job started",
    { address: "192.168.3.3" },
    {
      severity: "debug",
      facility: "user",
      hostname: "node1",
      host_address: "192.168.3.3",
      message: "Job started"
    }
  );
  
  // 15️⃣ Very high PRI (max valid = 191)
testCase("High PRI limit",
    "<191>Apr 20 18:00:00 edgehost auditd: User root changed file permissions",
    { address: "192.168.50.5" },
    {
      severity: "debug",
      facility: "local7", // 191 / 8 = 23 = local7
      hostname: "edgehost",
      host_address: "192.168.50.5",
      message: "User root changed file permissions"
    }
  );
  
  // 16️⃣ Juniper-style syslog (key:value)
  testCase("Juniper log",
    '<134>Apr 20 18:10:00 core01 jnpr-log: event=interface_down if=ge-0/0/1 reason=admin_down',
    { address: "10.10.10.20" },
    {
      severity: "info",
      facility: "local0",
      hostname: "core01",
      host_address: "10.10.10.20",
      message: 'event=interface_down if=ge-0/0/1 reason=admin_down'
    }
  );
  
  // 17️⃣ Log with tab characters and newline mess
  testCase("Messy whitespace",
    "<32>Apr 20 18:20:00 serverX auditd:\tUser deleted file\n",
    { address: "192.168.1.15" },
    {
      severity: "emerg", // 40 % 8 = 0
      facility: "auth",  // 40 / 8 = 5
      hostname: "serverX",
      host_address: "192.168.1.15",
      message: "User deleted file"
    }
  );
  
  // 18️⃣ FortiGate with multiple spaces inside quotes
  testCase("FortiGate: long msg spacing",
    'date=2024-04-20 time=18:30:00 devname="FGT-A1" severity="notice" msg="Interface port1 down due to link failure"',
    { address: "10.0.0.1" },
    {
      severity: "notice",
      facility: "device",
      hostname: "FGT-A1",
      host_address: "10.0.0.1",
      message: "Interface port1 down due to link failure",
      date: "2024-04-20 18:30:00"
    }
  );
  
  // 19️⃣ JSON inside FortiGate msg
  testCase("FortiGate: msg contains JSON",
    'date=2024-04-20 time=18:40:00 devname="FGT60E" severity="info" msg="{\\"event\\":\\"scan_blocked\\",\\"src\\":\\"192.168.1.22\\"}"',
    { address: "10.10.10.10" },
    {
      severity: "info",
      facility: "device",
      hostname: "FGT60E",
      host_address: "10.10.10.10",
      message: '{"event":"scan_blocked","src":"192.168.1.22"}',
      date: "2024-04-20 18:40:00"
    }
  );
  
  // 20️⃣ Missing message content after tag
  testCase("RFC3164: empty message",
    "<38>Apr 20 18:50:00 host123 ntpd:",
    { address: "10.0.0.3" },
    {
      severity: "info",
      facility: "auth",
      hostname: "host123",
      host_address: "10.0.0.3",
      message: ""
    }
  );
  
  // 21️⃣ Multiple `:` colons in message
  testCase("Multiple colons",
    "<38>Apr 20 19:00:00 vpn-fw1 openvpn: Connection from 192.168.100.50:1194 accepted",
    { address: "192.168.100.1" },
    {
      severity: "info",
      facility: "auth",
      hostname: "vpn-fw1",
      host_address: "192.168.100.1",
      message: "Connection from 192.168.100.50:1194 accepted"
    }
  );
  
  // 22️⃣ Syslog line with ISO timestamp and hostname but no tag
  testCase("RFC3164 no tag",
    "<26>Apr 20 19:10:00 dbserver: PostgreSQL ready",
    { address: "10.1.1.1" },
    {
      severity: "crit",
      facility: "daemon",
      hostname: "dbserver",
      host_address: "10.1.1.1",
      message: "PostgreSQL ready"
    }
  );
  