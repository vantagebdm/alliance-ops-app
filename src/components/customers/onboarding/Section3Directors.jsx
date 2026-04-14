import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import FieldLabel from "./FieldLabel";

const emptyDirector = () => ({
  full_name: "", dob: "", address_1: "", address_2: "",
  state: "", postcode: "", licence_number: "", phone: "", mobile: ""
});

export default function Section3Directors({ form, update, extracted = {} }) {
  const [collapsed, setCollapsed] = useState({});
  const directors = form.directors || [emptyDirector(), emptyDirector()];

  const setDirectors = (d) => update("directors", d);

  const updateDirector = (i, k, v) => {
    const updated = directors.map((d, idx) => idx === i ? { ...d, [k]: v } : d);
    setDirectors(updated);
  };

  const addDirector = () => setDirectors([...directors, emptyDirector()]);
  const removeDirector = (i) => setDirectors(directors.filter((_, idx) => idx !== i));
  const toggleCollapse = (i) => setCollapsed(c => ({ ...c, [i]: !c[i] }));

  const extractedDir = (i, key) => extracted[`director_${i}_${key}`];

  return (
    <div>
      <SectionHeader number="3" title="Directors / Owners / Trustee Details" />
      <div className="space-y-3">
        {directors.map((d, i) => (
          <div key={i} className="border border-border rounded-sm overflow-hidden">
            <div
              className="bg-muted/40 px-3 py-2 flex items-center justify-between cursor-pointer"
              onClick={() => toggleCollapse(i)}
            >
              <span className="font-heading text-xs uppercase tracking-wider text-foreground/70">
                {i === 0 ? "Director / Owner / Trustee 1" : i === 1 ? "Director / Owner / Trustee 2" : `Director / Owner / Trustee ${i + 1}`}
                {d.full_name && <span className="ml-2 text-foreground font-semibold">— {d.full_name}</span>}
              </span>
              <div className="flex items-center gap-2">
                {i > 1 && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeDirector(i); }} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {collapsed[i] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            {!collapsed[i] && (
              <div className="p-3 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FieldLabel extracted={extractedDir(i, "full_name")}>Full Name</FieldLabel>
                  <Input value={d.full_name} onChange={e => updateDirector(i, "full_name", e.target.value)} className={`rounded-sm ${extractedDir(i, "full_name") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
                <div>
                  <FieldLabel extracted={extractedDir(i, "dob")}>Date of Birth</FieldLabel>
                  <Input type="date" value={d.dob} onChange={e => updateDirector(i, "dob", e.target.value)} className={`rounded-sm ${extractedDir(i, "dob") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
                <div>
                  <FieldLabel extracted={extractedDir(i, "licence_number")}>Driver's Licence Number</FieldLabel>
                  <Input value={d.licence_number} onChange={e => updateDirector(i, "licence_number", e.target.value)} className={`rounded-sm font-mono ${extractedDir(i, "licence_number") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
                <div className="col-span-2">
                  <FieldLabel extracted={extractedDir(i, "address_1")}>Private Address Line 1</FieldLabel>
                  <Input value={d.address_1} onChange={e => updateDirector(i, "address_1", e.target.value)} className={`rounded-sm ${extractedDir(i, "address_1") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Private Address Line 2</FieldLabel>
                  <Input value={d.address_2} onChange={e => updateDirector(i, "address_2", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel extracted={extractedDir(i, "state")}>State</FieldLabel>
                  <Input value={d.state} onChange={e => updateDirector(i, "state", e.target.value)} className={`rounded-sm ${extractedDir(i, "state") ? "ring-1 ring-primary/40" : ""}`} placeholder="e.g. WA" />
                </div>
                <div>
                  <FieldLabel extracted={extractedDir(i, "postcode")}>Postcode</FieldLabel>
                  <Input value={d.postcode} onChange={e => updateDirector(i, "postcode", e.target.value)} className={`rounded-sm ${extractedDir(i, "postcode") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
                <div>
                  <FieldLabel extracted={extractedDir(i, "phone")}>Phone Number</FieldLabel>
                  <Input value={d.phone} onChange={e => updateDirector(i, "phone", e.target.value)} className={`rounded-sm ${extractedDir(i, "phone") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
                <div>
                  <FieldLabel extracted={extractedDir(i, "mobile")}>Mobile Number</FieldLabel>
                  <Input value={d.mobile} onChange={e => updateDirector(i, "mobile", e.target.value)} className={`rounded-sm ${extractedDir(i, "mobile") ? "ring-1 ring-primary/40" : ""}`} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addDirector} className="mt-3 rounded-sm font-heading text-xs uppercase tracking-wider">
        <Plus className="w-3 h-3 mr-1" /> Add Another Director / Owner / Trustee
      </Button>
    </div>
  );
}