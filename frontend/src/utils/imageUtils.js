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
  'electronic': 'https://placehold.co/600x400?text=Electronics',
  'tech': 'https://placehold.co/600x400?text=Electronics',
  'fashion': 'https://placehold.co/600x400?text=Fashion',
  'cloth': 'https://placehold.co/600x400?text=Fashion',
  'women': 'https://placehold.co/600x400?text=Women%27s+Wear',
  'men\'s': 'https://placehold.co/600x400?text=Men%27s+Wear',
  'ethnic': 'https://placehold.co/600x400?text=Ethnic+Wear',
  'shoe': 'https://placehold.co/600x400?text=Shoes',
  'footwear': 'https://placehold.co/600x400?text=Footwear',
  'grocer': 'https://placehold.co/600x400?text=Grocery',
  'food': 'https://placehold.co/600x400?text=Grocery',
  'book': 'https://placehold.co/600x400?text=Books',
  'furniture': 'https://placehold.co/600x400?text=Furniture',
  'beauty': 'https://placehold.co/600x400?text=Beauty',
  'makeup': 'https://placehold.co/600x400?text=Beauty',
  'cosmetic': 'https://placehold.co/600x400?text=Beauty',
  'sport': 'https://placehold.co/600x400?text=Sports',
  'activewear': 'https://placehold.co/600x400?text=Activewear',
  'gym': 'https://placehold.co/600x400?text=Activewear',
  'yoga': 'https://placehold.co/600x400?text=Activewear',
  'outdoor': 'https://placehold.co/600x400?text=Sports',
  'home appliance': 'https://placehold.co/600x400?text=Home+Appliances',
  'appliance': 'https://placehold.co/600x400?text=Home+Appliances',
  'mobile': 'https://placehold.co/600x400?text=Mobiles',
  'phone': 'https://placehold.co/600x400?text=Mobiles',
  'laptop': 'https://placehold.co/600x400?text=Laptops',
  'computer': 'https://placehold.co/600x400?text=Laptops',
  'watch': 'https://placehold.co/600x400?text=Watches',
  'toy': 'https://placehold.co/600x400?text=Toys',
  'kid': 'https://placehold.co/600x400?text=Kids+Fashion',
  'kitchen': 'https://placehold.co/600x400?text=Kitchen',
  'bag': 'https://placehold.co/600x400?text=Bags',
  'handbag': 'https://placehold.co/600x400?text=Bags',
  'backpack': 'https://placehold.co/600x400?text=Bags',
  'health': 'https://placehold.co/600x400?text=Health+Care',
  'medical': 'https://placehold.co/600x400?text=Health+Care',
  'jewel': 'https://placehold.co/600x400?text=Jewellery',
  'ring': 'https://placehold.co/600x400?text=Jewellery',
  'necklace': 'https://placehold.co/600x400?text=Jewellery',
  'earring': 'https://placehold.co/600x400?text=Jewellery',
  'stationery': 'https://placehold.co/600x400?text=Stationery',
  'pen': 'https://placehold.co/600x400?text=Stationery',
  'auto': 'https://placehold.co/600x400?text=Automotive',
  'car': 'https://placehold.co/600x400?text=Automotive',
  'bike': 'https://placehold.co/600x400?text=Automotive',
  'pet': 'https://placehold.co/600x400?text=Pet+Supplies',
  'sunglass': 'https://placehold.co/600x400?text=Sunglasses',
  'winter': 'https://placehold.co/600x400?text=Winter+Wear',
  'jacket': 'https://placehold.co/600x400?text=Winter+Wear',
  'sweater': 'https://placehold.co/600x400?text=Winter+Wear',
  'perfume': 'https://placehold.co/600x400?text=Beauty',
  'fragrance': 'https://placehold.co/600x400?text=Beauty',
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
