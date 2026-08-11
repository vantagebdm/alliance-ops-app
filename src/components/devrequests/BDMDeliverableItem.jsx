import { useState, useRef } from "react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import {
  ChevronRight, Check, Bell, Pencil, Upload, CheckCircle2, X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BDMDeliverableComments from "./BDMDeliverableComments";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", color: "text-muted-foreground bg-[hsl(0,0%,14%)]" },
  { value: "in_progress", label: "In Progress", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { value: "blocked", label: "Blocked", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { value: "awaiting_approval", label: "Awaiting Approval", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "approved", label: "Approved", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  { value: "done", label: "Done", color: "text-green-400 bg-green-500/10 border-green-500/30" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const PRIORITY_COLORS = {
  low: "text-muted-foreground",
  normal: "text-white/60",
  high: "text-amber-400",
  urgent: "text-red-400",
};

export default function BDMDeliverableItem({ task, user, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [taskText, setTaskText] = useState(task.task_text);
  const fileRef = useRef(null);

  const hasUnread = task.has_unread_comments || task.has_unread_edits;

  const patch = async (changes) => {
    const updated = await base44.entities.BDMDeliverable.update(task.id, changes);
    onUpdated(updated);
    return updated;
  };

  const toggleComplete = (checked) => {
    patch({
      completed: checked,
      status: checked ? "done" : "not_started",
      has_unread_edits: true,
      last_edited_by: user?.full_name || user?.email || "Unknown",
      last_edited_at: new Date().toISOString(),
    });
  };

  const handleExpand = () => {
    const wasUnread = hasUnread;
    setExpanded(!expanded);
    if (wasUnread) {
      patch({ has_unread_comments: false, has_unread_edits: false });
    }
  };

  const saveText = () => {
    if (taskText.trim() === task.task_text) {
      setEditing(false);
      return;
    }
    patch({
      task_text: taskText.trim(),
      has_unread_edits: true,
      last_edited_by: user?.full_name || user?.email || "Unknown",
      last_edited_at: new Date().toISOString(),
    });
    setEditing(false);
  };

  const addComment = (content) => {
    const newComment = {
      author: user?.full_name || user?.email || "Unknown",
      author_id: user?.id,
      date: new Date().toISOString(),
      content,
    };
    patch({
      comments: [...(task.comments || []), newComment],
      has_unread_comments: true,
    });
  };

  const setField = (field, value) => {
    patch({
      [field]: value,
      has_unread_edits: true,
      last_edited_by: user?.full_name || user?.email || "Unknown",
      last_edited_at: new Date().toISOString(),
    });
  };

  const approve = () => {
    patch({
      approved: !task.approved,
      approved_by: !task.approved ? (user?.full_name || user?.email) : "",
      approved_at: !task.approved ? new Date().toISOString() : "",
      status: !task.approved ? "approved" : "in_progress",
      has_unread_edits: true,
      last_edited_by: user?.full_name || user?.email || "Unknown",
      last_edited_at: new Date().toISOString(),
    });
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttachments = [];
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        newAttachments.push({
          url: file_url,
          name: file.name,
          file_type: file.type?.startsWith("image") ? "image" : "document",
          uploaded_by: user?.full_name || user?.email || "Unknown",
          uploaded_at: new Date().toISOString(),
        });
      } catch (_) {}
    }
    if (newAttachments.length) {
      patch({
        attachments: [...(task.attachments || []), ...newAttachments],
        has_unread_edits: true,
        last_edited_by: user?.full_name || user?.email || "Unknown",
        last_edited_at: new Date().toISOString(),
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === task.status) || STATUS_OPTIONS[0];

  return (
    <div className={`border-b border-border transition-colors ${hasUnread ? "bg-amber-500/5" : ""}`}>
      <div className="flex items-start gap-3 px-4 py-2.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleComplete}
          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpand}
              className="flex items-center gap-1 flex-1 text-left min-w-0"
            >
              <ChevronRight
                className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
              />
              {editing ? (
                <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                  <Textarea
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    className="min-h-[36px] text-sm py-1"
                    rows={1}
                  />
                  <Button size="icon" className="h-7 w-7 bg-primary text-black" onClick={saveText}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setTaskText(task.task_text); setEditing(false); }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-white/90"}`}>
                  {task.task_text}
                </span>
              )}
            </button>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                title="Edit task"
                className="p-1 rounded-sm text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {hasUnread && (
              <span title="Unread activity" className="flex-shrink-0">
                <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" fill="currentColor" />
              </span>
            )}
            {/* Status badge */}
            <span className={`text-[10px] font-heading uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${statusMeta.color} flex-shrink-0`}>
              {statusMeta.label}
            </span>
            {task.approved && (
              <span className="flex-shrink-0 text-green-400" title={`Approved by ${task.approved_by || ""}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Meta line */}
          {(task.owner || task.due_date || task.priority || task.quoted_price || (task.comments || []).length > 0) && !expanded && (
            <div className="flex items-center gap-3 ml-5 mt-1 text-[10px] text-muted-foreground">
              {task.owner && <span>👤 {task.owner}</span>}
              {task.priority && <span className={PRIORITY_COLORS[task.priority]}>⚑ {task.priority}</span>}
              {task.due_date && <span>📅 {moment(task.due_date).format("DD/MM/YY")}</span>}
              {task.quoted_price > 0 && <span>$ {task.quoted_price.toFixed(2)}</span>}
              {(task.comments || []).length > 0 && <span>💬 {(task.comments || []).length}</span>}
            </div>
          )}

          {/* Expanded panel */}
          {expanded && (
            <div className="ml-5 mt-2 space-y-3">
              {/* Editable fields */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Owner</label>
                  <Input
                    value={task.owner || ""}
                    onChange={(e) => setField("owner", e.target.value)}
                    className="h-7 text-xs"
                    placeholder="Assign"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Priority</label>
                  <select
                    value={task.priority || "normal"}
                    onChange={(e) => setField("priority", e.target.value)}
                    className="flex h-7 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-xs"
                  >
                    {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={task.due_date || ""}
                    onChange={(e) => setField("due_date", e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</label>
                  <select
                    value={task.status || "not_started"}
                    onChange={(e) => setField("status", e.target.value)}
                    className="flex h-7 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Quoted $</label>
                  <Input
                    type="number"
                    value={task.quoted_price || 0}
                    onChange={(e) => setField("quoted_price", Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Approved $</label>
                  <Input
                    type="number"
                    value={task.approved_price || 0}
                    onChange={(e) => setField("approved_price", Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Final Cost $</label>
                  <Input
                    type="number"
                    value={task.final_cost || 0}
                    onChange={(e) => setField("final_cost", Number(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Supplier</label>
                  <Input
                    value={task.supplier || ""}
                    onChange={(e) => setField("supplier", e.target.value)}
                    className="h-7 text-xs"
                    placeholder="Supplier"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Purchase Link</label>
                <Input
                  value={task.purchase_link || ""}
                  onChange={(e) => setField("purchase_link", e.target.value)}
                  className="h-7 text-xs"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes / Remarks</label>
                <Textarea
                  value={task.notes || ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  className="text-xs min-h-[48px]"
                  placeholder="Add notes, decisions, variations..."
                  rows={2}
                />
              </div>

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Attachments ({(task.attachments || []).length})
                  </label>
                  <input ref={fileRef} type="file" multiple onChange={onFiles} className="hidden" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    className="h-6 text-[10px] rounded-sm border-white/20 text-white hover:bg-white/10"
                  >
                    <Upload className="w-3 h-3 mr-1" /> Upload
                  </Button>
                </div>
                {(task.attachments || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(task.attachments || []).map((a, i) => (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline bg-[hsl(0,0%,8%)] border border-border rounded-sm px-2 py-1"
                      >
                        📎 {a.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Approval + last edited */}
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-[10px] text-muted-foreground">
                  {task.last_edited_at ? `Last edited ${moment(task.last_edited_at).format("DD/MM/YY HH:mm")}${task.last_edited_by ? ` by ${task.last_edited_by}` : ""}` : ""}
                </span>
                <Button
                  size="sm"
                  onClick={approve}
                  variant={task.approved ? "default" : "outline"}
                  className={`h-7 text-[10px] rounded-sm ${task.approved ? "bg-green-600 text-white" : "border-white/20 text-white hover:bg-white/10"}`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {task.approved ? "Approved" : "Approve"}
                </Button>
              </div>

              {/* Comments */}
              <BDMDeliverableComments task={task} user={user} onAddComment={addComment} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}