import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Edit3, Send, FileText, ImageIcon, CheckCircle2, HelpCircle, MessageCircle, Loader2 } from "lucide-react";
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
  const [statusChange, setStatusChange] = useState(false);

  const addComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    const newComment = {
      author: user?.full_name || user?.email || "Unknown",
      author_id: user?.id,
      date: new Date().toISOString(),
      type: commentType,
      content: commentText.trim(),
    };
    const updatedComments = [...(request.comments || []), newComment];
    await base44.entities.DevRequest.update(request.id, { comments: updatedComments });
    setCommentText("");
    setPosting(false);
    onUpdated({ ...request, comments: updatedComments });
  };

  const changeStatus = async (newStatus) => {
    await base44.entities.DevRequest.update(request.id, { status: newStatus });
    setStatusChange(false);
    onUpdated({ ...request, status: newStatus });
  };

  const commentTypeMeta = {
    comment: { label: "Comment", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    question: { label: "Question", icon: HelpCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    answer: { label: "Answer", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
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

          {/* Attachments */}
          {request.attachments?.length > 0 && (
            <div>
              <p className="text-xs text-primary font-heading uppercase tracking-widest mb-2 pb-1 border-b border-border">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {request.attachments.map((att, i) => (
                  att.file_type === "image" ? (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                      <img src={att.url} alt={att.name} className="w-24 h-24 object-cover rounded-lg border border-border hover:border-primary transition-colors" />
                    </a>
                  ) : (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-secondary rounded-lg border border-border px-3 py-2 hover:border-primary transition-colors">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-foreground">{att.name}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                      isActive ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments / Questions / Answers */}
          <div>
            <p className="text-xs text-primary font-heading uppercase tracking-widest mb-3 pb-1 border-b border-border">
              Discussion ({(request.comments || []).length})
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