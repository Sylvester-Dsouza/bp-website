export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  modelPath?: string;
  colors?: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  arModel?: string;
}

export const products: Product[] = [
  {
    id: "palm-leaf",
    name: "Satin Luxe Palm Leaf Balloon",
    description: "Elegant satin luxe palm leaf foil balloon, perfect for tropical themed parties, summer celebrations, and beach events. This premium quality balloon adds a touch of luxury to any space.",
    price: 12.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Green", "Gold"],
    inStock: true,
    rating: 4.8,
    reviews: 156,
    arModel: "/assets/Anagram Satin Luxe Palm Leaf.glb"
  },
  {
    id: "pastel-pink",
    name: "Satin Luxe Pastel Pink Balloon",
    description: "Beautiful satin luxe pastel pink foil balloon, ideal for baby showers, gender reveals, birthdays, and elegant celebrations. Features a premium finish that catches the light beautifully.",
    price: 9.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Pastel Pink", "Rose Gold"],
    inStock: true,
    rating: 4.9,
    reviews: 203,
    arModel: "/assets/Anagram Satin Satin Luxe Pastel Pink.glb"
  },
  {
    id: "balloon-bunch",
    name: "Full Balloon Bunch",
    description: "Spectacular balloon bunch featuring a mix of latex and foil balloons in coordinating colors. Perfect for making a statement at birthdays, graduations, and special celebrations.",
    price: 29.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Multicolor", "Rainbow", "Custom"],
    inStock: true,
    rating: 4.7,
    reviews: 89,
    arModel: "/assets/Full Balloon Bunch.glb"
  },
  {
    id: "lips-balloon",
    name: "Lips Foil Balloon",
    description: "Fun and flirty lips-shaped foil balloon, perfect for bachelorette parties, Valentine's Day celebrations, and fashion-themed events. High-quality material ensures long-lasting float time.",
    price: 14.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Red", "Pink", "Gold"],
    inStock: true,
    rating: 4.6,
    reviews: 67,
    arModel: "/assets/Lips Foil Balloon.glb"
  },
  {
    id: "lipstick-balloon",
    name: "Lipstick Foil Balloon",
    description: "Stylish lipstick-shaped foil balloon, ideal for makeup-themed parties, beauty events, and fashion celebrations. This unique balloon adds a glamorous touch to any decoration setup.",
    price: 15.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Red", "Pink", "Purple"],
    inStock: true,
    rating: 4.5,
    reviews: 124,
    arModel: "/assets/Lipstick Foil Balloon.glb"
  },
  {
    id: "paw-balloon",
    name: "Paw Foil Balloon",
    description: "Adorable paw-shaped foil balloon, perfect for pet-themed parties, animal lovers' celebrations, and children's events. Durable material ensures the balloon maintains its shape throughout your event.",
    price: 11.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Blue", "Pink", "Black"],
    inStock: true,
    rating: 4.4,
    reviews: 78,
    arModel: "/assets/Paw Foil Balloon.glb"
  },
  {
    id: "welcome-home",
    name: "Welcome Home Balloon",
    description: "Heartwarming 'Welcome Home' foil balloon, perfect for homecomings, family reunions, and housewarming parties. This large balloon makes a big statement and creates a warm welcome atmosphere.",
    price: 16.99,
    category: "Balloons",
    image: "/placeholder-balloons.jpg",
    colors: ["Gold", "Silver", "Blue"],
    inStock: true,
    rating: 4.7,
    reviews: 145,
    arModel: "/assets/Welcome Home Balloon.glb"
  }
];

export const categories = [
  "All",
  "Balloons",
  "Foil Balloons",
  "Latex Balloons",
  "Balloon Arrangements"
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter(product => product.category === category);
}