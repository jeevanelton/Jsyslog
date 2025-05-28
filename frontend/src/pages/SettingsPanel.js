import React, { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

const SEVERITY_OPTIONS = [
  { value: "emerg", label: "emerg" },
  { value: "alert", label: "alert" },
  { value: "crit", label: "crit" },
  { value: "err", label: "err" },
  { value: "warning", label: "warning" },
  { value: "notice", label: "notice" },
  { value: "info", label: "info" },
  { value: "debug", label: "debug" },
];

const FACILITY_OPTIONS = [
  "kern", "user", "mail", "daemon", "auth", "syslog", "lpr", "news",
  "uucp", "cron", "authpriv", "ftp", "ntp", "security", "console", "solaris-cron",
  "local0", "local1", "local2", "local3", "local4", "local5", "local6", "local7"
].map(f => ({ value: f, label: f }));


const SettingsPanel = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allowedHostsInput, setAllowedHostsInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});


  useEffect(() => {
    fetch("/api/settings", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setAllowedHostsInput(data.allowed_hosts?.join(", ") || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch settings", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (!res.ok) {

        setFieldErrors(data.errors[0]);



        setSaving(false);
        return; // Stop execution
      } else {
        alert("Settings saved successfully!");
        setFieldErrors({});
      }
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-4">Loading settings...</div>;
  if (!settings) return <div className="p-4">Failed to load settings</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">⚙️ System Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.listen_udp}
              onChange={(e) => setSettings({ ...settings, listen_udp: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Listen on UDP</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.listen_tcp}
              onChange={(e) => setSettings({ ...settings, listen_tcp: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Listen on TCP</span>
          </label>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">UDP Port</label>
            <input
              type="number"
              value={settings.port_udp}
              onChange={(e) => setSettings({ ...settings, port_udp: parseInt(e.target.value) })}
              className={`w-full mt-1 p-2 border rounded ${fieldErrors.udpError ? "border-red-500" : "border-gray-300"
                }`}
            />
            {fieldErrors.udpError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.udpError}</p>
            )}

          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">TCP Port</label>
            <input
              type="number"
              value={settings.port_tcp}
              onChange={(e) => setSettings({ ...settings, port_tcp: parseInt(e.target.value) })}
              className={`w-full mt-1 p-2 border rounded ${fieldErrors.tcpError ? "border-red-500" : "border-gray-300"
                }`}
            />
            {fieldErrors.tcpError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.tcpError}</p>
            )}

          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.real_time}
              onChange={(e) => setSettings({ ...settings, real_time: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Real-time Broadcast</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Retention Days</label>
          <input
            type="number"
            value={settings.retain_days}
            onChange={(e) => setSettings({ ...settings, retain_days: parseInt(e.target.value) })}
            className={`w-full mt-1 p-2 border rounded ${fieldErrors.retainDaysError ? "border-red-500" : "border-gray-300"
              }`}
          />
          {fieldErrors.retainDaysError && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.retainDaysError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Allowed Hosts (comma separated)
          </label>

          <input
            type="text"
            value={allowedHostsInput}
            onChange={(e) => {
              const input = e.target.value;
              setAllowedHostsInput(input);

              const hosts = input
                .split(",")
                .map((h) => h.trim())
                .filter(Boolean);

              setSettings((prev) => ({
                ...prev,
                allowed_hosts: hosts,
              }));
            }}
            placeholder="192.168.1.10, 192.168.1.11"
            className={`w-full mt-1 p-2 border rounded ${fieldErrors.allowedHostsError ? "border-red-500" : "border-gray-300"
              }`}
          />

          {fieldErrors.allowedHostsError && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.allowedHostsError}</p>
          )}

          <p className="text-xs text-gray-500 mt-1">
            Example: 192.168.1.100, 192.168.1.101
          </p>
        </div>




      </div>
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">🔁 Log Forwarding</h3>

        <label className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={settings.forwarding?.enabled || false}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                forwarding: { ...prev.forwarding, enabled: e.target.checked }
              }))
            }
            className="h-4 w-4"
          />
          <span>Enable Log Forwarding</span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Protocol</label>
            <select
              value={settings.forwarding?.protocol || "udp"}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  forwarding: { ...prev.forwarding, protocol: e.target.value }
                }))
              }
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="udp">UDP</option>
              <option value="tcp">TCP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Target Host</label>
            <input
              type="text"
              value={settings.forwarding?.target_host || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  forwarding: { ...prev.forwarding, target_host: e.target.value }
                }))
              }
              className={`w-full mt-1 p-2 border rounded ${fieldErrors.forwardingTargetHostError ? "border-red-500" : "border-gray-300"
                }`}
            />

            {fieldErrors.forwardingTargetHostError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.forwardingTargetHostError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Target Port</label>
            <input
              type="number"
              value={settings.forwarding?.target_port || 514}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  forwarding: { ...prev.forwarding, target_port: parseInt(e.target.value) }
                }))
              }
              className={`w-full mt-1 p-2 border rounded ${fieldErrors.forwardingTargetPortError ? "border-red-500" : "border-gray-300"
                }`}
            />

            {fieldErrors.forwardingTargetPortError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.forwardingTargetPortError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Severity Filter</label>
            <Select
              isMulti
              closeMenuOnSelect={false}
              className="w-full mt-1 p-2 border rounded"
              components={animatedComponents}
              options={SEVERITY_OPTIONS}
              value={(settings.forwarding?.filter?.severity || []).map(val => ({ value: val, label: val }))}
              onChange={(selected) =>
                setSettings((prev) => ({
                  ...prev,
                  forwarding: {
                    ...prev.forwarding,
                    filter: {
                      ...prev.forwarding?.filter,
                      severity: selected.map((s) => s.value),
                    },
                  },
                }))
              }
            />

          </div>

          <div>
            <label className="block text-sm font-medium">Facility Filter</label>
            <Select
              isMulti
              closeMenuOnSelect={false}
              components={animatedComponents}
              className="w-full mt-1 p-2 border rounded"
              options={FACILITY_OPTIONS}
              value={(settings.forwarding?.filter?.facility || []).map(val => ({ value: val, label: val }))}
              onChange={(selected) =>
                setSettings((prev) => ({
                  ...prev,
                  forwarding: {
                    ...prev.forwarding,
                    filter: {
                      ...prev.forwarding?.filter,
                      facility: selected.map((f) => f.value),
                    },
                  },
                }))
              }
            />

          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mt-4"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsPanel;
