import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_TEMPLATE = {
  version: "1.0",
  company_name: "Alliance Priority Parts Pty. Ltd.",
  company_abn: "33 697 061 279",
  company_acn: "697 061 279",
  company_address: "3873 Pemberton Way, Karratha Industrial Estate WA 6714",
  company_state: "Western Australia",
  company_postcode: "6714",
  company_phone: "",
  company_email: "accounts@alliancepriorityparts.com.au",
  company_web: "www.alliancepriorityparts.com.au",
  logo_url: "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png",
  declaration_text: `I certify that the above information is true and correct and that I am authorised to make this application for credit. I have read and understand the TERMS AND CONDITIONS OF TRADE (overleaf or attached) of Alliance Priority Parts Pty. Ltd. which form part of, and are intended to be read in conjunction with this Credit Account Application and agree to be bound by these conditions. I authorise the use of my personal information as detailed in the Privacy Act clause therein.`,
  guarantee_intro_text: `IN CONSIDERATION of Alliance Priority Parts Pty. Ltd. and its successors and assigns ("Alliance Priority Parts") at the request of the Guarantor (as is now acknowledged) supplying and continuing to supply goods and/or services to`,
  guarantee_clauses: `1. GUARANTEE the due and punctual payment to Alliance Priority Parts of all monies which are now owing to Alliance Priority Parts by the Customer and all further sums of money from time to time owing to Alliance Priority Parts by the Customer in respect of goods and services supplied or to be supplied by Alliance Priority Parts to the Customer or any other liability of the Customer to Alliance Priority Parts, and the due observance and performance by the Customer of all its obligations contained or implied in any contract or agreement with Alliance Priority Parts, including but not limited to the Terms & Conditions of Trade signed by the Customer and annexed to this Guarantee and Indemnity. If for any reason the Customer does not pay any amount owing to Alliance Priority Parts the Guarantor will immediately on demand pay the relevant amount to Alliance Priority Parts. In consideration of Alliance Priority Parts agreeing to supply the goods and/or services to the Customer, the Guarantor charges all of its right, title and interest (joint or several) in any land, realty or other assets capable of being charged, owned by the Guarantor now or in the future, to secure the performance by the Guarantor of its obligations under this Guarantee and Indemnity (including, but not limited to, the payment of any money) and the Guarantor acknowledges that this personal guarantee and indemnity constitutes a security agreement for the purposes of the Personal Property Securities Act 2009 ("PPSA") and unequivocally consents to Alliance Priority Parts registering any interest so charged. Furthermore, it is agreed by both parties that where the Guarantor is acting in the capacity as a trustee for a trust, then the Guarantor agrees to charge all its right title and interest in any land realty, or other assets capable of being charged in its own capacity and in its capacity as trustee and shall be subject to the PPSA Registration as stated above. The Guarantor irrevocably appoints Alliance Priority Parts and each director of Alliance Priority Parts as the Guarantor's true and lawful attorney/s to perform all necessary acts to give effect to this clause including, but not limited to, signing any document on the Guarantor's behalf which Alliance Priority Parts may reasonably require to register a financing statement or financing change statement in relation to a security interest on the Personal Property Securities Register, register any other document required to be registered by the PPSA or any other law, or correct a defect in such statement.

2. HOLD HARMLESS AND INDEMNIFY Alliance Priority Parts on demand as a separate obligation against any liability (including but not limited to damages, costs, losses and legal fees calculated on a solicitor and own client basis) incurred by, or assessed against, Alliance Priority Parts in connection with: (a) the supply of goods and/or services to the Customer; or (b) the recovery of monies owing to Alliance Priority Parts by the Customer including the enforcement of this Guarantee and Indemnity; or (c) monies paid by Alliance Priority Parts with the Customer's consent in settlement of a dispute.

I/WE FURTHER ACKNOWLEDGE AND AGREE THAT

3. I/We have received, read and understood Alliance Priority Parts' Terms and Conditions prior to entering into this Guarantee and Indemnity and agree to be bound by those Terms and Conditions.

4. This Guarantee and Indemnity shall constitute an unconditional and continuing Guarantee and Indemnity and accordingly shall be irrevocable and remain in full force and effect until all monies owing to Alliance Priority Parts by the Customer and all obligations herein have been fully paid satisfied and performed.

5. No granting of credit, extension of further credit, or granting of time and no waiver, indulgence or neglect to sue on Alliance Priority Parts' part and no failure by any named Guarantor to properly execute this Guarantee and Indemnity shall impair or limit the liability under this Guarantee and Indemnity of any Guarantor. Without affecting the Customer's obligations to Alliance Priority Parts, each Guarantor shall be a principal debtor and liable to Alliance Priority Parts accordingly.

6. The liability under this Guarantee and Indemnity shall not be discharged, abrogated, prejudiced or affected by: (a) any alteration, modification, variation or addition to any contract or agreement in respect of the supply of goods and/or services; (b) the liquidation, receivership, administration, bankruptcy, dissolution, compromise or scheme of arrangement in respect of the Customer; (c) any other act, omission or event which, but for this provision, might operate to discharge, impair or otherwise affect any obligations under this Guarantee and Indemnity.

7. The term "Guarantor" whenever used in this Guarantee and Indemnity shall, if there is more than one person named as Guarantor, mean and refer to each of them individually and all of them together and the obligations and agreements on the part of the Guarantor shall bind them jointly and severally.

8. I/We have been advised to obtain independent legal advice before executing this Guarantee and Indemnity. I/we understand that I/we am/are liable for all amounts owing (both now and in the future) by the Customer to Alliance Priority Parts.

9. I/we irrevocably authorise Alliance Priority Parts to obtain from any person or company any information which Alliance Priority Parts may require for credit reference purposes. I/We further irrevocably authorise Alliance Priority Parts to provide to any third party, in response to credit references and enquiries about me/us or by way of information exchange with credit reference agencies, details of this Guarantee and Indemnity and any subsequent dealings.

10. The above information is to be used by Alliance Priority Parts for all purposes in connection with Alliance Priority Parts considering this Guarantee and Indemnity and the subsequent enforcement of the same.`,
  terms_definitions: `1.1 "Confidential Information" means information of a confidential nature whether oral, written or in electronic form including, but not limited to, this Contract, either party's intellectual property, operational information, know-how, trade secrets, financial and commercial affairs, contracts, Customer information (including but not limited to, "Personal Information" such as: name, address, D.O.B, occupation, driver's licence details, electronic contact details, previous credit applications, credit history) and pricing details.
1.2 "Consumer" means a Consumer as defined for the purposes of the Competition and Consumer Act 2010.
1.3 "Contract" means the terms and conditions contained herein, together with any quotation, order, invoice or other document or amendments expressed to be supplemental to this Contract.
1.4 "Customer" means the person/s, entities or any person acting on behalf of and with the authority of the Customer requesting Alliance Priority Parts to provide the Goods as specified in any proposal, quotation, order, invoice, or other documentation.
1.5 "Goods" means all Goods or Services supplied by Alliance Priority Parts to the Customer at the Customer's request from time to time.
1.6 "GST" means Goods and Services Tax as defined within the "A New Tax System (Goods and Services Tax) Act 1999" (Cth).
1.7 "Price" means the Price payable (plus any GST where applicable) for the Goods as agreed between Alliance Priority Parts and the Customer.
1.8 "Alliance Priority Parts" means Alliance Priority Parts Pty. Ltd. ABN 33 697 061 279, its successors and assigns or any person acting on behalf of and with the authority of Alliance Priority Parts Pty. Ltd.`,
  terms_acceptance: `2.1 The Customer is taken to have exclusively accepted and is immediately bound, jointly and severally, by these terms and conditions if the Customer places an order for or accepts delivery of the Goods.
2.2 In the event of any inconsistency between the terms and conditions of this Contract and any other prior document or schedule that the parties have entered into, the terms of this Contract shall prevail.
2.3 The Customer acknowledges that the supply of Goods on credit shall not take effect until the Customer has completed a credit application with Alliance Priority Parts and it has been approved with a credit limit established for the account.
2.4 In the event that the supply of Goods requested exceeds the Customer's credit limit and/or the account exceeds the payment terms, Alliance Priority Parts reserves the right to refuse delivery.
2.5 The Customer acknowledges and accepts that the supply of Goods for accepted orders may be subject to availability and if, for any reason, Goods are not or cease to be available, Alliance Priority Parts reserves the right to vary the Price with alternative Goods.
2.6 Any advice, recommendation, information, assistance, or service provided by Alliance Priority Parts in relation to Goods supplied is given in good faith and shall be accepted without liability on the part of Alliance Priority Parts.
2.7 Electronic signatures shall be deemed to be accepted by either party providing that the parties have complied with the Electronic Transactions Act 2000 or any other applicable provisions.`,
  terms_errors_omissions: `3.1 The Customer acknowledges and accepts that Alliance Priority Parts shall, without prejudice, accept no liability in respect of any alleged or actual error(s) and/or omission(s): (a) resulting from an inadvertent mistake made by Alliance Priority Parts in the formation and/or administration of this Contract; and/or (b) contained in/omitted from any literature supplied by Alliance Priority Parts in respect of the Goods.
3.2 In the event such an error and/or omission occurs and is not attributable to the negligence and/or wilful misconduct of Alliance Priority Parts, the Customer shall not be entitled to treat this Contract as repudiated nor render it invalid.
3.3 The Customer is responsible for supplying correct order information. The Customer must pay for all Goods it orders from Alliance Priority Parts notwithstanding any Customer Error. Alliance Priority Parts is entitled, at its absolute discretion, to waive its right under this sub-clause in relation to Customer Errors.`,
  terms_price_payment: `6.1 At Alliance Priority Parts' sole discretion, the Price shall be either: (a) as indicated on any invoice provided by Alliance Priority Parts to the Customer; or (b) Alliance Priority Parts' quoted price which will be valid for the period stated in the quotation or otherwise for a period of thirty (30) days.
6.2 Alliance Priority Parts reserves the right to change the Price if a variation from the specifications is requested and will be detailed in writing and shown as variations on Alliance Priority Parts' invoice.
6.3 At Alliance Priority Parts' sole discretion, a deposit may be required.
6.4 Time for payment for the Goods being of the essence, the Price will be payable by the Customer on the date/s determined by Alliance Priority Parts, which may be: (a) on delivery of the Goods; (b) thirty (30) days following the end of the month in which a statement is posted to the Customer's address; (c) the date specified on any invoice; or (d) failing any notice to the contrary, the date which is seven (7) days following the date of any invoice.
6.5 Payment may be made by cash, electronic/on-line banking, credit card (a surcharge may apply), or by any other method as agreed.
6.6 Alliance Priority Parts may in its discretion allocate any payment received from the Customer towards any invoice that Alliance Priority Parts determines.
6.7 The Customer shall not be entitled to set off against, or deduct from the Price, any sums owed or claimed to be owed to the Customer by Alliance Priority Parts. If any part of an invoice is in dispute, the Customer must notify Alliance Priority Parts in writing within three (3) business days.
6.8 Unless otherwise stated the Price does not include GST. The Customer must pay GST at the same time and on the same basis as the Customer pays the Price.`,
  terms_delivery: `7.1 Delivery of the Goods is taken to occur at the time that: (a) the Customer or the Customer's nominated carrier takes possession of the Goods at Alliance Priority Parts' address; or (b) Alliance Priority Parts (or Alliance Priority Parts' nominated carrier) delivers the Goods to the Customer's nominated address.
7.2 At Alliance Priority Parts' sole discretion, the cost of Delivery is included in the Price.
7.3 Alliance Priority Parts may deliver the Goods in separate instalments.
7.4 The Customer must take Delivery by receipt or collection of the Goods whenever they are tendered for Delivery.
7.5 Any time specified by Alliance Priority Parts for Delivery of the Goods is an estimate only and Alliance Priority Parts will not be liable for any loss or damage incurred by the Customer because of Delivery being late.
7.6 Where an item may be temporarily out of stock, Alliance Priority Parts shall advise the Customer within one (1) working day and may offer a back order or substitute product.`,
  terms_risk: `8.1 Risk of damage to or loss of the Goods passes to the Customer on Delivery and the Customer must insure the Goods on or before Delivery.
8.2 If any of the Goods are damaged or destroyed following Delivery but prior to ownership passing to the Customer, Alliance Priority Parts is entitled to receive all insurance proceeds payable for the Goods.
8.3 If the Customer requests Alliance Priority Parts to leave Goods outside Alliance Priority Parts' premises for collection or to deliver the Goods to an unattended location, then such Goods shall be left at the Customer's sole risk.
8.4 Alliance Priority Parts reserves the right to cease supply of Goods immediately to the Customer in the event that Alliance Priority Parts becomes aware that the Customer is on-selling the Goods supplied in direct competition with Alliance Priority Parts' prospective customers.`,
  terms_title: `11.1 Alliance Priority Parts and the Customer agree that ownership of the Goods shall not pass until: (a) the Customer has paid Alliance Priority Parts all amounts owing; and (b) the Customer has met all of its other obligations to Alliance Priority Parts.
11.2 Receipt by Alliance Priority Parts of any form of payment other than cash shall not be deemed to be payment until that form of payment has been honoured, cleared or recognised.
11.3 Until ownership of the Goods passes to the Customer: (a) the Customer is only a bailee of the Goods and must return the Goods to Alliance Priority Parts on request; (b) the Customer must not sell, dispose, or otherwise part with possession of the Goods other than in the ordinary course of business; (c) the Customer irrevocably authorises Alliance Priority Parts to enter any premises where Alliance Priority Parts believes the Goods are kept and recover possession of the Goods; (d) Alliance Priority Parts may recover possession of any Goods in transit whether or not Delivery has occurred.`,
  terms_ppsa: `12.1 In this clause financing statement, financing change statement, security agreement, and security interest has the meaning given to it by the PPSA.
12.2 Upon assenting to these terms and conditions in writing the Customer acknowledges and agrees that these terms and conditions constitute a security agreement for the purposes of the PPSA and creates a security interest in all Goods that have previously been supplied and that will be supplied in the future by Alliance Priority Parts to the Customer, and the proceeds from such Goods.
12.3 The Customer undertakes to: (a) promptly sign any further documents and/or provide any further information which Alliance Priority Parts may reasonably require to register a financing statement or financing change statement; (b) indemnify, and upon demand reimburse, Alliance Priority Parts for all expenses incurred in registering a financing statement on the PPSA register; (c) not register a financing change statement in respect of a security interest without the prior written consent of Alliance Priority Parts.
12.4 Alliance Priority Parts and the Customer agree that sections 96, 115 and 125 of the PPSA do not apply to the security agreement created by these terms and conditions.
12.5 The Customer waives their rights to receive notices under sections 95, 118, 121(4), 130, 132(3)(d) and 132(4) of the PPSA.
12.6 The Customer waives their rights as a grantor and/or a debtor under sections 142 and 143 of the PPSA.
12.7 Unless otherwise agreed to in writing by Alliance Priority Parts, the Customer waives their right to receive a verification statement in accordance with section 157 of the PPSA.`,
  terms_security_charge: `13.1 In consideration of Alliance Priority Parts agreeing to supply the Goods, the Customer charges all of its rights, title and interest in any land, realty or other assets capable of being charged, owned by the Customer either now or in the future, to secure the performance by the Customer of its obligations under these terms and conditions.
13.2 The Customer indemnifies Alliance Priority Parts from and against all Alliance Priority Parts' costs and disbursements including legal costs on a solicitor and own Customer basis incurred in exercising Alliance Priority Parts' rights under this clause.
13.3 The Customer irrevocably appoints Alliance Priority Parts and each director of Alliance Priority Parts as the Customer's true and lawful attorney/s to perform all necessary acts to give effect to the provisions of this clause.`,
  terms_defects_warranties: `14.1 The Customer must inspect the Goods on Delivery and must within seven (7) days of Delivery notify Alliance Priority Parts in writing of any evident defect/damage, shortage in quantity, or failure to comply with the description or quote.
14.2 Under applicable State, Territory and Commonwealth Law (including, without limitation the CCA), certain statutory implied guarantees and warranties may be implied into these terms and conditions (Non-Excluded Guarantees).
14.3 Alliance Priority Parts acknowledges that nothing in these terms and conditions purports to modify or exclude the Non-Excluded Guarantees.
14.4 Except as expressly set out in these terms and conditions or in respect of the Non-Excluded Guarantees, Alliance Priority Parts makes no warranties or other representations under these terms and conditions including but not limited to the quality or suitability of the Goods.
14.8 Returns will only be accepted provided that: (a) the Customer has complied with the provisions of clause 14.1; (b) Alliance Priority Parts has agreed that the Goods are defective; (c) the Goods are returned within a reasonable time at the Customer's cost; and (d) the Goods are returned in as close a condition to that in which they were delivered as is possible.
14.11 Alliance Priority Parts may in its absolute discretion accept non-defective Goods for return in which case Alliance Priority Parts may require the Customer to pay handling fees of up to twenty percent (20%) of the value of the returned Goods plus any freight costs.`,
  terms_default: `16.1 Interest on overdue invoices shall accrue daily from the date when payment becomes due, until the date of payment, at a rate of two and a half percent (2.5%) per calendar month (and at Alliance Priority Parts' sole discretion such interest shall compound monthly at such a rate) after as well as before any judgment.
16.2 If the Customer owes Alliance Priority Parts any money, the Customer shall indemnify Alliance Priority Parts from and against all costs and disbursements including legal costs on a solicitor and own Customer basis, internal administration fees, and Alliance Priority Parts' contract fees owing for breach of these terms and conditions, including contract default fees and/or recovery costs.
16.4 Without prejudice to Alliance Priority Parts' other remedies at law, Alliance Priority Parts shall be entitled to cancel all or any part of any order of the Customer which remains unfulfilled and all amounts owing to Alliance Priority Parts shall become immediately payable if: (a) any money payable to Alliance Priority Parts becomes overdue; (b) the Customer has exceeded any applicable credit limit; (c) the Customer becomes insolvent or enters into an arrangement with creditors; or (d) a receiver, manager, or liquidator is appointed in respect of the Customer.`,
  terms_cancellation: `17.1 Without prejudice to any other remedies Alliance Priority Parts may have, if at any time the Customer is in breach of any obligation under these terms and conditions, Alliance Priority Parts may suspend or terminate the supply of Goods to the Customer. Alliance Priority Parts will not be liable to the Customer for any loss or damage the Customer suffers because Alliance Priority Parts has exercised its rights under this clause.
17.2 Alliance Priority Parts may cancel any contract to which these terms and conditions apply or cancel Delivery of Goods at any time before the Goods are delivered by giving written notice to the Customer. On giving such notice Alliance Priority Parts shall repay to the Customer any money paid by the Customer for the Goods.
17.3 If the Customer cancels Delivery of Goods, the Customer shall be liable for all losses incurred (whether direct or indirect) by Alliance Priority Parts as a direct result of the cancellation (including, but not limited to, any loss of profits).`,
  terms_privacy: `18.1 All emails, documents, images, or other recorded information held or used by Alliance Priority Parts is Personal Information and therefore considered Confidential Information. Alliance Priority Parts acknowledges its obligation in relation to the handling, use, disclosure and processing of Personal Information pursuant to the Privacy Act 1988 ("the Act") including the Privacy Amendment (Notifiable Data Breaches) Act 2017 (NDB). Alliance Priority Parts acknowledges that in the event it becomes aware of any data breaches and/or disclosure of the Customer's Personal Information that may result in serious harm to the Customer, Alliance Priority Parts will notify the Customer in accordance with the Act.
18.3 The Customer agrees that Alliance Priority Parts may exchange information about the Customer with those credit providers and with related body corporates for the following purposes: (a) to assess an application by the Customer; (b) to notify other credit providers of a default by the Customer; (c) to exchange information with other credit providers as to the status of this credit account; (d) to assess the creditworthiness of the Customer.
18.8 The Customer shall have the right to request (by e-mail) from Alliance Priority Parts: (a) a copy of the Personal Information about the Customer retained by Alliance Priority Parts and the right to request that Alliance Priority Parts correct any incorrect Personal Information; and (b) that Alliance Priority Parts does not disclose any Personal Information about the Customer for the purpose of direct marketing.`,
  terms_service_notices: `20.1 Any written notice given under this Contract shall be deemed to have been given and received: (a) by handing the notice to the other party, in person; (b) by leaving it at the address of the other party as stated in this Contract; (c) by sending it by registered post to the address of the other party as stated in this Contract; (d) if sent by facsimile transmission to the fax number of the other party; (e) if sent by email to the other party's last known email address.
20.2 Any notice that is posted shall be deemed to have been served, unless the contrary is shown, at the time when by the ordinary course of post, the notice would have been delivered.`,
  terms_trusts: `21.1 If the Customer at any time upon or subsequent to entering in to the Contract is acting in the capacity of trustee of any trust ("Trust") then whether or not Alliance Priority Parts may have notice of the Trust, the Customer covenants with Alliance Priority Parts as follows: (a) the Contract extends to all rights of indemnity which the Customer now or subsequently may have against the Trust and the trust fund; (b) the Customer has full and complete power and authority under the Trust to enter into the Contract; (c) the Customer will not without consent in writing of Alliance Priority Parts cause, permit, or suffer to happen: the removal, replacement or retirement of the Customer as trustee; any alteration to or variation of the terms of the Trust; any advancement or distribution of capital of the Trust; or any resettlement of the trust property.`,
  terms_general: `22.1 Any dispute or difference arising as to the interpretation of these terms and conditions shall be submitted to, and settled by, mediation before resorting to any external dispute resolution mechanisms by notifying the other party in writing. The parties shall share equally the mediator's fees.
22.2 The failure by either party to enforce any provision of these terms and conditions shall not be treated as a waiver of that provision, nor shall it affect that party's right to subsequently enforce that provision.
22.3 These terms and conditions and any contract to which they apply shall be governed by the laws of Western Australia and are subject to the jurisdiction of the courts of Western Australia. These terms prevail over all terms and conditions of the Customer.
22.4 Alliance Priority Parts shall be under no liability whatsoever to the Customer for any indirect and/or consequential loss and/or expense (including loss of profit) suffered by the Customer arising out of a breach by Alliance Priority Parts of these terms and conditions (alternatively Alliance Priority Parts' liability shall be limited to damages which under no circumstances shall exceed the Price of the Goods).
22.5 Alliance Priority Parts may licence and/or assign all or any part of its rights and/or obligations under this Contract without the Customer's consent.
22.9 Neither party shall be liable for any default due to any act of God, war, terrorism, strike, lock-out, industrial action, fire, flood, storm, national or global pandemics and/or the implementation of regulation, directions, rules or measures being enforced by Governments or embargo ("Force Majeure") or other event beyond the reasonable control of either party.
22.10 Both parties warrant that they have the power to enter this Contract and have obtained all necessary authorisations to allow them to do so, they are not insolvent and that this Contract creates binding and valid legal obligations on them.`,
  is_active: true
};

const SECTION_LABELS = [
  { key: "company", label: "Company Details" },
  { key: "declaration", label: "Declaration Text" },
  { key: "guarantee", label: "Guarantee & Indemnity" },
  { key: "terms_definitions", label: "T&C — Definitions" },
  { key: "terms_acceptance", label: "T&C — Acceptance" },
  { key: "terms_errors_omissions", label: "T&C — Errors & Omissions" },
  { key: "terms_price_payment", label: "T&C — Price & Payment" },
  { key: "terms_delivery", label: "T&C — Delivery" },
  { key: "terms_risk", label: "T&C — Risk" },
  { key: "terms_title", label: "T&C — Title" },
  { key: "terms_ppsa", label: "T&C — PPSA" },
  { key: "terms_security_charge", label: "T&C — Security & Charge" },
  { key: "terms_defects_warranties", label: "T&C — Defects & Warranties" },
  { key: "terms_default", label: "T&C — Default" },
  { key: "terms_cancellation", label: "T&C — Cancellation" },
  { key: "terms_privacy", label: "T&C — Privacy" },
  { key: "terms_service_notices", label: "T&C — Service of Notices" },
  { key: "terms_trusts", label: "T&C — Trusts" },
  { key: "terms_general", label: "T&C — General" },
];

export default function CreditAppEditor({ template, onClose, onSaved }) {
  const [form, setForm] = useState(template || DEFAULT_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState("company");

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    let saved;
    if (form.id) {
      saved = await base44.entities.CreditAppTemplate.update(form.id, form);
    } else {
      saved = await base44.entities.CreditAppTemplate.create(form);
    }
    setSaving(false);
    onSaved(saved);
  };

  const toggle = (key) => setOpenSection(o => o === key ? null : key);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-6 pb-8 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl mx-4">
        <div className="bg-[hsl(0,0%,5%)] px-6 py-5 flex items-center justify-between rounded-t-sm sticky top-0 z-10">
          <div>
            <h2 className="font-heading text-xl font-bold text-white uppercase tracking-widest">Edit Credit Application Template</h2>
            <p className="text-white/40 text-xs font-heading uppercase tracking-wider mt-0.5">Alliance Priority Parts — Document Pack</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white ml-4"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-2">
          {/* Company Section */}
          <div className="border border-border rounded-sm overflow-hidden">
            <button onClick={() => toggle("company")} className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="font-heading text-sm uppercase tracking-wider">Company Details</span>
              {openSection === "company" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSection === "company" && (
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { k: "company_name", l: "Company Name" },
                  { k: "version", l: "Version" },
                  { k: "company_abn", l: "ABN" },
                  { k: "company_acn", l: "ACN" },
                  { k: "company_address", l: "Address", full: true },
                  { k: "company_state", l: "State" },
                  { k: "company_postcode", l: "Postcode" },
                  { k: "company_phone", l: "Phone" },
                  { k: "company_email", l: "Email" },
                  { k: "company_web", l: "Website" },
                  { k: "logo_url", l: "Logo URL", full: true },
                ].map(({ k, l, full }) => (
                  <div key={k} className={full ? "col-span-2" : ""}>
                    <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">{l}</label>
                    <Input value={form[k] || ""} onChange={e => u(k, e.target.value)} className="rounded-sm text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text sections */}
          {[
            { key: "declaration", label: "Declaration Text", field: "declaration_text" },
            { key: "guarantee", label: "Guarantee & Indemnity", field: null },
          ].map(sec => (
            <div key={sec.key} className="border border-border rounded-sm overflow-hidden">
              <button onClick={() => toggle(sec.key)} className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="font-heading text-sm uppercase tracking-wider">{sec.label}</span>
                {openSection === sec.key ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {openSection === sec.key && (
                <div className="p-4 space-y-3">
                  {sec.key === "guarantee" ? (
                    <>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Introductory Text</label>
                        <Textarea value={form.guarantee_intro_text || ""} onChange={e => u("guarantee_intro_text", e.target.value)} className="rounded-sm text-xs" rows={3} />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Clauses (numbered)</label>
                        <Textarea value={form.guarantee_clauses || ""} onChange={e => u("guarantee_clauses", e.target.value)} className="rounded-sm text-xs" rows={14} />
                      </div>
                    </>
                  ) : (
                    <Textarea value={form[sec.field] || ""} onChange={e => u(sec.field, e.target.value)} className="rounded-sm text-xs" rows={5} />
                  )}
                </div>
              )}
            </div>
          ))}

          {/* T&C Sections */}
          {[
            { key: "terms_definitions", label: "1. Definitions" },
            { key: "terms_acceptance", label: "2. Acceptance" },
            { key: "terms_errors_omissions", label: "3. Errors & Omissions" },
            { key: "terms_price_payment", label: "6. Price & Payment" },
            { key: "terms_delivery", label: "7. Delivery" },
            { key: "terms_risk", label: "8. Risk" },
            { key: "terms_title", label: "11. Title" },
            { key: "terms_ppsa", label: "12. PPSA" },
            { key: "terms_security_charge", label: "13. Security & Charge" },
            { key: "terms_defects_warranties", label: "14. Defects, Warranties & Returns" },
            { key: "terms_default", label: "16. Default & Consequences" },
            { key: "terms_cancellation", label: "17. Cancellation" },
            { key: "terms_privacy", label: "18. Privacy Policy" },
            { key: "terms_service_notices", label: "20. Service of Notices" },
            { key: "terms_trusts", label: "21. Trusts" },
            { key: "terms_general", label: "22. General" },
          ].map(sec => (
            <div key={sec.key} className="border border-border rounded-sm overflow-hidden">
              <button onClick={() => toggle(sec.key)} className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="font-heading text-sm uppercase tracking-wider">{sec.label}</span>
                {openSection === sec.key ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {openSection === sec.key && (
                <div className="p-4">
                  <Textarea value={form[sec.key] || ""} onChange={e => u(sec.key, e.target.value)} className="rounded-sm text-xs" rows={8} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-[hsl(0,0%,97%)] border-t border-border flex justify-between items-center gap-3 rounded-b-sm">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}