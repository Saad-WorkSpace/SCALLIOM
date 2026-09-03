'use client';

import { useState } from 'react';
import { ArrowUpRight, Camera, Check, Mail, Package, Ruler, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const withBasePath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;

type OverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const garmentInches = [
  { size: 'S', chest: 22, length: 27.5, shoulder: 20, sleeve: 9.5 },
  { size: 'M', chest: 23, length: 28.5, shoulder: 21, sleeve: 10 },
  { size: 'L', chest: 24.5, length: 29.5, shoulder: 22, sleeve: 10.5 },
  { size: 'XL', chest: 26, length: 30.5, shoulder: 23, sleeve: 11 },
];

const bodyInches = [
  { size: 'S', chest: '34–36', waist: '28–30' },
  { size: 'M', chest: '38–40', waist: '31–33' },
  { size: 'L', chest: '42–44', waist: '34–36' },
  { size: 'XL', chest: '46–48', waist: '38–40' },
];

function measurement(value: number, unit: 'in' | 'cm') {
  return unit === 'in' ? value.toFixed(value % 1 ? 1 : 0) : (value * 2.54).toFixed(1);
}

function rangeMeasurement(value: string, unit: 'in' | 'cm') {
  if (unit === 'in') return value;
  return value.split('–').map((part) => Math.round(Number(part) * 2.54)).join('–');
}

export function SizeGuideDialog({ open, onOpenChange }: OverlayProps) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [fit, setFit] = useState<'closer' | 'intended' | 'oversized'>('intended');
  const fitCopy = {
    closer: 'Choose one size down for a cleaner, closer silhouette.',
    intended: 'Choose your usual size for Scallium’s relaxed box fit.',
    oversized: 'Choose one size up for extra length and volume.',
  }[fit];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="size-guide-dialog" showCloseButton>
        <DialogTitle className="sr-only">Scallium size guide</DialogTitle>
        <DialogDescription className="sr-only">Body and garment measurements with fit recommendations.</DialogDescription>
        <header className="guide-header">
          <p>Scallium / Fit system</p>
          <h2>Find your shape.</h2>
          <div className="unit-toggle" aria-label="Measurement unit">
            <button type="button" aria-pressed={unit === 'in'} onClick={() => setUnit('in')}>Inches</button>
            <button type="button" aria-pressed={unit === 'cm'} onClick={() => setUnit('cm')}>Centimeters</button>
          </div>
        </header>

        <div className="guide-layout">
          <section className="measure-visual" aria-labelledby="measure-visual-title">
            <h3 id="measure-visual-title">How to measure the garment</h3>
            <svg viewBox="0 0 520 450" role="img" aria-label="T-shirt outline showing chest, length, shoulder, and sleeve measurements">
              <path className="tee-shape" d="M178 74L218 54Q260 77 302 54L342 74L438 130L394 211L345 184L345 398L175 398L175 184L126 211L82 130Z" />
              <path className="seam" d="M218 54Q260 125 302 54M176 184L207 141M344 184L313 141" />
              <path className="measure-line" d="M178 245H342M164 76H356M156 133L104 195M365 86V398" />
              <path className="measure-tick" d="M178 236V254M342 236V254M164 67V85M356 67V85M148 126L164 140M96 187L112 201M356 86H374M356 398H374" />
              <text x="251" y="233">A</text><text x="251" y="64">B</text><text x="118" y="157">C</text><text x="383" y="250">D</text>
            </svg>
            <ol>
              <li><b>A — Chest</b><span>Measure straight across, 1 inch below the armhole.</span></li>
              <li><b>B — Shoulder</b><span>Measure seam to seam across the upper back.</span></li>
              <li><b>C — Sleeve</b><span>Measure shoulder seam to sleeve opening.</span></li>
              <li><b>D — Length</b><span>Measure high shoulder to the bottom hem.</span></li>
            </ol>
          </section>

          <section className="measure-data">
            <div className="fit-picker">
              <h3>How do you want it to fit?</h3>
              <div>
                {(['closer', 'intended', 'oversized'] as const).map((choice) => (
                  <button key={choice} type="button" aria-pressed={fit === choice} onClick={() => setFit(choice)}>{choice}</button>
                ))}
              </div>
              <p>{fitCopy}</p>
            </div>

            <div className="measurement-block">
              <div><h3>Garment measurements</h3><span>{unit}</span></div>
              <table>
                <thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th><th>Sleeve</th></tr></thead>
                <tbody>{garmentInches.map((row) => <tr key={row.size}><th>{row.size}</th><td>{measurement(row.chest, unit)}</td><td>{measurement(row.length, unit)}</td><td>{measurement(row.shoulder, unit)}</td><td>{measurement(row.sleeve, unit)}</td></tr>)}</tbody>
              </table>
            </div>

            <div className="measurement-block">
              <div><h3>Body measurements</h3><span>{unit}</span></div>
              <table>
                <thead><tr><th>Size</th><th>Chest</th><th>Waist</th></tr></thead>
                <tbody>{bodyInches.map((row) => <tr key={row.size}><th>{row.size}</th><td>{rangeMeasurement(row.chest, unit)}</td><td>{rangeMeasurement(row.waist, unit)}</td></tr>)}</tbody>
              </table>
            </div>

            <div className="fit-notes">
              <div><Ruler aria-hidden="true" /><span><b>Low stretch</b>Structured jersey with approximately 4–6% mechanical give.</span></div>
              <div><ShieldCheck aria-hidden="true" /><span><b>Fit reference</b>Size M is the studio reference sample. Campaign model measurements will be added after fitting.</span></div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProductDetailSection({ onSizeGuide, onOpenProduct }: { onSizeGuide: () => void; onOpenProduct: () => void }) {
  const [country, setCountry] = useState('United States');
  const [postal, setPostal] = useState('');
  const [estimated, setEstimated] = useState(false);
  const rate = country === 'United States' ? '$8.00 standard' : country === 'Canada' ? '$18.00 tracked' : '$28.00 international';
  const window = country === 'United States' ? '3–5 business days' : country === 'Canada' ? '6–9 business days' : '8–14 business days';

  return (
    <section className="product-detail-section" id="details" aria-labelledby="detail-title">
      <div className="detail-heading">
        <p className="eyebrow">Edition 001 / Construction</p>
        <h2 id="detail-title">Closer reveals more.</h2>
        <p>The first edition is built around density, proportion, and two marks with separate roles.</p>
      </div>

      <div className="detail-gallery">
        <figure><img src={withBasePath('/products/scallium-black-detail-sm.png')} alt="Close-up of the embroidered SM mark and ribbed collar on the black Scallium tee" /><figcaption><span>01</span>Front mark / satin embroidery</figcaption></figure>
        <figure><img src={withBasePath('/products/scallium-black-detail-wordmark.png')} alt="Close-up of the SCALLIOM back wordmark screen print on heavyweight black cotton" /><figcaption><span>02</span>Back wordmark / water-based screen print</figcaption></figure>
      </div>

      <div className="product-facts">
        <div className="fact-intro">
          <p>Classic Black Heavy Tee</p>
          <h3>450 GSM, without the stiffness.</h3>
          <p>A substantial jersey developed to soften with wear while keeping its boxy line.</p>
          <Button onClick={onOpenProduct}>Choose color and size <ArrowUpRight aria-hidden="true" /></Button>
        </div>
        <dl>
          <div><dt>Composition</dt><dd>100% combed ring-spun cotton</dd></div>
          <div><dt>Fabric</dt><dd>450 GSM compact jersey</dd></div>
          <div><dt>Finish</dt><dd>Garment washed for a broken-in hand</dd></div>
          <div><dt>Front method</dt><dd>High-density satin embroidery</dd></div>
          <div><dt>Back method</dt><dd>Soft-hand water-based screen print</dd></div>
          <div><dt>Construction</dt><dd>Bound neck, taped shoulder, twin-needle hem</dd></div>
          <div><dt>Care</dt><dd>Cold wash inside out; hang dry; do not iron print</dd></div>
          <div><dt>Origin</dt><dd>Final production origin pending supplier confirmation</dd></div>
        </dl>
      </div>

      <div className="commerce-assurance">
        <section className="stock-panel">
          <div><p>Available now</p><button type="button" onClick={onSizeGuide}>Open size guide <Ruler aria-hidden="true" /></button></div>
          <div className="stock-grid">
            <span><b>S</b>In stock</span><span><b>M</b>In stock</span><span><b>L</b>In stock</span><span><b>XL</b>Low stock</span>
          </div>
        </section>
        <form className="shipping-estimator" onSubmit={(event) => { event.preventDefault(); setEstimated(true); }}>
          <div><p>Shipping estimate</p><span>Complimentary US shipping over $120</span></div>
          <label>Destination<select value={country} onChange={(event) => { setCountry(event.target.value); setEstimated(false); }}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>European Union</option><option>Rest of world</option></select></label>
          <label>Postal code<Input value={postal} onChange={(event) => { setPostal(event.target.value); setEstimated(false); }} placeholder="60601" required /></label>
          <Button type="submit">Estimate</Button>
          {estimated && <div className="shipping-result"><Check aria-hidden="true" /><span><b>{rate}</b>Estimated arrival in {window}. Taxes update at checkout. International duties may be collected by the carrier.</span></div>}
        </form>
      </div>
    </section>
  );
}

export function BrandWorldSection() {
  return (
    <section className="brand-world" id="world" aria-labelledby="world-title">
      <div className="world-copy">
        <p className="eyebrow">The name / The point of view</p>
        <h2 id="world-title">Scallium lives between structure and ease.</h2>
        <p>Scallium is a fabricated name for a real tension: something precise that still feels lived in. The S and M intersect on the front; the full name appears only when the wearer turns away.</p>
        <p>Our design philosophy is subtraction with evidence. Weight where it matters. Space where the body needs it. Marks that reveal themselves in sequence.</p>
      </div>
      <div className="world-grid">
        <article className="package-study"><span>Edition 001 / Packaging study</span><div className="package-card"><span className="package-monogram">SM</span><p>SCALLIOM<br />FIRST EDITION</p><small>Recycled mailer · uncoated care card · tissue wrap</small></div></article>
        <article className="claims-standard"><ShieldCheck aria-hidden="true" /><span><b>Claims, documented</b>Material certifications and manufacturing details will be published only after supplier verification.</span></article>
        <article className="community-standard"><span>Community / Reviews</span><h3>Real wear, once it exists.</h3><p>Verified-purchaser reviews and authentic customer photography will open after the first orders ship. No fabricated testimonials. No purchased praise.</p></article>
        <article className="press-standard"><span>Press / Creators</span><h3>Coverage will be earned.</h3><p>Editorial features and creator mentions will be linked here when published, with clear disclosure for gifted pieces.</p><a href="mailto:press@scallium.com">Press inquiries <ArrowUpRight aria-hidden="true" /></a></article>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [joined, setJoined] = useState(false);
  return (
    <section className="newsletter" id="newsletter" aria-labelledby="newsletter-title">
      <div><p>Scallium dispatch</p><h2 id="newsletter-title">Know before the drop.</h2><span>Launch notes, restocks, and edition previews. No weekly noise.</span></div>
      {joined ? <div className="newsletter-success"><Check aria-hidden="true" /><span><b>You’re on the list.</b>Edition 001 updates will arrive here.</span></div> : <form onSubmit={(event) => { event.preventDefault(); setJoined(true); }}><label htmlFor="dispatch-email" className="sr-only">Email address</label><Input id="dispatch-email" type="email" placeholder="Email address" autoComplete="email" required /><Button type="submit">Join the list <Mail aria-hidden="true" /></Button></form>}
      <div className="social-row"><span>Social</span><a href="https://www.instagram.com" target="_blank" rel="noreferrer"><Camera aria-hidden="true" /> Instagram</a><a href="https://www.tiktok.com" target="_blank" rel="noreferrer">TikTok <ArrowUpRight aria-hidden="true" /></a><a href="https://www.pinterest.com" target="_blank" rel="noreferrer">Pinterest <ArrowUpRight aria-hidden="true" /></a></div>
    </section>
  );
}

export function PolicyCenterDialog({ open, onOpenChange }: OverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="policy-dialog" showCloseButton>
        <DialogTitle className="sr-only">Scallium policies and frequently asked questions</DialogTitle>
        <DialogDescription className="sr-only">Shipping, returns, privacy, terms, and support information.</DialogDescription>
        <header><p>Customer care / Scallium</p><h2>The details, clearly.</h2></header>
        <Tabs defaultValue="shipping" className="policy-tabs">
          <TabsList variant="line"><TabsTrigger value="shipping">Shipping</TabsTrigger><TabsTrigger value="returns">Returns</TabsTrigger><TabsTrigger value="faq">FAQ</TabsTrigger><TabsTrigger value="privacy">Privacy</TabsTrigger><TabsTrigger value="terms">Terms</TabsTrigger></TabsList>
          <TabsContent value="shipping" className="policy-copy"><h3>Shipping</h3><p>US standard delivery is estimated at 3–5 business days after dispatch and is complimentary on orders of $120 or more. Expedited and international options are calculated from the destination at checkout.</p><p>Canada delivery is typically 6–9 business days; other international destinations are typically 8–14 business days. International customers are responsible for any duties, taxes, or brokerage charges assessed on arrival.</p><p>Tracking is sent when the carrier accepts the parcel. Estimated dates are not guarantees during launches or carrier disruptions.</p></TabsContent>
          <TabsContent value="returns" className="policy-copy"><h3>Returns & exchanges</h3><p>Unworn, unwashed pieces with original packaging may be returned within 30 days of delivery. Final-sale pieces and worn garments are not eligible.</p><p>Size exchanges depend on available inventory. Once approved, refunds return to the original payment method after inspection.</p><p>These terms are launch-draft policies and should be reviewed before the store accepts real payments.</p></TabsContent>
          <TabsContent value="faq" className="policy-copy"><h3>Frequently asked</h3><Accordion><AccordionItem value="fit"><AccordionTrigger>How does the Heavy Tee fit?</AccordionTrigger><AccordionContent>Relaxed and boxy with a dropped shoulder. Choose your usual size for the intended silhouette.</AccordionContent></AccordionItem><AccordionItem value="care"><AccordionTrigger>How should I wash it?</AccordionTrigger><AccordionContent>Wash cold and inside out with like colors. Hang dry when possible and never iron directly over either mark.</AccordionContent></AccordionItem><AccordionItem value="restock"><AccordionTrigger>Will sold-out sizes return?</AccordionTrigger><AccordionContent>Join the Scallium Dispatch for verified restock notices. Restocks are announced only after inventory is confirmed.</AccordionContent></AccordionItem><AccordionItem value="support"><AccordionTrigger>How do I contact support?</AccordionTrigger><AccordionContent>Email support@scallium.com with your order number. Support infrastructure will be connected before launch.</AccordionContent></AccordionItem></Accordion></TabsContent>
          <TabsContent value="privacy" className="policy-copy"><h3>Privacy</h3><p>Scallium will collect only the information needed to process orders, provide support, prevent fraud, and send marketing messages when someone explicitly opts in.</p><p>Customer data will not be sold. Marketing consent can be withdrawn at any time. Payment details will be handled by the connected payment processor rather than stored by Scallium.</p></TabsContent>
          <TabsContent value="terms" className="policy-copy"><h3>Store terms</h3><p>Product details, prices, inventory, and delivery windows may change before an order is accepted. Orders may be cancelled and refunded when inventory or payment verification fails.</p><p>All designs, photography, text, and marks remain the property of Scallium or their respective owners. These launch-draft terms require legal review before publication.</p></TabsContent>
        </Tabs>
        <footer><Package aria-hidden="true" /><span>Questions? <a href="mailto:support@scallium.com">support@scallium.com</a></span></footer>
      </DialogContent>
    </Dialog>
  );
}
