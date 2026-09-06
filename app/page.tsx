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
  House,
  LockKeyhole,
  Minus,
  Plus,
  Shirt,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const withBasePath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;

const sizes = ['S', 'M', 'L', 'XL'] as const;
type Size = (typeof sizes)[number];
type GarmentSide = 'front' | 'back';
type BackLogoChoice = 'wordmark' | 'plain';
type ProductId = 'heavy-tee' | 'baggy-sweatpants' | 'relaxed-shorts';
type ProductMedia = {
  src: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    sourceWidth: number;
    sourceHeight: number;
  };
};
type ProductColorway = {
  name: string;
  displayName: string;
  tone: string;
  front: ProductMedia;
  back: ProductMedia;
  plainBack?: ProductMedia;
};
type Product = {
  id: ProductId;
  name: string;
  groupLabel: string;
  price: number;
  weight: string;
  material: string;
  description: string;
  note: string;
  backLogoOptional?: boolean;
  colorways: ProductColorway[];
};
type CartItem = {
  id: string;
  productId: ProductId;
  colorIndex: number;
  size: Size;
  backLogo?: BackLogoChoice;
  quantity: number;
};
type CheckoutStep = 'payment' | 'success';

const productionCheckoutApi = 'https://scalliom.vercel.app/api';

const imageMedia = (path: string): ProductMedia => ({
  src: withBasePath(path),
});
const cropMedia = (
  path: string,
  x: number,
  y: number,
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
): ProductMedia => ({
  src: withBasePath(path),
  crop: { x, y, width, height, sourceWidth, sourceHeight },
});

const teeColorways: ProductColorway[] = [
  {
    name: 'Ink',
    displayName: 'Black',
    tone: '#151515',
    front: imageMedia('/products/scallium-black-front.png'),
    back: imageMedia('/products/scallium-black-back.png'),
    plainBack: imageMedia('/products/scallium-black-back-plain.png'),
  },
  {
    name: 'Dune',
    displayName: 'Dune',
    tone: '#b8966e',
    front: imageMedia('/products/scallium-dune-front.png'),
    back: imageMedia('/products/scallium-dune-back.png'),
    plainBack: imageMedia('/products/scallium-dune-back-plain.png'),
  },
  {
    name: 'Bone',
    displayName: 'Bone',
    tone: '#e7e1d7',
    front: imageMedia('/products/scallium-bone-front.png'),
    back: imageMedia('/products/scallium-bone-back.png'),
    plainBack: imageMedia('/products/scallium-bone-back-plain.png'),
  },
];

const lowerColorways = (
  path: string,
  sourceHeight: number,
  cropY: number,
  cropHeight: number,
): ProductColorway[] => [
  {
    name: 'Black',
    displayName: 'Black',
    tone: '#151515',
    front: cropMedia(path, 0, cropY, 196.5, cropHeight, 1179, sourceHeight),
    back: cropMedia(path, 196.5, cropY, 196.5, cropHeight, 1179, sourceHeight),
  },
  {
    name: 'Brown',
    displayName: 'Brown',
    tone: '#3a271f',
    front: cropMedia(path, 393, cropY, 196.5, cropHeight, 1179, sourceHeight),
    back: cropMedia(path, 589.5, cropY, 196.5, cropHeight, 1179, sourceHeight),
  },
  {
    name: 'Bone',
    displayName: 'Bone',
    tone: '#e7dfcf',
    front: cropMedia(path, 786, cropY, 196.5, cropHeight, 1179, sourceHeight),
    back: cropMedia(path, 982.5, cropY, 196.5, cropHeight, 1179, sourceHeight),
  },
];

const products: Product[] = [
  {
    id: 'heavy-tee',
    name: 'Heavy Tee',
    groupLabel: 'Classic Heavy Tees',
    price: 50,
    weight: '450 GSM',
    material: '100% combed cotton jersey',
    description:
      'A dense, garment-washed jersey with a composed drape and a relaxed, boxed silhouette.',
    note: 'SM front / Selectable back',
    backLogoOptional: true,
    colorways: teeColorways,
  },
  {
    id: 'baggy-sweatpants',
    name: 'Baggy Sweatpants',
    groupLabel: 'Baggy Sweatpants',
    price: 75,
    weight: '500 GSM',
    material: '80% cotton / 20% recycled polyester fleece',
    description:
      'Heavy brushed fleece with a deep rise, relaxed leg, elastic waist, and long stacked break.',
    note: 'SM front / SCALLIOM back',
    colorways: lowerColorways(
      '/products/scallium-baggy-sweatpants-reference.jpg',
      786,
      42,
      484,
    ),
  },
  {
    id: 'relaxed-shorts',
    name: 'Relaxed Shorts',
    groupLabel: 'Relaxed Shorts',
    price: 50,
    weight: '450 GSM',
    material: '80% cotton / 20% recycled polyester fleece',
    description:
      'Structured fleece shorts with a relaxed leg, soft interior, elastic waist, and tonal drawcord.',
    note: 'Relic SM front / SCALLIOM back',
    colorways: lowerColorways(
      '/products/scallium-relaxed-shorts-reference.jpg',
      413,
      28,
      210,
    ),
  },
];

const getProduct = (productId: ProductId) =>
  products.find((product) => product.id === productId) ?? products[0];
const productTitle = (product: Product, colorway: ProductColorway) =>
  product.id === 'heavy-tee'
    ? `Classic ${colorway.displayName} ${product.name}`
    : `${colorway.displayName} ${product.name}`;
const getProductMedia = (
  product: Product,
  colorway: ProductColorway,
  side: GarmentSide,
  backLogo: BackLogoChoice = 'wordmark',
) =>
  side === 'back' && product.backLogoOptional && backLogo === 'plain'
    ? (colorway.plainBack ?? colorway.back)
    : colorway[side];

type ModelTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};

type ModelContext = {
  registerTool: (
    tool: ModelTool,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

function Monogram() {
  return (
    <span className="monogram" aria-hidden="true">
      <span>S</span>
      <span>M</span>
    </span>
  );
}

function CheckoutMotionMark({ opening }: { opening: boolean }) {
  return (
    <div
      className={`checkout-motion-mark${opening ? ' is-opening' : ''}`}
      aria-hidden="true"
    >
      <span className="checkout-orbit checkout-orbit-one" />
      <span className="checkout-orbit checkout-orbit-two" />
      <span className="checkout-letter checkout-letter-s">S</span>
      <span className="checkout-letter checkout-letter-m">M</span>
      <span className="checkout-motion-caption">SCALLIOM / SECURE</span>
    </div>
  );
}

function ProductMediaView({
  media,
  alt,
  className,
}: {
  media: ProductMedia;
  alt: string;
  className?: string;
}) {
  if (!media.crop)
    return <img className={className} src={media.src} alt={alt} />;

  const { x, y, width, height, sourceWidth, sourceHeight } = media.crop;
  return (
    <svg
      className={className}
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={alt}
    >
      <image href={media.src} width={sourceWidth} height={sourceHeight} />
    </svg>
  );
}

function DepthCarousel({
  product,
  selected,
  onSelect,
  side,
  backLogo,
}: {
  product: Product;
  selected: number;
  onSelect: (index: number) => void;
  side: GarmentSide;
  backLogo: BackLogoChoice;
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
        {product.colorways.map((colorway, index) => {
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
              <ProductMediaView
                media={getProductMedia(product, colorway, side, backLogo)}
                alt={`${side === 'front' ? 'Front' : 'Back'} view of the ${colorway.displayName.toLowerCase()} Scallium ${product.name.toLowerCase()}`}
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
          onClick={() =>
            onSelect(
              (selected + product.colorways.length - 1) %
                product.colorways.length,
            )
          }
          aria-label="Previous color"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <p>
          <span>{String(selected + 1).padStart(2, '0')}</span> / 0
          {product.colorways.length}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelect((selected + 1) % product.colorways.length)}
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
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('payment');
  const [selectedProductId, setSelectedProductId] =
    useState<ProductId>('heavy-tee');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [garmentSide, setGarmentSide] = useState<GarmentSide>('front');
  const [backLogo, setBackLogo] = useState<BackLogoChoice>('wordmark');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [added, setAdded] = useState(false);
  const [completedOrder, setCompletedOrder] = useState({
    number: '',
    total: 0,
  });
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const activeProduct = getProduct(selectedProductId);
  const activeColor =
    activeProduct.colorways[selectedColor] ?? activeProduct.colorways[0];
  const bagCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.quantity * getProduct(item.productId).price,
    0,
  );

  const openProduct = (productId: ProductId, index: number) => {
    setSelectedProductId(productId);
    setSelectedColor(index);
    setGarmentSide('front');
    setBackLogo('wordmark');
    setAdded(false);
    setProductOpen(true);
  };

  const addCartItem = (
    productId: ProductId,
    colorIndex: number,
    size: Size,
    logo: BackLogoChoice = 'wordmark',
  ) => {
    const product = getProduct(productId);
    const backChoice = product.backLogoOptional ? logo : 'wordmark';
    const id = `${productId}-${colorIndex}-${size}-${backChoice}`;
    setCartItems((items) => {
      const existing = items.find((item) => item.id === id);
      if (existing) {
        return items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...items,
        { id, productId, colorIndex, size, backLogo: backChoice, quantity: 1 },
      ];
    });
  };

  const addToBag = () => {
    addCartItem(selectedProductId, selectedColor, selectedSize, backLogo);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + change } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const beginCheckout = () => {
    if (!cartItems.length) return;
    setCheckoutStep('payment');
    setCheckoutError('');
    setBagOpen(false);
    setCheckoutOpen(true);
  };

  const startStripeCheckout = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!cartItems.length || checkoutPending) return;

    setCheckoutPending(true);
    setCheckoutError('');

    try {
      const apiBase = window.location.hostname.endsWith('.vercel.app')
        ? `${window.location.origin}/api`
        : productionCheckoutApi;
      const response = await fetch(`${apiBase}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });
      const result = (await response.json()) as {
        error?: string;
        url?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Checkout could not be started.');
      }

      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Checkout could not be started.',
      );
      setCheckoutPending(false);
    }
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
        const storedItems = JSON.parse(storedCart) as Array<
          Partial<CartItem> &
            Pick<CartItem, 'id' | 'colorIndex' | 'size' | 'quantity'>
        >;
        setCartItems(
          storedItems.map((item) => ({
            ...item,
            productId: item.productId ?? 'heavy-tee',
            backLogo: item.backLogo ?? 'wordmark',
          })) as CartItem[],
        );
      } catch {
        window.localStorage.removeItem('scallium-cart');
      }
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (cartReady)
      window.localStorage.setItem('scallium-cart', JSON.stringify(cartItems));
  }, [cartItems, cartReady]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutResult = params.get('checkout');
    const sessionId = params.get('session_id');

    if (checkoutResult === 'cancelled') {
      setCheckoutError('Checkout was cancelled. Your bag is still saved.');
      setBagOpen(true);
      window.history.replaceState({}, '', `${window.location.pathname}#shop`);
      return;
    }

    if (checkoutResult !== 'success' || !sessionId) return;

    const apiBase = window.location.hostname.endsWith('.vercel.app')
      ? `${window.location.origin}/api`
      : productionCheckoutApi;

    void fetch(
      `${apiBase}/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
    )
      .then(async (response) => {
        const result = (await response.json()) as {
          amountTotal?: number;
          orderNumber?: string;
          paymentStatus?: string;
        };

        if (!response.ok || result.paymentStatus !== 'paid') {
          throw new Error(
            'Payment confirmation is still pending. Check your Stripe receipt before retrying.',
          );
        }

        setCompletedOrder({
          number:
            result.orderNumber ?? `SC-${sessionId.slice(-8).toUpperCase()}`,
          total: (result.amountTotal ?? 0) / 100,
        });
        setCartItems([]);
        setCheckoutStep('success');
        setCheckoutOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch((error: unknown) => {
        setCheckoutError(
          error instanceof Error
            ? error.message
            : 'Payment confirmation could not be loaded.',
        );
        setCheckoutStep('payment');
        setCheckoutOpen(true);
      });
  }, []);

  useEffect(() => {
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();

    void Promise.resolve(
      modelContext.registerTool(
        {
          name: 'add_classic_heavy_tee_to_bag',
          title: 'Add Classic Heavy Tee to bag',
          description:
            'Adds one Scallium Classic Heavy Tee to the visible bag in a chosen color and size.',
          inputSchema: {
            type: 'object',
            properties: {
              color: {
                type: 'string',
                enum: teeColorways.map((colorway) => colorway.name),
              },
              size: { type: 'string', enum: sizes },
            },
            required: ['color', 'size'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            const selection = input as { color?: string; size?: string };
            const colorIndex = teeColorways.findIndex(
              (colorway) => colorway.name === selection.color,
            );
            if (colorIndex < 0 || !sizes.includes(selection.size as Size)) {
              throw new Error('Choose a valid color and size.');
            }
            setSelectedColor(colorIndex);
            setSelectedSize(selection.size as Size);
            addCartItem(
              'heavy-tee',
              colorIndex,
              selection.size as Size,
              'wordmark',
            );
            setAdded(true);
            return {
              product: 'Classic Heavy Tee',
              color: selection.color,
              size: selection.size,
              status: 'added',
            };
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
          <a href="#home">
            <span className="nav-icon">
              <House aria-hidden="true" />
            </span>
            <span>Home</span>
          </a>
          <a href="#shop">
            <span className="nav-icon">
              <Shirt aria-hidden="true" />
            </span>
            <span>Shop</span>
          </a>
          <a href="#story">
            <span className="nav-icon">
              <BookOpenText aria-hidden="true" />
            </span>
            <span>Our story</span>
          </a>
        </nav>

        <Button
          variant="ghost"
          className="bag-button"
          onClick={() => setBagOpen(true)}
          aria-label={`Shopping bag, ${bagCount} item${bagCount === 1 ? '' : 's'}`}
        >
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
            Essential silhouettes cut from substantial cloth. Designed to settle
            in, wear out, and stay in rotation.
          </p>
          <div className="hero-actions">
            <Button
              className="primary-cta"
              size="lg"
              onClick={() =>
                document
                  .querySelector('#shop')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Shop edition 001
              <ArrowUpRight aria-hidden="true" />
            </Button>
            <a className="text-link" href="#story">
              Discover the fabric <ArrowDown aria-hidden="true" />
            </a>
          </div>
        </div>

        <button
          className="hero-visual holo-surface"
          onClick={() => openProduct('heavy-tee', 0)}
          aria-label="View Classic Black Heavy Tee"
        >
          <span className="edition-tag">
            <span>01</span>
            <span>First edition</span>
          </span>
          <span className="hero-image-frame">
            <ProductMediaView
              className="garment-front"
              media={teeColorways[0].front}
              alt="Front view of the black Scallium shirt with only the SM logo"
            />
            <ProductMediaView
              className="garment-back"
              media={teeColorways[0].back}
              alt="Back view of the black Scallium shirt with the SCALLIOM wordmark"
            />
            <span className="view-cue">Hover to view back</span>
          </span>
          <span className="hero-product-meta">
            <span>
              <strong>Classic Black Heavy Tee</strong>
              <small>450 GSM / Ink</small>
            </span>
            <strong>${products[0].price}</strong>
          </span>
        </button>
      </section>

      <section
        className="collection"
        id="shop"
        aria-labelledby="collection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Scallium / 001</p>
            <h2 id="collection-title">First Edition</h2>
          </div>
          <p>Three silhouettes. Nine tonal studies.</p>
        </div>

        <div className="catalog-groups">
          {products.map((product, productIndex) => (
            <section
              className="catalog-group"
              key={product.id}
              aria-labelledby={`${product.id}-title`}
            >
              <header className="catalog-group-heading">
                <p>{String(productIndex + 1).padStart(2, '0')}</p>
                <h3 id={`${product.id}-title`}>{product.groupLabel}</h3>
                <span>
                  {product.weight} / {product.material}
                </span>
              </header>
              <div className="product-grid">
                {product.colorways.map((colorway, index) => (
                  <button
                    className="product-card holo-surface"
                    key={colorway.name}
                    onClick={() => openProduct(product.id, index)}
                  >
                    <span className="product-image-wrap">
                      <ProductMediaView
                        className="garment-front"
                        media={colorway.front}
                        alt={`Front view of the ${colorway.displayName.toLowerCase()} Scallium ${product.name.toLowerCase()}`}
                      />
                      <ProductMediaView
                        className="garment-back"
                        media={colorway.back}
                        alt={`Back view of the ${colorway.displayName.toLowerCase()} Scallium ${product.name.toLowerCase()}`}
                      />
                      <span className="product-action">
                        View piece <ArrowUpRight aria-hidden="true" />
                      </span>
                      <span className="view-cue">Front / Back</span>
                    </span>
                    <span className="product-info">
                      <span>
                        <strong>{productTitle(product, colorway)}</strong>
                        <small>{colorway.name}</small>
                      </span>
                      <strong>${product.price}</strong>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <ProductDetailSection
        onSizeGuide={() => setSizeGuideOpen(true)}
        onOpenProduct={() => openProduct('heavy-tee', 0)}
      />

      <section className="story" id="story">
        <div className="story-mark">
          <Monogram />
        </div>
        <p className="story-kicker">The quiet is the point.</p>
        <h2>Best of Both Worlds</h2>
        <div className="story-details">
          <p>
            Scallium begins with the things that matter after the first wear:
            balance, hand-feel, and a cut that holds its shape.
          </p>
          <dl>
            <div>
              <dt>Weight</dt>
              <dd>450 GSM</dd>
            </div>
            <div>
              <dt>Cut</dt>
              <dd>Relaxed / Boxed</dd>
            </div>
            <div>
              <dt>Finish</dt>
              <dd>Garment washed</dd>
            </div>
          </dl>
        </div>
      </section>

      <BrandWorldSection />
      <NewsletterSection />

      <footer className="site-footer">
        <a className="brand-lockup" href="#home">
          <Monogram />
          <span className="brand-wordmark">SCALLIOM</span>
        </a>
        <p>© 2026 Scallium Studio</p>
        <div className="footer-links">
          <button type="button" onClick={() => setPoliciesOpen(true)}>
            Policies & care
          </button>
          <a href="#newsletter">Launch updates</a>
        </div>
      </footer>

      <div className="side-note" aria-hidden="true">
        CHICAGO / 41.8781° N
      </div>

      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="product-dialog" showCloseButton>
          <DialogTitle className="sr-only">
            {productTitle(activeProduct, activeColor)}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a Scallium {activeProduct.name} color, view, and size.
          </DialogDescription>

          <DepthCarousel
            product={activeProduct}
            selected={selectedColor}
            onSelect={setSelectedColor}
            side={garmentSide}
            backLogo={backLogo}
          />

          <div className="product-panel">
            <p className="product-index">
              Edition 001 / {String(selectedColor + 1).padStart(2, '0')}
            </p>
            <h2>{productTitle(activeProduct, activeColor)}</h2>
            <p className="product-price">${activeProduct.price}</p>
            <p className="product-copy">{activeProduct.description}</p>

            <fieldset className="option-group view-options">
              <legend>
                View — <span>{garmentSide}</span>
              </legend>
              <div className="size-options">
                <button
                  type="button"
                  aria-pressed={garmentSide === 'front'}
                  onClick={() => setGarmentSide('front')}
                >
                  Front
                </button>
                <button
                  type="button"
                  aria-pressed={garmentSide === 'back'}
                  onClick={() => setGarmentSide('back')}
                >
                  Back
                </button>
              </div>
            </fieldset>

            {activeProduct.backLogoOptional && (
              <fieldset className="option-group back-logo-options">
                <legend>
                  Back design —{' '}
                  <span>
                    {backLogo === 'wordmark'
                      ? 'SCALLIOM wordmark'
                      : 'Plain back'}
                  </span>
                </legend>
                <div className="size-options">
                  <button
                    type="button"
                    aria-pressed={backLogo === 'wordmark'}
                    onClick={() => {
                      setBackLogo('wordmark');
                      setGarmentSide('back');
                    }}
                  >
                    Keep SCALLIOM
                  </button>
                  <button
                    type="button"
                    aria-pressed={backLogo === 'plain'}
                    onClick={() => {
                      setBackLogo('plain');
                      setGarmentSide('back');
                    }}
                  >
                    No back logo
                  </button>
                </div>
              </fieldset>
            )}

            <fieldset className="option-group">
              <legend>
                Color — <span>{activeColor.name}</span>
              </legend>
              <div className="color-options">
                {activeProduct.colorways.map((colorway, index) => (
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
              <legend>
                Size — <span>{selectedSize}</span>
                <button
                  className="size-guide-link"
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  Size guide
                </button>
              </legend>
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    aria-pressed={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span>{size}</span>
                    <small>
                      {size === 'XL' && activeColor.name === 'Ink'
                        ? 'Low'
                        : 'In stock'}
                    </small>
                  </button>
                ))}
              </div>
            </fieldset>

            <Button className="add-button" size="lg" onClick={addToBag}>
              {added ? (
                <>
                  <Check aria-hidden="true" /> Added to bag
                </>
              ) : (
                <>
                  Add to bag <span>${activeProduct.price}</span>
                </>
              )}
            </Button>

            <div className="product-notes">
              <span>{activeProduct.material}</span>
              <span>{activeProduct.note}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="bag-sheet" side="right">
          <SheetHeader className="bag-header">
            <p className="bag-kicker">Scallium / Your selection</p>
            <SheetTitle>
              Your bag <span>{bagCount}</span>
            </SheetTitle>
            <SheetDescription>
              {bagCount
                ? 'Your first-edition pieces are reserved for checkout.'
                : 'Your bag is waiting for its first piece.'}
            </SheetDescription>
          </SheetHeader>

          <div className="bag-body">
            {cartItems.length ? (
              cartItems.map((item) => {
                const product = getProduct(item.productId);
                const colorway =
                  product.colorways[item.colorIndex] ?? product.colorways[0];
                return (
                  <article className="bag-item" key={item.id}>
                    <ProductMediaView
                      media={colorway.front}
                      alt={`Front of the ${colorway.displayName} Scallium ${product.name.toLowerCase()}`}
                    />
                    <div className="bag-item-copy">
                      <div>
                        <h3>{productTitle(product, colorway)}</h3>
                        <p>
                          {colorway.name} / Size {item.size}
                          {product.backLogoOptional
                            ? ` / ${item.backLogo === 'plain' ? 'Plain back' : 'SCALLIOM back'}`
                            : ''}
                        </p>
                      </div>
                      <div className="bag-item-actions">
                        <div
                          className="quantity-control"
                          aria-label={`Quantity for ${colorway.displayName} ${product.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus aria-hidden="true" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          className="remove-item"
                          type="button"
                          onClick={() =>
                            setCartItems((items) =>
                              items.filter(
                                (candidate) => candidate.id !== item.id,
                              ),
                            )
                          }
                          aria-label={`Remove ${colorway.displayName} ${product.name}`}
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <strong className="bag-line-price">
                      ${item.quantity * product.price}
                    </strong>
                  </article>
                );
              })
            ) : (
              <div className="empty-bag">
                <ShoppingBag aria-hidden="true" />
                <h3>No pieces added yet</h3>
                <p>Explore First Edition and choose your color and size.</p>
                <Button
                  onClick={() => {
                    setBagOpen(false);
                    document
                      .querySelector('#shop')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Shop First Edition
                </Button>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <SheetFooter className="bag-footer">
              <div className="bag-totals">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
                <small>Your final order total is shown before payment.</small>
              </div>
              <Button
                className="checkout-button"
                size="lg"
                onClick={beginCheckout}
              >
                Pay Now <ArrowRight aria-hidden="true" />
              </Button>
              <p className="secure-note">
                <LockKeyhole aria-hidden="true" /> Payment processed securely by
                Stripe
              </p>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open && checkoutStep === 'success') setCheckoutStep('payment');
        }}
      >
        <DialogContent
          className={`checkout-dialog ${checkoutStep === 'success' ? 'checkout-complete' : ''}`}
          showCloseButton={checkoutStep !== 'success'}
        >
          <DialogTitle className="sr-only">Scallium checkout</DialogTitle>
          <DialogDescription className="sr-only">
            Review your order and pay now.
          </DialogDescription>

          <section className="checkout-main">
            <div className="checkout-brand">
              <Monogram />
              <span>SCALLIOM</span>
            </div>

            {checkoutStep === 'payment' && (
              <form className="checkout-form" onSubmit={startStripeCheckout}>
                <CheckoutMotionMark opening={checkoutPending} />
                <header className="checkout-pay-header">
                  <p>SCALLIOM / Final step</p>
                  <h2>
                    Almost <em>yours.</em>
                  </h2>
                  <span>
                    Your selection is ready. Continue into SCALLIOM&apos;s
                    encrypted Stripe checkout.
                  </span>
                </header>
                {checkoutError && (
                  <p className="checkout-error" role="alert">
                    {checkoutError}
                  </p>
                )}
                <div className="checkout-total-reveal">
                  <span>Total due</span>
                  <strong>USD ${subtotal.toFixed(2)}</strong>
                </div>
                <Button
                  className="checkout-next"
                  type="submit"
                  size="lg"
                  disabled={checkoutPending}
                >
                  <span>
                    <LockKeyhole aria-hidden="true" />
                    {checkoutPending ? 'Opening payment…' : 'Pay Now'}
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Button>
                <p className="checkout-microcopy">
                  Secure payment · Your bag stays saved if you return
                </p>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="order-success">
                <span className="success-mark">
                  <Check aria-hidden="true" />
                </span>
                <p>Order {completedOrder.number}</p>
                <h2>It’s yours.</h2>
                <p className="success-copy">
                  Your Scallium order is confirmed. A receipt and delivery
                  update would be sent to your email.
                </p>
                <strong>${completedOrder.total.toFixed(2)}</strong>
                <div className="order-comms">
                  <span>
                    <Check aria-hidden="true" />
                    <b>Confirmation</b>Receipt sent immediately
                  </span>
                  <span>
                    <span>02</span>
                    <b>Dispatch</b>Tracking sent when packed
                  </span>
                  <span>
                    <span>03</span>
                    <b>Delivery</b>Arrival update from the carrier
                  </span>
                </div>
                <Button onClick={() => setCheckoutOpen(false)}>
                  Continue shopping
                </Button>
              </div>
            )}
          </section>

          {checkoutStep !== 'success' && (
            <aside className="checkout-summary">
              <p className="checkout-summary-kicker">Order summary</p>
              {cartItems.map((item) => {
                const product = getProduct(item.productId);
                const colorway =
                  product.colorways[item.colorIndex] ?? product.colorways[0];
                return (
                  <div className="summary-item" key={item.id}>
                    <span className="summary-image">
                      <ProductMediaView media={colorway.front} alt="" />
                      <b>{item.quantity}</b>
                    </span>
                    <span>
                      <strong>{productTitle(product, colorway)}</strong>
                      <small>
                        {colorway.name} / {item.size}
                      </small>
                    </span>
                    <strong>
                      ${(item.quantity * product.price).toFixed(2)}
                    </strong>
                  </div>
                );
              })}
              <dl className="checkout-totals">
                <div className="checkout-total">
                  <dt>Total</dt>
                  <dd>USD ${subtotal.toFixed(2)}</dd>
                </div>
              </dl>
              <p className="checkout-promise">
                <LockKeyhole aria-hidden="true" /> Encrypted checkout · 30-day
                returns
              </p>
            </aside>
          )}
        </DialogContent>
      </Dialog>

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
      <PolicyCenterDialog open={policiesOpen} onOpenChange={setPoliciesOpen} />

      <output className="sr-only" aria-live="polite">
        {added
          ? `${productTitle(activeProduct, activeColor)} in size ${selectedSize} added to bag.`
          : ''}
      </output>
    </main>
  );
}
