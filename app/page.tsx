'use client';

export const dynamic = 'force-static';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Check,
  CreditCard,
  House,
  LockKeyhole,
  Minus,
  Plus,
  Shirt,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GradientWaves } from '@/components/gradient-waves';
import {
  BrandWorldSection,
  NewsletterSection,
  PolicyCenterDialog,
  ProductDetailSection,
  SizeGuideDialog,
} from '@/components/store-experience';

const withBasePath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;

const colorways = [
  {
    name: 'Ink',
    displayName: 'Black',
    tone: '#151515',
    front: withBasePath('/products/scallium-black-front.png'),
    back: withBasePath('/products/scallium-black-back.png'),
  },
  {
    name: 'Dune',
    displayName: 'Dune',
    tone: '#b8966e',
    front: withBasePath('/products/scallium-dune-front.png'),
    back: withBasePath('/products/scallium-dune-back.png'),
  },
  {
    name: 'Bone',
    displayName: 'Bone',
    tone: '#e7e1d7',
    front: withBasePath('/products/scallium-bone-front.png'),
    back: withBasePath('/products/scallium-bone-back.png'),
  },
];

const sizes = ['S', 'M', 'L', 'XL'] as const;
type Size = (typeof sizes)[number];
type GarmentSide = 'front' | 'back';
type CartItem = {
  id: string;
  colorIndex: number;
  size: Size;
  quantity: number;
};
type CheckoutStep = 'delivery' | 'payment' | 'success';

type ModelTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};

type ModelContext = {
  registerTool: (tool: ModelTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

function Monogram() {
  return (
    <span className="monogram" aria-hidden="true">
      <span>S</span>
      <span>M</span>
    </span>
  );
}

function DepthCarousel({
  selected,
  onSelect,
  side,
}: {
  selected: number;
  onSelect: (index: number) => void;
  side: GarmentSide;
}) {
  const positionFor = (index: number) => {
    const raw = index - selected;
    if (raw > 1) return -1;
    if (raw < -1) return 1;
    return raw;
  };

  return (
    <div className="depth-carousel" aria-label="Product color gallery">
      <div className="carousel-stage">
        {colorways.map((colorway, index) => {
          const position = positionFor(index);
          return (
            <button
              className="depth-card"
              data-position={position}
              key={colorway.name}
              onClick={() => onSelect(index)}
              aria-label={`View ${colorway.name} colorway`}
              aria-current={index === selected ? 'true' : undefined}
              style={{ zIndex: position === 0 ? 3 : 2 }}
            >
              <img
                src={colorway[side]}
                alt={`${side === 'front' ? 'Front' : 'Back'} view of the ${colorway.displayName.toLowerCase()} Scallium heavyweight shirt`}
              />
              <span>{colorway.name}</span>
            </button>
          );
        })}
      </div>
      <div className="carousel-controls">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelect((selected + colorways.length - 1) % colorways.length)}
          aria-label="Previous color"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <p>
          <span>{String(selected + 1).padStart(2, '0')}</span> / 0{colorways.length}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelect((selected + 1) % colorways.length)}
          aria-label="Next color"
        >
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [productOpen, setProductOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('delivery');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [garmentSide, setGarmentSide] = useState<GarmentSide>('front');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [added, setAdded] = useState(false);
  const [completedOrder, setCompletedOrder] = useState({ number: '', total: 0 });
  const [shippingCountry, setShippingCountry] = useState('United States');
  const [shippingRegion, setShippingRegion] = useState('IL');
  const [expressNotice, setExpressNotice] = useState('');

  const activeColor = colorways[selectedColor];
  const bagCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.quantity * 68, 0);
  const shipping = subtotal === 0
    ? 0
    : shippingCountry === 'United States'
      ? subtotal >= 120 ? 0 : 8
      : shippingCountry === 'Canada' ? 18 : 28;
  const usTaxRates: Record<string, number> = { IL: .1025, CA: .0725, NY: .08875, TX: .0825, FL: .07 };
  const taxRate = shippingCountry === 'United States'
    ? (usTaxRates[shippingRegion.toUpperCase()] ?? .0825)
    : shippingCountry === 'Canada' ? .13
      : ['United Kingdom', 'European Union'].includes(shippingCountry) ? .2 : 0;
  const estimatedTax = subtotal * taxRate;
  const orderTotal = subtotal + shipping + estimatedTax;

  const openProduct = (index: number) => {
    setSelectedColor(index);
    setGarmentSide('front');
    setAdded(false);
    setProductOpen(true);
  };

  const addCartItem = (colorIndex: number, size: Size) => {
    const id = `${colorIndex}-${size}`;
    setCartItems((items) => {
      const existing = items.find((item) => item.id === id);
      if (existing) {
        return items.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { id, colorIndex, size, quantity: 1 }];
    });
  };

  const addToBag = () => {
    addCartItem(selectedColor, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) => items
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const beginCheckout = () => {
    if (!cartItems.length) return;
    setCheckoutStep('delivery');
    setBagOpen(false);
    setCheckoutOpen(true);
  };

  const completeOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompletedOrder({
      number: `SC-${Date.now().toString().slice(-6)}`,
      total: orderTotal,
    });
    setCartItems([]);
    setCheckoutStep('success');
  };

  const modelContext = useMemo(
    () =>
      typeof document === 'undefined'
        ? undefined
        : (document as Document & { modelContext?: ModelContext }).modelContext,
    [],
  );

  useEffect(() => {
    const storedCart = window.localStorage.getItem('scallium-cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart) as CartItem[]);
      } catch {
        window.localStorage.removeItem('scallium-cart');
      }
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (cartReady) window.localStorage.setItem('scallium-cart', JSON.stringify(cartItems));
  }, [cartItems, cartReady]);

  useEffect(() => {
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();

    void Promise.resolve(
      modelContext.registerTool(
        {
          name: 'add_classic_heavy_tee_to_bag',
          title: 'Add Classic Heavy Tee to bag',
          description: 'Adds one Scallium Classic Heavy Tee to the visible bag in a chosen color and size.',
          inputSchema: {
            type: 'object',
            properties: {
              color: { type: 'string', enum: colorways.map((colorway) => colorway.name) },
              size: { type: 'string', enum: sizes },
            },
            required: ['color', 'size'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            const selection = input as { color?: string; size?: string };
            const colorIndex = colorways.findIndex((colorway) => colorway.name === selection.color);
            if (colorIndex < 0 || !sizes.includes(selection.size as Size)) {
              throw new Error('Choose a valid color and size.');
            }
            setSelectedColor(colorIndex);
            setSelectedSize(selection.size as Size);
            addCartItem(colorIndex, selection.size as Size);
            setAdded(true);
            return { product: 'Classic Heavy Tee', color: selection.color, size: selection.size, status: 'added' };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, [modelContext]);

  return (
    <main className="site-shell">
      <GradientWaves className="site-waves" />

      <header className="site-header">
        <a className="brand-lockup" href="#home" aria-label="Scallium home">
          <Monogram />
          <span className="brand-wordmark">SCALLIOM</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#home"><span className="nav-icon"><House aria-hidden="true" /></span><span>Home</span></a>
          <a href="#shop"><span className="nav-icon"><Shirt aria-hidden="true" /></span><span>Shop</span></a>
          <a href="#story"><span className="nav-icon"><BookOpenText aria-hidden="true" /></span><span>Our story</span></a>
        </nav>

        <Button variant="ghost" className="bag-button" onClick={() => setBagOpen(true)} aria-label={`Shopping bag, ${bagCount} item${bagCount === 1 ? '' : 's'}`}>
          <ShoppingBag aria-hidden="true" />
          <span>Bag</span>
          <span className="bag-count">{bagCount}</span>
        </Button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Edition 001 / Built with intention</p>
          <h1>
            Form,
            <br />
            <em>without excess.</em>
          </h1>
          <p className="hero-description">
            Essential silhouettes cut from substantial cloth. Designed to settle in, wear out,
            and stay in rotation.
          </p>
          <div className="hero-actions">
            <Button className="primary-cta" size="lg" onClick={() => document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' })}>
              Shop edition 001
              <ArrowUpRight aria-hidden="true" />
            </Button>
            <a className="text-link" href="#story">
              Discover the fabric <ArrowDown aria-hidden="true" />
            </a>
          </div>
        </div>

        <button className="hero-visual holo-surface" onClick={() => openProduct(0)} aria-label="View Classic Black Heavy Tee">
          <span className="edition-tag">
            <span>01</span>
            <span>First edition</span>
          </span>
          <span className="hero-image-frame">
            <img className="garment-front" src={colorways[0].front} alt="Front view of the black Scallium shirt with only the SM logo" />
            <img className="garment-back" src={colorways[0].back} alt="Back view of the black Scallium shirt with only the SCALLIOM wordmark" />
            <span className="view-cue">Hover to view back</span>
          </span>
          <span className="hero-product-meta">
            <span>
              <strong>Classic Black Heavy Tee</strong>
              <small>450 GSM / Ink</small>
            </span>
            <strong>$68</strong>
          </span>
        </button>
      </section>

      <section className="collection" id="shop" aria-labelledby="collection-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Scallium / 001</p>
            <h2 id="collection-title">First Edition</h2>
          </div>
          <p>One weight. One silhouette. Three tonal studies.</p>
        </div>

        <div className="product-grid">
          {colorways.map((colorway, index) => (
            <button className="product-card holo-surface" key={colorway.name} onClick={() => openProduct(index)}>
              <span className="product-image-wrap">
                <img className="garment-front" src={colorway.front} alt={`Front view of the ${colorway.displayName.toLowerCase()} Scallium shirt with only the SM logo`} />
                <img className="garment-back" src={colorway.back} alt={`Back view of the ${colorway.displayName.toLowerCase()} Scallium shirt with only the SCALLIOM wordmark`} />
                <span className="product-action">View piece <ArrowUpRight aria-hidden="true" /></span>
                <span className="view-cue">Front / Back</span>
              </span>
              <span className="product-info">
                <span>
                  <strong>Classic {colorway.displayName} Heavy Tee</strong>
                  <small>{colorway.name}</small>
                </span>
                <strong>$68</strong>
              </span>
            </button>
          ))}
        </div>
      </section>

      <ProductDetailSection onSizeGuide={() => setSizeGuideOpen(true)} onOpenProduct={() => openProduct(0)} />

      <section className="story" id="story">
        <div className="story-mark"><Monogram /></div>
        <p className="story-kicker">The quiet is the point.</p>
        <h2>Best of Both Worlds</h2>
        <div className="story-details">
          <p>
            Scallium begins with the things that matter after the first wear: balance, hand-feel,
            and a cut that holds its shape.
          </p>
          <dl>
            <div><dt>Weight</dt><dd>450 GSM</dd></div>
            <div><dt>Cut</dt><dd>Relaxed / Boxed</dd></div>
            <div><dt>Finish</dt><dd>Garment washed</dd></div>
          </dl>
        </div>
      </section>

      <BrandWorldSection />
      <NewsletterSection />

      <footer className="site-footer">
        <a className="brand-lockup" href="#home"><Monogram /><span className="brand-wordmark">SCALLIOM</span></a>
        <p>© 2026 Scallium Studio</p>
        <div className="footer-links"><button type="button" onClick={() => setPoliciesOpen(true)}>Policies & care</button><a href="#newsletter">Launch updates</a></div>
      </footer>

      <div className="side-note" aria-hidden="true">CHICAGO / 41.8781° N</div>

      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="product-dialog" showCloseButton>
          <DialogTitle className="sr-only">Classic {activeColor.displayName} Heavy Tee</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a Scallium Classic Heavy Tee color, view, and size.
          </DialogDescription>

          <DepthCarousel selected={selectedColor} onSelect={setSelectedColor} side={garmentSide} />

          <div className="product-panel">
            <p className="product-index">Edition 001 / {String(selectedColor + 1).padStart(2, '0')}</p>
            <h2>Classic {activeColor.displayName} Heavy Tee</h2>
            <p className="product-price">$68</p>
            <p className="product-copy">
              A dense, garment-washed jersey with a composed drape. The SCALLIOM wordmark is
              screened alone across the back; the interlocked SM mark stands alone on the front.
            </p>

            <fieldset className="option-group view-options">
              <legend>View — <span>{garmentSide}</span></legend>
              <div className="size-options">
                <button type="button" aria-pressed={garmentSide === 'front'} onClick={() => setGarmentSide('front')}>Front</button>
                <button type="button" aria-pressed={garmentSide === 'back'} onClick={() => setGarmentSide('back')}>Back</button>
              </div>
            </fieldset>

            <fieldset className="option-group">
              <legend>Color — <span>{activeColor.name}</span></legend>
              <div className="color-options">
                {colorways.map((colorway, index) => (
                  <button
                    key={colorway.name}
                    type="button"
                    className="color-swatch"
                    aria-label={colorway.name}
                    aria-pressed={selectedColor === index}
                    onClick={() => setSelectedColor(index)}
                    style={{ '--swatch': colorway.tone } as React.CSSProperties}
                  >
                    {selectedColor === index && <Check aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="option-group">
              <legend>Size — <span>{selectedSize}</span><button className="size-guide-link" type="button" onClick={() => setSizeGuideOpen(true)}>Size guide</button></legend>
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    aria-pressed={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span>{size}</span><small>{size === 'XL' && activeColor.name === 'Ink' ? 'Low' : 'In stock'}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <Button className="add-button" size="lg" onClick={addToBag}>
              {added ? <><Check aria-hidden="true" /> Added to bag</> : <>Add to bag <span>$68</span></>}
            </Button>

            <div className="product-notes">
              <span>Heavyweight cotton</span>
              <span>SM front / SCALLIOM back</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="bag-sheet" side="right">
          <SheetHeader className="bag-header">
            <p className="bag-kicker">Scallium / Your selection</p>
            <SheetTitle>Your bag <span>{bagCount}</span></SheetTitle>
            <SheetDescription>
              {bagCount ? 'Your first-edition pieces are reserved for checkout.' : 'Your bag is waiting for its first piece.'}
            </SheetDescription>
          </SheetHeader>

          <div className="bag-body">
            {cartItems.length ? cartItems.map((item) => {
              const colorway = colorways[item.colorIndex];
              return (
                <article className="bag-item" key={item.id}>
                  <img src={colorway.front} alt={`Front of the ${colorway.displayName} Scallium shirt`} />
                  <div className="bag-item-copy">
                    <div>
                      <h3>Classic {colorway.displayName} Heavy Tee</h3>
                      <p>{colorway.name} / Size {item.size}</p>
                    </div>
                    <div className="bag-item-actions">
                      <div className="quantity-control" aria-label={`Quantity for ${colorway.displayName} shirt`}>
                        <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity"><Minus aria-hidden="true" /></button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity"><Plus aria-hidden="true" /></button>
                      </div>
                      <button className="remove-item" type="button" onClick={() => setCartItems((items) => items.filter((candidate) => candidate.id !== item.id))} aria-label={`Remove ${colorway.displayName} shirt`}>
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <strong className="bag-line-price">${item.quantity * 68}</strong>
                </article>
              );
            }) : (
              <div className="empty-bag">
                <ShoppingBag aria-hidden="true" />
                <h3>No pieces added yet</h3>
                <p>Explore First Edition and choose your color and size.</p>
                <Button onClick={() => {
                  setBagOpen(false);
                  document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' });
                }}>Shop First Edition</Button>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <SheetFooter className="bag-footer">
              <div className="shipping-progress">
                <span>{subtotal >= 120 ? 'Complimentary shipping unlocked' : `$${120 - subtotal} away from complimentary shipping`}</span>
                <span className="shipping-track"><span style={{ width: `${Math.min(100, subtotal / 1.2)}%` }} /></span>
              </div>
              <div className="bag-totals">
                <span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong>
                <small>Shipping and taxes calculated at checkout.</small>
              </div>
              <Button className="checkout-button" size="lg" onClick={beginCheckout}>
                Checkout <ArrowRight aria-hidden="true" />
              </Button>
              <p className="secure-note"><LockKeyhole aria-hidden="true" /> Secure preview checkout</p>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={checkoutOpen} onOpenChange={(open) => {
        setCheckoutOpen(open);
        if (!open && checkoutStep === 'success') setCheckoutStep('delivery');
      }}>
        <DialogContent className={`checkout-dialog ${checkoutStep === 'success' ? 'checkout-complete' : ''}`} showCloseButton={checkoutStep !== 'success'}>
          <DialogTitle className="sr-only">Scallium checkout</DialogTitle>
          <DialogDescription className="sr-only">Complete delivery and payment details for your order.</DialogDescription>

          <section className="checkout-main">
            <div className="checkout-brand"><Monogram /><span>SCALLIOM</span></div>

            {checkoutStep !== 'success' && (
              <div className="checkout-steps" aria-label="Checkout progress">
                <span data-active={checkoutStep === 'delivery'}>01 <b>Delivery</b></span>
                <span data-active={checkoutStep === 'payment'}>02 <b>Payment</b></span>
                <span>03 <b>Complete</b></span>
              </div>
            )}

            {checkoutStep === 'delivery' && (
              <form className="checkout-form" onSubmit={(event) => { event.preventDefault(); setCheckoutStep('payment'); }}>
                <header><p>Step 01</p><h2>Where should it arrive?</h2></header>
                <div className="express-pay">
                  <span>Express checkout</span>
                  <div><button type="button" onClick={() => setExpressNotice('Apple Pay will activate when Stripe is connected.')}> Pay</button><button type="button" onClick={() => setExpressNotice('Google Pay will activate when Stripe is connected.')}>G Pay</button><button type="button" onClick={() => setExpressNotice('Shop Pay will activate when the commerce backend is connected.')}>shop<span>Pay</span></button></div>
                  {expressNotice && <small>{expressNotice}</small>}
                </div>
                <div className="checkout-divider"><span>or continue with delivery</span></div>
                <div className="field-grid">
                  <label className="field-wide">Email address<Input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                  <label>First name<Input name="firstName" autoComplete="given-name" required /></label>
                  <label>Last name<Input name="lastName" autoComplete="family-name" required /></label>
                  <label className="field-wide">Street address<Input name="address" autoComplete="street-address" required /></label>
                  <label>City<Input name="city" autoComplete="address-level2" required /></label>
                  <label>State / region<Input name="state" autoComplete="address-level1" placeholder="IL" value={shippingRegion} onChange={(event) => setShippingRegion(event.target.value)} maxLength={30} required /></label>
                  <label>ZIP / postal code<Input name="postalCode" autoComplete="postal-code" inputMode="numeric" minLength={3} required /></label>
                  <label>Country<select name="country" autoComplete="country-name" value={shippingCountry} onChange={(event) => setShippingCountry(event.target.value)} required><option>United States</option><option>Canada</option><option>United Kingdom</option><option>European Union</option><option>Rest of world</option></select></label>
                </div>
                <Button className="checkout-next" type="submit" size="lg">Continue to payment <ArrowRight aria-hidden="true" /></Button>
              </form>
            )}

            {checkoutStep === 'payment' && (
              <form className="checkout-form" onSubmit={completeOrder}>
                <button className="checkout-back" type="button" onClick={() => setCheckoutStep('delivery')}><ArrowLeft aria-hidden="true" /> Delivery</button>
                <header><p>Step 02</p><h2>Complete your order.</h2></header>
                <div className="payment-banner"><CreditCard aria-hidden="true" /><span><strong>Secure card payment</strong><small>Preview only — no payment will be processed.</small></span></div>
                <div className="field-grid">
                  <label className="field-wide">Name on card<Input name="cardName" autoComplete="cc-name" required /></label>
                  <label className="field-wide">Card number<Input name="cardNumber" autoComplete="cc-number" inputMode="numeric" placeholder="4242 4242 4242 4242" minLength={15} required /></label>
                  <label>Expiration<Input name="expiry" autoComplete="cc-exp" placeholder="MM / YY" required /></label>
                  <label>Security code<Input name="cvc" autoComplete="cc-csc" inputMode="numeric" placeholder="CVC" minLength={3} maxLength={4} required /></label>
                </div>
                <Button className="checkout-next" type="submit" size="lg"><LockKeyhole aria-hidden="true" /> Pay ${orderTotal.toFixed(2)}</Button>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="order-success">
                <span className="success-mark"><Check aria-hidden="true" /></span>
                <p>Order {completedOrder.number}</p>
                <h2>It’s yours.</h2>
                <p className="success-copy">Your Scallium order is confirmed. A receipt and delivery update would be sent to your email.</p>
                <strong>${completedOrder.total.toFixed(2)}</strong>
                <div className="order-comms"><span><Check aria-hidden="true" /><b>Confirmation</b>Receipt sent immediately</span><span><span>02</span><b>Dispatch</b>Tracking sent when packed</span><span><span>03</span><b>Delivery</b>Arrival update from the carrier</span></div>
                <Button onClick={() => setCheckoutOpen(false)}>Continue shopping</Button>
              </div>
            )}
          </section>

          {checkoutStep !== 'success' && <aside className="checkout-summary">
            <p className="checkout-summary-kicker">Order summary</p>
            {cartItems.map((item) => {
              const colorway = colorways[item.colorIndex];
              return (
                <div className="summary-item" key={item.id}>
                  <span className="summary-image"><img src={colorway.front} alt="" /><b>{item.quantity}</b></span>
                  <span><strong>Classic {colorway.displayName} Heavy Tee</strong><small>{colorway.name} / {item.size}</small></span>
                  <strong>${(item.quantity * 68).toFixed(2)}</strong>
                </div>
              );
            })}
            <dl className="checkout-totals">
              <div><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              <div><dt>Shipping</dt><dd>{shipping ? `$${shipping.toFixed(2)}` : 'Complimentary'}</dd></div>
              <div><dt>Estimated tax</dt><dd>${estimatedTax.toFixed(2)}</dd></div>
              <div className="checkout-total"><dt>Total</dt><dd>USD ${orderTotal.toFixed(2)}</dd></div>
            </dl>
            <p className="duties-note">{shippingCountry === 'United States' ? 'Taxes estimated from the delivery state. Final amount is confirmed before payment.' : 'International duties and brokerage may be collected by the destination carrier.'}</p>
            <p className="checkout-promise"><LockKeyhole aria-hidden="true" /> Encrypted checkout · 30-day returns</p>
          </aside>}
        </DialogContent>
      </Dialog>

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
      <PolicyCenterDialog open={policiesOpen} onOpenChange={setPoliciesOpen} />

      <output className="sr-only" aria-live="polite">
        {added ? `Classic ${activeColor.displayName} Heavy Tee in size ${selectedSize} added to bag.` : ''}
      </output>
    </main>
  );
}
