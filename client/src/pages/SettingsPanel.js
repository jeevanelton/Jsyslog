import React, { useEffect, useState } from "react";

const SettingsPanel = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allowedHostsInput, setAllowedHostsInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});


  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setAllowedHostsInput(data.allowed_hosts?.join(", ") || ""); // ✅ Fix here
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      console.log (data)

      if (!res.ok) {
        const fieldSpecific = {};
        const generalErrors = [];

        for (const err of data.errors) {
          if (err.toLowerCase().includes("ip") || err.toLowerCase().includes("allowed")) {
            fieldSpecific.allowed_hosts = err;
          } else {
            generalErrors.push(err);
          }
        }

        setFieldErrors(fieldSpecific);

        if (generalErrors.length) {
          alert("Validation error:\n" + generalErrors.join("\n"));
        }

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
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">TCP Port</label>
            <input
              type="number"
              value={settings.port_tcp}
              onChange={(e) => setSettings({ ...settings, port_tcp: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 border rounded"
            />
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
            className="w-full mt-1 p-2 border rounded"
          />
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
            className={`w-full mt-1 p-2 border rounded ${fieldErrors.allowed_hosts ? "border-red-500" : "border-gray-300"
              }`}
          />

          {fieldErrors.allowed_hosts && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.allowed_hosts}</p>
          )}

          <p className="text-xs text-gray-500 mt-1">
            Example: 192.168.1.100, 192.168.1.101
          </p>
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
  );
};

export default SettingsPanel;
