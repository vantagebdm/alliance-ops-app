import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload, X, Lock, CheckCircle2, Loader2, Download, Printer, ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';

const URGENCY_LEVELS = [
  { value: 'normal', label: '🟢  Normal' },
  { value: 'urgent', label: '🟡  Urgent' },
  { value: 'breakdown', label: '🔴  Breakdown / Emergency' },
];
const ASSET_TYPES = [
  'Light Vehicle', 'Light Truck', 'Heavy Truck', 'Semi-Trailer', 'Trailer',
  'Earthmoving', 'Plant Equipment', 'Fixed Plant', 'Generator', 'Agricultural', 'Marine', 'Other'
];
const CORRECT_PIN = '098098';
const newLine = () => ({ id: Date.now() + Math.random(), qty: '1', part_number: '', description: '' });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 md:p-6">
      <h2 className="text-xs font-heading font-bold tracking-widest text-primary mb-5 uppercase border-b border-border pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children, error, colSpan }) {
  return (
    <div className={colSpan}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── PIN Gate ─────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (pin === CORRECT_PIN) { onUnlock(); }
    else { setError('Incorrect PIN. Please try again.'); setPin(''); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">PARTS QUOTE REQUEST</h1>
          <p className="text-muted-foreground text-sm mt-1">Alliance Priority Parts</p>
          <p className="text-muted-foreground text-xs mt-1">Enter your access PIN to continue</p>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="• • • • • •"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="text-center text-2xl tracking-[0.5em] h-12"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button onClick={submit} className="w-full h-11 text-base font-heading">
            ACCESS QUOTE FORM
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Quote Confirmation ───────────────────────────────────────────────────────
function QuoteConfirmation({ quote }) {
  const urgencyLabel = { normal: 'Normal', urgent: 'Urgent', breakdown: 'Breakdown / Emergency' };
  const urgencyColor = { normal: 'text-green-400', urgent: 'text-amber-400', breakdown: 'text-red-400' };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pw, 40, 'F');
    doc.setFillColor(30, 185, 84);
    doc.rect(0, 40, pw, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTS QUOTE REQUEST', 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text('Alliance Priority Parts  |  Quote Request Portal', 14, 26);
    doc.text('Request submitted online — retain for your records', 14, 33);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 220, 120);
    doc.setFontSize(13);
    doc.text(quote.quote_number, pw - 14, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    const dateStr = new Date(quote.submitted_at).toLocaleString('en-AU', { timeZone: 'Australia/Perth' });
    doc.text(dateStr, pw - 14, 28, { align: 'right' });

    let y = 52;

    const sectionTitle = (title) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 160, 80);
      doc.text(title, 14, y);
      y += 3;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, y, pw - 14, y);
      y += 6;
    };

    const row = (label, value) => {
      if (!value) return;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(110, 110, 110);
      doc.text(label, 14, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), 72, y);
      y += 7;
    };

    sectionTitle('REQUEST DETAILS');
    row('Submitted By', quote.name);
    row('Company', quote.company);
    row('Phone', quote.phone);
    row('Email', quote.email);
    row('Job Number', quote.job_number);
    row('PO / Invoice No.', quote.po_inv_number);
    row('Urgency', urgencyLabel[quote.urgency] || quote.urgency);

    y += 4;
    sectionTitle('ASSET DETAILS');
    row('Asset Type', quote.asset_type);
    row('Fleet / Asset No.', quote.fleet_number);
    row('Registration (Rego)', quote.rego);
    row('VIN / Serial Number', quote.vin_serial);
    row('Make', quote.make);
    row('Model', quote.model);
    row('Client / Owner', quote.client_owner);

    y += 4;
    sectionTitle('PARTS REQUESTED');

    doc.setFillColor(240, 240, 240);
    doc.rect(14, y - 4, pw - 28, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('QTY', 16, y);
    doc.text('PART NUMBER', 35, y);
    doc.text('DESCRIPTION', 85, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    (quote.lines || []).forEach((line, i) => {
      if (y > 265) { doc.addPage(); y = 20; }
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, pw - 28, 7, 'F');
      }
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8.5);
      doc.text(String(line.qty || 1), 16, y);
      doc.text(line.part_number || '—', 35, y);
      const desc = doc.splitTextToSize(line.description || '', 108);
      doc.text(desc[0] || '', 85, y);
      y += 7;
    });

    y += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    const ackText = 'The requester acknowledged that all part descriptions, quantities and details provided are accurate and complete.';
    const ackLines = doc.splitTextToSize(ackText, pw - 28);
    doc.text(ackLines, 14, y);

    doc.setFillColor(20, 20, 20);
    doc.rect(0, ph - 14, pw, 14, 'F');
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Alliance Priority Parts  |  Quote Request Portal', pw / 2, ph - 5, { align: 'center' });

    doc.save(`QuoteRequest-${quote.quote_number}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-11 h-11 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">QUOTE REQUEST SUBMITTED!</h1>
          <p className="text-muted-foreground text-sm mt-1">Your parts quote request has been received by Alliance Priority Parts</p>
          <div className="inline-block mt-3 px-5 py-2.5 bg-primary/10 rounded-xl border border-primary/30">
            <p className="text-primary text-2xl font-heading font-bold">{quote.quote_number}</p>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            {new Date(quote.submitted_at).toLocaleString('en-AU', { timeZone: 'Australia/Perth', dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: 'Submitted By', value: quote.name },
              { label: 'Company', value: quote.company },
              { label: 'Phone', value: quote.phone },
              { label: 'Email', value: quote.email },
              { label: 'Job Number', value: quote.job_number },
              { label: 'PO / Invoice No.', value: quote.po_inv_number },
              { label: 'Urgency', value: urgencyLabel[quote.urgency], extra: urgencyColor[quote.urgency] },
              { label: 'Asset Type', value: quote.asset_type },
              { label: 'Fleet / Asset No.', value: quote.fleet_number },
              { label: 'Rego', value: quote.rego },
              { label: 'VIN / Serial', value: quote.vin_serial },
              { label: 'Make', value: quote.make },
              { label: 'Model', value: quote.model },
              { label: 'Client / Owner', value: quote.client_owner, span: true },
            ].filter(f => f.value).map((f, i) => (
              <div key={i} className={f.span ? 'col-span-2 md:col-span-3' : ''}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</p>
                <p className={`text-sm font-medium mt-0.5 ${f.extra || 'text-foreground'}`}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Parts */}
          <div>
            <p className="text-xs text-primary font-heading uppercase tracking-widest mb-3 pb-2 border-b border-border">Parts Requested</p>
            <div className="space-y-0">
              {(quote.lines || []).map((line, i) => (
                <div key={i} className="flex gap-3 text-sm py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground w-10 shrink-0 font-mono">×{line.qty || 1}</span>
                  {line.part_number && (
                    <span className="text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded shrink-0 self-start">
                      {line.part_number}
                    </span>
                  )}
                  <span className="text-foreground">{line.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          {quote.image_urls?.length > 0 && (
            <div>
              <p className="text-xs text-primary font-heading uppercase tracking-widest mb-3 pb-2 border-b border-border">Reference Images</p>
              <div className="flex flex-wrap gap-2">
                {quote.image_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Ref ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-border hover:border-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 h-11">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="flex-1 h-11">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Please save or print this confirmation. Your quote request is now live in the Alliance Priority Parts system.
        </p>
      </div>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function PartsQuoteRequest() {
  const [unlocked, setUnlocked] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    job_number: '',
    po_inv_number: '',
    urgency: 'normal',
    asset_type: '',
    fleet_number: '',
    rego: '',
    vin_serial: '',
    make: '',
    model: '',
    client_owner: '',
  });

  const [lines, setLines] = useState([newLine()]);
  const [images, setImages] = useState([]);
  const [acknowledged, setAcknowledged] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateLine = (id, field, val) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  const addLine = () => setLines(prev => [...prev, newLine()]);
  const removeLine = (id) => setLines(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(result.file_url);
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.phone.trim() && !form.email.trim()) errs.phone = 'Phone or email required';
    if (lines.every(l => !l.description.trim())) errs.lines = 'At least one part description is required';
    if (!acknowledged) errs.acknowledged = 'You must acknowledge parts accuracy before submitting';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    const result = await base44.functions.invoke('createQuoteRequest', {
      ...form,
      lines: lines.filter(l => l.description.trim()),
      image_urls: images,
      acknowledged,
    });
    setSubmitted(result.data);
    setSubmitting(false);
  };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  if (submitted) return <QuoteConfirmation quote={submitted} />;

  const submittedAt = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Perth', dateStyle: 'full', timeStyle: 'short'
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">PARTS QUOTE REQUEST</h1>
          <p className="text-muted-foreground mt-1">Alliance Priority Parts</p>
          <p className="text-muted-foreground text-xs mt-1">{submittedAt}</p>
        </div>

        <div className="space-y-5">
          {/* Contact Details */}
          <Section title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your Name" required error={errors.name}>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Company">
                <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company name" />
              </Field>
              <Field label="Phone" required error={errors.phone}>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Contact phone" />
              </Field>
              <Field label="Email">
                <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="Contact email" />
              </Field>
              <Field label="Job Number">
                <Input value={form.job_number} onChange={e => set('job_number', e.target.value)} placeholder="e.g. JOB-2024-001" />
              </Field>
              <Field label="PO / Invoice Number">
                <Input value={form.po_inv_number} onChange={e => set('po_inv_number', e.target.value)} placeholder="e.g. PO-00123" />
              </Field>
              <Field label="Urgency Level" required>
                <Select value={form.urgency} onValueChange={v => set('urgency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* Asset Details */}
          <Section title="Asset Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Asset Type">
                <Select value={form.asset_type} onValueChange={v => set('asset_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Asset / Fleet Number">
                <Input value={form.fleet_number} onChange={e => set('fleet_number', e.target.value)} placeholder="e.g. FL-123" />
              </Field>
              <Field label="Make">
                <Input value={form.make} onChange={e => set('make', e.target.value)} placeholder="e.g. Caterpillar" />
              </Field>
              <Field label="Model">
                <Input value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. 320D" />
              </Field>
              <Field label="Registration (Rego)">
                <Input value={form.rego} onChange={e => set('rego', e.target.value)} placeholder="e.g. 1ABC234" />
              </Field>
              <Field label="VIN / Serial Number">
                <Input value={form.vin_serial} onChange={e => set('vin_serial', e.target.value)} placeholder="e.g. 1HGBH41JXMN109186" />
              </Field>
              <Field label="Client / Owner" colSpan="sm:col-span-2">
                <Input value={form.client_owner} onChange={e => set('client_owner', e.target.value)} placeholder="e.g. ABC Mining Pty Ltd" />
              </Field>
            </div>
          </Section>

          {/* Parts */}
          <Section title="Parts Required">
            {errors.lines && <p className="text-red-400 text-xs mb-3">{errors.lines}</p>}
            <div className="space-y-2">
              <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs text-muted-foreground uppercase tracking-wider pb-1 border-b border-border">
                <span className="col-span-1">Qty</span>
                <span className="col-span-3">Part No.</span>
                <span className="col-span-7">Description</span>
                <span className="col-span-1"></span>
              </div>

              {lines.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 sm:col-span-1">
                    <Input
                      value={line.qty}
                      onChange={e => updateLine(line.id, 'qty', e.target.value)}
                      placeholder="Qty"
                      className="text-center"
                    />
                  </div>
                  <div className="col-span-9 sm:col-span-3">
                    <Input
                      value={line.part_number}
                      onChange={e => updateLine(line.id, 'part_number', e.target.value)}
                      placeholder="P/N (if applicable)"
                    />
                  </div>
                  <div className="col-span-11 sm:col-span-7">
                    <Input
                      value={line.description}
                      onChange={e => updateLine(line.id, 'description', e.target.value)}
                      placeholder="Description of part required *"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="text-muted-foreground hover:text-red-400 h-8 w-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addLine} className="mt-1">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Line
              </Button>
            </div>
          </Section>

          {/* Images */}
          <Section title="Reference Images (Optional)">
            <div className="space-y-3">
              <label className={`flex items-center gap-3 cursor-pointer border border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm text-foreground">
                    {uploading ? 'Uploading images...' : 'Click to upload reference images'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Photos of part, part numbers, damage, etc.</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Upload ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-border" />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && !uploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                  <span>No images uploaded</span>
                </div>
              )}
            </div>
          </Section>

          {/* Acknowledgement */}
          <Section title="Acknowledgement">
            <div className="flex items-start gap-3">
              <Checkbox
                id="ack"
                checked={acknowledged}
                onCheckedChange={setAcknowledged}
                className="mt-0.5 shrink-0"
              />
              <label htmlFor="ack" className="text-sm text-foreground leading-relaxed cursor-pointer">
                I confirm that all part descriptions, quantities, part numbers and asset details provided in this quote request are accurate and complete to the best of my knowledge. I understand that requests with incorrect information may result in delays, incorrect parts being quoted, and additional costs.
              </label>
            </div>
            {errors.acknowledged && <p className="text-red-400 text-xs mt-2 ml-7">{errors.acknowledged}</p>}
          </Section>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="w-full h-13 text-base font-heading tracking-wider"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting Quote Request...</>
            ) : (
              'SUBMIT QUOTE REQUEST'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pb-4">
            By submitting you agree that parts details are accurate. A confirmation with your quote request number will be provided.
          </p>
        </div>
      </div>
    </div>
  );
}