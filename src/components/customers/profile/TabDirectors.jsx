import { User } from "lucide-react";
import { SectionTitle } from "./ProfileField";

function DirectorCard({ director, index }) {
  const hasData = director.full_name || director.dob || director.address_1;
  if (!hasData) return null;
  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <div className="bg-muted/20 px-4 py-2 border-b border-border flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
          Director / Owner {index + 1}
        </span>
        {director.full_name && <span className="text-sm font-semibold text-foreground ml-1">{director.full_name}</span>}
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        {director.full_name && (
          <div>
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</p>
            <p className="text-sm">{director.full_name}</p>
          </div>
        )}
        {director.dob && (
          <div>
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Date of Birth</p>
            <p className="text-sm">{director.dob}</p>
          </div>
        )}
        {director.licence_number && (
          <div>
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Driver's Licence</p>
            <p className="text-sm font-mono">{director.licence_number}</p>
          </div>
        )}
        {director.phone && (
          <div>
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Phone</p>
            <p className="text-sm">{director.phone}</p>
          </div>
        )}
        {director.mobile && (
          <div>
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Mobile</p>
            <p className="text-sm">{director.mobile}</p>
          </div>
        )}
        {director.address_1 && (
          <div className="col-span-2">
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Private Address</p>
            <p className="text-sm">{[director.address_1, director.address_2, director.state, director.postcode].filter(Boolean).join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TabDirectors({ customer }) {
  const directors = (customer.directors || []).filter(d => d.full_name || d.dob || d.address_1);

  return (
    <div className="space-y-4">
      <SectionTitle>Directors / Owners / Trustees</SectionTitle>
      {directors.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-8 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
          No directors or owners recorded
        </div>
      ) : (
        directors.map((d, i) => <DirectorCard key={i} director={d} index={i} />)
      )}
    </div>
  );
}