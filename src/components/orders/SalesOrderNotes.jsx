import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, CornerDownRight } from "lucide-react";
import moment from "moment";

export default function SalesOrderNotes({ order, onUpdated }) {
  const { user } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const notes = order.notes_log || [];

  const handleAddNote = async () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const entry = {
        note: trimmed,
        author: user?.full_name || user?.email || "Unknown User",
        author_id: user?.id || "",
        timestamp: new Date().toISOString(),
      };
      const updatedLog = [...notes, entry];
      await base44.entities.SalesOrder.update(order.id, { notes_log: updatedLog });
      setNoteText("");
      onUpdated && onUpdated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="font-heading text-xs font-semibold text-white uppercase tracking-wider">Notes & Updates</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Existing notes */}
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">No notes recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...notes].reverse().map((entry, i) => (
              <div key={i} className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-sm p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <CornerDownRight className="w-3 h-3 text-primary/60" />
                    <span className="font-heading text-[11px] uppercase tracking-wider text-foreground/70 font-semibold">
                      {entry.author}
                    </span>
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground">
                    {moment(entry.timestamp).format("DD MMM YYYY · HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 pl-4.5 whitespace-pre-wrap">{entry.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add note */}
        <div className="pt-2 border-t border-border/50">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note or update..."
            rows={2}
            className="rounded-sm text-sm resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {user?.full_name || user?.email || "Unknown"} · {moment().format("DD MMM YYYY · HH:mm")}
            </span>
            <Button
              onClick={handleAddNote}
              disabled={saving || !noteText.trim()}
              size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider"
            >
              {saving ? "Saving..." : "Add Note"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}