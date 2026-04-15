import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function PartNumberingSettings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PartNumbering.list();
      setConfigs(data || []);
    } catch (err) {
      console.error("Error loading configs:", err);
    }
    setLoading(false);
  };

  const initializeDefaults = async () => {
    setInitializing(true);
    try {
      const res = await base44.functions.invoke("initializePartNumbering", {});
      setUpdateMessage(`✓ ${res.data.message}`);
      setTimeout(() => setUpdateMessage(""), 5000);
      loadConfigs();
    } catch (err) {
      setUpdateMessage(`✗ ${err.message}`);
    }
    setInitializing(false);
  };

  const updateConfig = async (id, updates) => {
    try {
      await base44.entities.PartNumbering.update(id, updates);
      setUpdateMessage("✓ Settings updated");
      setTimeout(() => setUpdateMessage(""), 3000);
      loadConfigs();
    } catch (err) {
      setUpdateMessage(`✗ ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold uppercase">Part Numbering Configuration</h3>
          <Button onClick={initializeDefaults} disabled={initializing} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {initializing ? "Initializing..." : "Initialize Defaults"}
          </Button>
        </div>
        {updateMessage && (
          <div className={`mb-4 p-3 rounded-sm text-sm ${updateMessage.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {updateMessage}
          </div>
        )}
      </div>

      {configs.length === 0 ? (
        <Card className="p-6 border-dashed border-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">No part numbering configuration found</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Initialize Defaults" above to create the standard category prefixes.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map(config => (
            <Card key={config.id} className="p-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <div>
                  <label className="font-heading text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                  <p className="font-semibold capitalize">{config.category}</p>
                </div>
                <div>
                  <label className="font-heading text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Prefix</label>
                  <p className="font-mono font-bold text-primary">{config.prefix}</p>
                </div>
                <div>
                  <label className="font-heading text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Current Sequence</label>
                  <p className="font-mono">{config.current_sequence}</p>
                </div>
                <div>
                  <label className="font-heading text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Next Number</label>
                  <p className="font-mono text-green-600 font-semibold">{config.prefix}{String(config.current_sequence + 1).padStart(config.number_padding || 4, '0')}</p>
                </div>
                <div>
                  <label className="font-heading text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Padding</label>
                  <Input 
                    type="number" 
                    value={config.number_padding} 
                    onChange={e => updateConfig(config.id, { number_padding: parseInt(e.target.value) })}
                    className="rounded-sm text-xs"
                    min="1"
                    max="6"
                  />
                </div>
                <div>
                  <label className="font-heading text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Active</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={config.is_active} 
                      onChange={e => updateConfig(config.id, { is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                    <span className="text-xs">{config.is_active ? "Yes" : "No"}</span>
                  </label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-heading text-sm font-semibold text-blue-900 mb-2">About Part Numbering</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Each category has its own independent sequence counter</li>
          <li>• Numbers auto-increment starting from the next available sequence</li>
          <li>• Format: [Prefix][Padded Sequence] e.g. APP-ENG0001</li>
          <li>• Numbers are never reused, even if a part is deleted</li>
          <li>• Only admins can manually override generated numbers</li>
        </ul>
      </Card>
    </div>
  );
}