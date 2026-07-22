import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Edit3, Send, FileText, ImageIcon, CheckCircle2, HelpCircle, MessageCircle, Loader2, Upload, Clipboard, Bell } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";

const REQUEST_TYPE_LABELS = {
  bug_site_issue: "Bug / Site Issue",
  new_idea: "New Idea",
  function_addition: "Function Addition",
  documentation: "Documentation",
  process_modification: "Process Modification",
  process_addition: "Process Addition",
};

const STATUS_FLOW = [
  { value: "open", label: "Open", icon: MessageCircle },
  { value: "in_progress", label: "In Progress", icon: Loader2 },
  { value: "awaiting_response", label: "Awaiting Response", icon: HelpCircle },
  { value: "resolved", label: "Resolved", icon: CheckCircle2 },
  { value: "closed", label: "Closed", icon: CheckCircle2 },
];

export default function DevRequestDetail({ request, user, onClose, onUpdated, onEdit }) {
  const [commentType, setCommentType] = useState("comment");
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef();
  const docRef = useRef();

  // Upload files and append to request attachments
  const uploadFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    const uploaded = [];
    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        const isImage = file.type.startsWith("image/");
        uploaded.push({
          url: result.file_url,
          name: file.name,
          file_type: isImage ? "image" : "document",
        });
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    if (uploaded.length) {
      const updatedAttachments = [...(request.attachments || []), ...uploaded];
      try {
        await base44.entities.DevRequest.update(request.id, { attachments: updatedAttachments });
        onUpdated({ ...request, attachments: updatedAttachments });
      } catch (err) {
        setError(`Failed to save attachments: ${err.message}`);
      }
    }
    setUploading(false);
  };

  // Paste handler — supports right-click paste and Ctrl+V
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      e.preventDefault();
      await uploadFiles(files);
    }
  };

  // Document-level paste listener for Ctrl+V anywhere in the modal
  useEffect(() => {
    const docHandler = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) {
        e.preventDefault();
        await uploadFiles(files);
      }
    };
    document.addEventListener("paste", docHandler);
    return () => document.removeEventListener("paste", docHandler);
  }, []);

  const addComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    setError("");
    try {
      const newComment = {
        author: user?.full_name || user?.email || "Unknown",
        author_id: user?.id,
        date: new Date().toISOString(),
        type: commentType,
        content: commentText.trim(),
      };
      const updatedComments = [...(request.comments || []), newComment];
      await base44.entities.DevRequest.update(request.id, { comments: updatedComments, has_unread_comments: true });
      setCommentText("");
      onUpdated({ ...request, comments: updatedComments, has_unread_comments: true });
    } catch (err) {
      setError(`Failed to post comment: ${err.message}`);
    }
    setPosting(false);
  };

  // Mark comments as read when the detail is opened
  useEffect(() => {
    if (request.has_unread_comments) {
      base44.entities.DevRequest.update(request.id, { has_unread_comments: false }).catch(() => {});
    }
  }, [request.id]);

  const changeStatus = async (newStatus) => {
    if (statusSaving || newStatus === request.status) return;
    setStatusSaving(true);
    setError("");
    try {
      await base44.entities.DevRequest.update(request.id, { status: newStatus });
      onUpdated({ ...request, status: newStatus });
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
    setStatusSaving(false);
  };

  const removeAttachment = async (index) => {
    const updatedAttachments = (request.attachments || []).filter((_, i) => i !== index);
    try {
      await base44.entities.DevRequest.update(request.id, { attachments: updatedAttachments });
      onUpdated({ ...request, attachments: updatedAttachments });
    } catch (err) {
      setError(`Failed to remove attachment: ${err.message}`);
    }
  };

  const commentTypeMeta = {
    comment: { label: "Comment", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    question: { label: "Question", icon: HelpCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    answer: { label: "Answer", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto" onPaste={handlePaste}>
      <div className="w-full max-w-3xl bg-card border border-border rounded-xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4 sticky top-0 bg-card rounded-t-xl z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono font-bold text-primary text-sm">{request.request_number}</span>
              <StatusBadge status={request.status} />
            </div>
            <h2 className="font-heading font-bold text-lg text-foreground">{request.summary}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Requested By</p>
              <p className="text-foreground font-medium mt-0.5">{request.requested_by}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-foreground mt-0.5">{moment(request.request_date).format("DD/MM/YY HH:mm")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
              <p className="text-foreground mt-0.5">{REQUEST_TYPE_LABELS[request.request_type]}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Area</p>
              <p className="text-foreground mt-0.5 capitalize">{request.area}</p>
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <div>
              <p className="text-xs text-primary font-heading uppercase tracking-widest mb-2 pb-1 border-b border-border">Description</p>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </div>
          )}

          {/* Issue flag + priority */}
          <div className="flex gap-3">
            {request.is_issue && (
              <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold rounded-sm">ISSUE / BUG</span>
            )}
            <span className="px-2.5 py-1 bg-secondary text-white/60 text-xs font-semibold rounded-sm capitalize">{request.priority} priority</span>
          </div>

          {/* Attachments with upload */}
          <div>
            <p className="text-xs text-primary font-heading uppercase tracking-widest mb-2 pb-1 border-b border-border">Attachments</p>
            <div
              contentEditable
              suppressContentEditableWarning
              tabIndex={0}
              className={`border border-dashed border-border rounded-lg p-4 transition-colors cursor-text focus:outline-none focus:border-primary focus:bg-primary/5 ${pasteHint ? "border-primary bg-primary/5" : ""}`}
              onPaste={handlePaste}
              onKeyDown={e => {
                if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "v") {
                  e.preventDefault();
                }
              }}
              onDragOver={e => { e.preventDefault(); setPasteHint(true); }}
              onDragLeave={() => setPasteHint(false)}
              onDrop={e => { e.preventDefault(); setPasteHint(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => imgRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-1" />}
                  Upload Images
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => docRef.current?.click()} disabled={uploading}>
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Upload Documents / PDFs
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Right-click → Paste, Ctrl+V, or drag files here</span>
                </div>
              </div>
              <input ref={imgRef} type="file" multiple accept="image/*" className="hidden" onChange={e => { uploadFiles(Array.from(e.target.files)); e.target.value = ""; }} />
              <input ref={docRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="hidden" onChange={e => { uploadFiles(Array.from(e.target.files)); e.target.value = ""; }} />

              {request.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {request.attachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {att.file_type === "image" ? (
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          <img src={att.url} alt={att.name} className="w-24 h-24 object-cover rounded-lg border border-border hover:border-primary transition-colors" />
                        </a>
                      ) : (
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="w-24 h-24 flex flex-col items-center justify-center bg-secondary rounded-lg border border-border hover:border-primary transition-colors p-2">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground mt-1 truncate w-full text-center">{att.name}</span>
                        </a>
                      )}
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Management */}
          <div>
            <p className="text-xs text-primary font-heading uppercase tracking-widest mb-2 pb-1 border-b border-border">Status Management</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map(s => {
                const Icon = s.icon;
                const isActive = request.status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => changeStatus(s.value)}
                    disabled={statusSaving}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50 ${
                      isActive ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"
                    }`}
                  >
                    {statusSaving && isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments / Questions / Answers */}
          <div>
            <p className="text-xs text-primary font-heading uppercase tracking-widest mb-3 pb-1 border-b border-border flex items-center gap-2">
              Discussion ({(request.comments || []).length})
              {request.has_unread_comments && (
                <span className="inline-flex items-center gap-1 text-red-500">
                  <Bell className="w-4 h-4 animate-bounce" fill="currentColor" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">New Comment</span>
                </span>
              )}
            </p>

            {/* Existing comments */}
            <div className="space-y-3 mb-4">
              {(request.comments || []).map((c, i) => {
                const meta = commentTypeMeta[c.type] || commentTypeMeta.comment;
                const Icon = meta.icon;
                return (
                  <div key={i} className={`rounded-lg border ${meta.border} ${meta.bg} p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      <span className="text-sm font-medium text-foreground">{c.author}</span>
                      <span className={`text-[10px] font-semibold uppercase ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{moment(c.date).format("DD/MM/YY HH:mm")}</span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{c.content}</p>
                  </div>
                );
              })}
              {(!request.comments || request.comments.length === 0) && (
                <p className="text-sm text-muted-foreground italic">No comments yet.</p>
              )}
            </div>

            {/* Add comment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">💬 Comment</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="answer">✅ Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={`Add a ${commentType}...`}
                rows={2}
              />
              <Button onClick={addComment} disabled={posting || !commentText.trim()} size="sm" className="bg-primary text-black font-heading">
                {posting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                Post {commentType}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-card rounded-b-xl">
          <Button variant="outline" onClick={onEdit} className="flex-1">
            <Edit3 className="w-4 h-4 mr-2" /> Amend / Edit
          </Button>
          <Button onClick={onClose} className="flex-1 bg-primary text-black font-heading">Close</Button>
        </div>
      </div>
    </div>
  );
}