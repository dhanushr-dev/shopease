/**
 * Image utility helpers for product and category fallback images.
 * Provides category-aware fallback URLs when images are missing or broken.
 */

const PRODUCT_FALLBACKS = {
  'electronic': 'https://placehold.co/600x600?text=Electronics',
  'tech': 'https://placehold.co/600x600?text=Electronics',
  'fashion': 'https://placehold.co/600x600?text=Fashion',
  'cloth': 'https://placehold.co/600x600?text=Fashion',
  'women': 'https://placehold.co/600x600?text=Women%27s+Wear',
  'men\'s': 'https://placehold.co/600x600?text=Men%27s+Wear',
  'ethnic': 'https://placehold.co/600x600?text=Ethnic+Wear',
  'shoe': 'https://placehold.co/600x600?text=Shoes',
  'footwear': 'https://placehold.co/600x600?text=Footwear',
  'grocer': 'https://placehold.co/600x600?text=Grocery',
  'food': 'https://placehold.co/600x600?text=Grocery',
  'book': 'https://placehold.co/600x600?text=Books',
  'furniture': 'https://placehold.co/600x600?text=Furniture',
  'beauty': 'https://placehold.co/600x600?text=Beauty',
  'makeup': 'https://placehold.co/600x600?text=Beauty',
  'cosmetic': 'https://placehold.co/600x600?text=Beauty',
  'sport': 'https://placehold.co/600x600?text=Sports',
  'activewear': 'https://placehold.co/600x600?text=Activewear',
  'gym': 'https://placehold.co/600x600?text=Activewear',
  'yoga': 'https://placehold.co/600x600?text=Activewear',
  'outdoor': 'https://placehold.co/600x600?text=Sports',
  'home appliance': 'https://placehold.co/600x600?text=Home+Appliances',
  'appliance': 'https://placehold.co/600x600?text=Home+Appliances',
  'mobile': 'https://placehold.co/600x600?text=Mobiles',
  'phone': 'https://placehold.co/600x600?text=Mobiles',
  'laptop': 'https://placehold.co/600x600?text=Laptops',
  'computer': 'https://placehold.co/600x600?text=Laptops',
  'watch': 'https://placehold.co/600x600?text=Watches',
  'toy': 'https://placehold.co/600x600?text=Toys',
  'kid': 'https://placehold.co/600x600?text=Kids+Fashion',
  'kitchen': 'https://placehold.co/600x600?text=Kitchen',
  'bag': 'https://placehold.co/600x600?text=Bags',
  'handbag': 'https://placehold.co/600x600?text=Bags',
  'backpack': 'https://placehold.co/600x600?text=Bags',
  'health': 'https://placehold.co/600x600?text=Health+Care',
  'medical': 'https://placehold.co/600x600?text=Health+Care',
  'jewel': 'https://placehold.co/600x600?text=Jewellery',
  'ring': 'https://placehold.co/600x600?text=Jewellery',
  'necklace': 'https://placehold.co/600x600?text=Jewellery',
  'earring': 'https://placehold.co/600x600?text=Jewellery',
  'stationery': 'https://placehold.co/600x600?text=Stationery',
  'pen': 'https://placehold.co/600x600?text=Stationery',
  'auto': 'https://placehold.co/600x600?text=Automotive',
  'car': 'https://placehold.co/600x600?text=Automotive',
  'bike': 'https://placehold.co/600x600?text=Automotive',
  'pet': 'https://placehold.co/600x600?text=Pet+Supplies',
  'sunglass': 'https://placehold.co/600x600?text=Sunglasses',
  'winter': 'https://placehold.co/600x600?text=Winter+Wear',
  'jacket': 'https://placehold.co/600x600?text=Winter+Wear',
  'sweater': 'https://placehold.co/600x600?text=Winter+Wear',
  'perfume': 'https://placehold.co/600x600?text=Beauty',
  'fragrance': 'https://placehold.co/600x600?text=Beauty',
};

const CATEGORY_FALLBACKS = {
  'electronic': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
  'tech': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
  'fashion': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
  'cloth': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
  'women': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
  'men\'s': 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=600&auto=format&fit=crop&q=80',
  'ethnic': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
  'shoe': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
  'footwear': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
  'grocer': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  'food': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  'book': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
  'furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80',
  'beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  'makeup': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  'cosmetic': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  'sport': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  'activewear': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  'gym': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  'yoga': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  'outdoor': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  'home appliance': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
  'appliance': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
  'mobile': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'laptop': 'https://images.unsplash.com/photo-1496181130204-755241544e3f?w=600&auto=format&fit=crop&q=80',
  'computer': 'https://images.unsplash.com/photo-1496181130204-755241544e3f?w=600&auto=format&fit=crop&q=80',
  'watch': 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80',
  'toy': 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80',
  'kid': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80',
  'kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  'bag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  'handbag': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  'backpack': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  'health': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
  'medical': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
  'jewel': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  'ring': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  'necklace': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  'earring': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  'stationery': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
  'pen': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
  'auto': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
  'car': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
  'bike': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
  'pet': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
  'sunglass': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
  'winter': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
  'jacket': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
  'sweater': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
  'perfume': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  'fragrance': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
};

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/600x600?text=ShopEase+Product';
const DEFAULT_CATEGORY_IMAGE = 'https://placehold.co/600x400?text=ShopEase+Category';

function matchFallback(categoryName, fallbackMap, defaultUrl) {
  const cat = (categoryName || '').toLowerCase();
  for (const [key, url] of Object.entries(fallbackMap)) {
    if (cat.includes(key)) return url;
  }
  return defaultUrl;
}

export const getFallbackImage = (categoryName) => {
  return matchFallback(categoryName, PRODUCT_FALLBACKS, DEFAULT_PRODUCT_IMAGE);
};

export const getCategoryImage = (categoryName, imageUrl) => {
  if (imageUrl && imageUrl.trim() !== '') return imageUrl;
  return matchFallback(categoryName, CATEGORY_FALLBACKS, DEFAULT_CATEGORY_IMAGE);
};

export const getProductImage = (product) => {
  if (product?.imageUrl && product.imageUrl.trim() !== '') return product.imageUrl;
  return getFallbackImage(product?.categoryName);
};

export const handleImageError = (e, categoryName) => {
  if (e.target.dataset.fallbackApplied) return;
  e.target.dataset.fallbackApplied = 'true';
  e.target.src = getFallbackImage(categoryName);
};

export const handleCategoryImageError = (e, categoryName) => {
  if (e.target.dataset.fallbackApplied) return;
  e.target.dataset.fallbackApplied = 'true';
  e.target.src = getCategoryImage(categoryName, null);
};

export const generateProductImageUrl = (name, categoryName, brand) => {
  return getFallbackImage(categoryName);
};
