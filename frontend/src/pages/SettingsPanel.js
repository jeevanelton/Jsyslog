import React, { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const API_BASE = process.env.REACT_APP_API_BASE;

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
    fetch(`${API_BASE}/api/settings`, {
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
      const res = await fetch(`${API_BASE}/api/settings`, {
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
  <div className="p-6 font-sans bg-gray-100 min-h-screen w-full">
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">⚙️ System Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.listen_udp}
            onChange={(e) => setSettings({ ...settings, listen_udp: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm">Listen on UDP</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.listen_tcp}
            onChange={(e) => setSettings({ ...settings, listen_tcp: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm">Listen on TCP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">UDP Port</label>
            <input
              type="number"
              value={settings.port_udp}
              onChange={(e) => setSettings({ ...settings, port_udp: parseInt(e.target.value) })}
              className={`w-full p-2 rounded-lg border ${fieldErrors.udpError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.udpError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.udpError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">TCP Port</label>
            <input
              type="number"
              value={settings.port_tcp}
              onChange={(e) => setSettings({ ...settings, port_tcp: parseInt(e.target.value) })}
              className={`w-full p-2 rounded-lg border ${fieldErrors.tcpError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.tcpError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.tcpError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.real_time}
            onChange={(e) => setSettings({ ...settings, real_time: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm">Real-time Broadcast</span>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Retention Days</label>
          <input
            type="number"
            value={settings.retain_days}
            onChange={(e) => setSettings({ ...settings, retain_days: parseInt(e.target.value) })}
            className={`w-full p-2 rounded-lg border ${fieldErrors.retainDaysError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {fieldErrors.retainDaysError && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.retainDaysError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Allowed Hosts (comma separated)</label>
          <input
            type="text"
            value={allowedHostsInput}
            onChange={(e) => {
              const input = e.target.value;
              setAllowedHostsInput(input);
              const hosts = input.split(",").map(h => h.trim()).filter(Boolean);
              setSettings((prev) => ({ ...prev, allowed_hosts: hosts }));
            }}
            placeholder="192.168.1.10, 192.168.1.11"
            className={`w-full p-2 rounded-lg border ${fieldErrors.allowedHostsError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {fieldErrors.allowedHostsError && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.allowedHostsError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Example: 192.168.1.100, 192.168.1.101</p>
        </div>
      </div>

      <div className="border-t pt-6 mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🔁 Log Forwarding</h3>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={settings.forwarding?.enabled || false}
            onChange={(e) => setSettings((prev) => ({
              ...prev,
              forwarding: { ...prev.forwarding, enabled: e.target.checked },
            }))}
            className="h-4 w-4"
          />
          <span className="text-sm">Enable Log Forwarding</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Protocol</label>
            <select
              value={settings.forwarding?.protocol || "udp"}
              onChange={(e) => setSettings((prev) => ({
                ...prev,
                forwarding: { ...prev.forwarding, protocol: e.target.value },
              }))}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="udp">UDP</option>
              <option value="tcp">TCP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Target Host</label>
            <input
              type="text"
              value={settings.forwarding?.target_host || ""}
              onChange={(e) => setSettings((prev) => ({
                ...prev,
                forwarding: { ...prev.forwarding, target_host: e.target.value },
              }))}
              className={`w-full p-2 rounded-lg border ${fieldErrors.forwardingTargetHostError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.forwardingTargetHostError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.forwardingTargetHostError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Target Port</label>
            <input
              type="number"
              value={settings.forwarding?.target_port || 514}
              onChange={(e) => setSettings((prev) => ({
                ...prev,
                forwarding: { ...prev.forwarding, target_port: parseInt(e.target.value) },
              }))}
              className={`w-full p-2 rounded-lg border ${fieldErrors.forwardingTargetPortError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.forwardingTargetPortError && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.forwardingTargetPortError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Severity Filter</label>
            <Select
              isMulti
              closeMenuOnSelect={false}
              className="w-full"
              components={animatedComponents}
              options={SEVERITY_OPTIONS}
              value={(settings.forwarding?.filter?.severity || []).map(val => ({ value: val, label: val }))}
              onChange={(selected) => setSettings((prev) => ({
                ...prev,
                forwarding: {
                  ...prev.forwarding,
                  filter: {
                    ...prev.forwarding?.filter,
                    severity: selected.map((s) => s.value),
                  },
                },
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Facility Filter</label>
            <Select
              isMulti
              closeMenuOnSelect={false}
              className="w-full"
              components={animatedComponents}
              options={FACILITY_OPTIONS}
              value={(settings.forwarding?.filter?.facility || []).map(val => ({ value: val, label: val }))}
              onChange={(selected) => setSettings((prev) => ({
                ...prev,
                forwarding: {
                  ...prev.forwarding,
                  filter: {
                    ...prev.forwarding?.filter,
                    facility: selected.map((f) => f.value),
                  },
                },
              }))}
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-sm"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default SettingsPanel;
