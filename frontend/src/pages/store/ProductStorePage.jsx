import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productAPI } from "../../services/api.js";
import StorefrontPage from "./StorefrontPage.jsx";
import { Helmet } from "react-helmet-async";

export default function ProductStorePage() {
  const { storeName, productId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["store-product", storeName, productId],
    queryFn: () =>
      productAPI.getStoreProduct(storeName, productId).then((r) => r.data),
  });

  const product = data?.product;
  const store = data?.store;

  const seoTitle =
    product && store ? `${product.name} — ${store.name}` : "Trackeet Store";
  const seoDesc = product
    ? product.description ||
      `Buy ${product.name} from ${store?.name}. Order via WhatsApp instantly.`
    : "Shop on Trackeet";
  const seoImage =
    product?.images?.[0] ||
    store?.logo ||
    "https://gettrackeet.com/og-default.png";
  const seoUrl = `https://gettrackeet.com/store/${storeName}/product/${productId}`;

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!data?.product)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Trackeet" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
      </Helmet>
      <StorefrontPage defaultProduct={data.product} />
    </>
  );
}
