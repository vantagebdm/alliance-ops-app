import { useState } from "react";
import moment from "moment";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function BDMDeliverableComments({ task, user, onAddComment }) {
  const [draft, setDraft] = useState("");
  const comments = task.comments || [];

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(draft.trim());
    setDraft("");
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
          Comments ({comments.length})
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No comments yet.</p>
        )}
        {comments.map((c, i) => (
          <div key={i} className="bg-[hsl(0,0%,8%)] rounded-sm p-2 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-primary">{c.author || "Unknown"}</span>
              <span className="text-[10px] text-muted-foreground">
                {c.date ? moment(c.date).format("DD/MM/YY HH:mm") : ""}
              </span>
            </div>
            <p className="text-xs text-white/80 whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2 mt-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[44px] text-xs resize-none"
          rows={2}
        />
        <Button
          size="sm"
          onClick={submit}
          disabled={!draft.trim()}
          className="bg-primary text-black hover:bg-primary/90 rounded-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}