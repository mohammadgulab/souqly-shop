/* Product catalogue. Prices in SAR. */
const PRODUCTS = [
 {
  "id": "wireless-earbuds",
  "name": "AirLite Pro Wireless Earbuds",
  "category": "Electronics",
  "price": 149,
  "mrp": 229,
  "rating": 4.5,
  "reviews": 1284,
  "description": "Pocket-size earbuds with active noise cancelling, 30 hours of total playback with the case, and fast USB-C charging.",
  "highlights": [
   "Active noise cancelling",
   "30 h battery with case",
   "IPX4 sweat resistant",
   "USB-C fast charge"
  ],
  "image": "img/wireless-earbuds.webp",
  "stock": 12,
  "added": 0
 },
 {
  "id": "smartwatch",
  "name": "Pulse S2 Smartwatch",
  "category": "Electronics",
  "price": 299,
  "mrp": 449,
  "rating": 4.3,
  "reviews": 862,
  "description": "Track steps, heart rate and sleep, read notifications and pick from dozens of watch faces. Up to 7 days on one charge.",
  "highlights": [
   "1.8 inch AMOLED display",
   "Heart rate and SpO2",
   "7 day battery",
   "5 ATM water resistant"
  ],
  "image": "img/smartwatch.webp",
  "stock": 8,
  "added": 1
 },
 {
  "id": "headphones",
  "name": "Dune Over-Ear Headphones",
  "category": "Electronics",
  "price": 259,
  "mrp": 399,
  "rating": 4.6,
  "reviews": 2031,
  "description": "Soft memory foam cushions, deep bass and a 40 hour battery. Folds flat for travel.",
  "highlights": [
   "40 h battery",
   "Bluetooth 5.3",
   "Foldable design",
   "Built-in mic"
  ],
  "image": "img/headphones.webp",
  "stock": 25,
  "added": 2
 },
 {
  "id": "bt-speaker",
  "name": "Wave Mini Bluetooth Speaker",
  "category": "Electronics",
  "price": 119,
  "mrp": 169,
  "rating": 4.4,
  "reviews": 745,
  "description": "Loud, clear 360 degree sound in a speaker that fits in your hand. Pair two for stereo.",
  "highlights": [
   "360 degree sound",
   "12 h playtime",
   "Stereo pairing",
   "Splash proof"
  ],
  "image": "img/bt-speaker.webp",
  "stock": 60,
  "added": 3
 },
 {
  "id": "power-bank",
  "name": "Volt 20000 mAh Power Bank",
  "category": "Electronics",
  "price": 89,
  "mrp": 139,
  "rating": 4.2,
  "reviews": 1530,
  "description": "Charge your phone up to four times. Two USB-C ports and one USB-A, with 22.5 W fast charging.",
  "highlights": [
   "20000 mAh",
   "22.5 W fast charge",
   "3 output ports",
   "Aluminium body"
  ],
  "image": "img/power-bank.webp",
  "stock": 3,
  "added": 4
 },
 {
  "id": "keyboard",
  "name": "Keys68 Mechanical Keyboard",
  "category": "Electronics",
  "price": 199,
  "mrp": 279,
  "rating": 4.7,
  "reviews": 412,
  "description": "Compact 68-key layout with hot-swap switches, soft tactile feel and a detachable USB-C cable.",
  "highlights": [
   "68 keys",
   "Hot-swap switches",
   "PBT keycaps",
   "Wired and Bluetooth"
  ],
  "image": "img/keyboard.webp",
  "stock": 3,
  "added": 5
 },
 {
  "id": "tablet",
  "name": "Slate 10 Tablet with Stylus",
  "category": "Electronics",
  "price": 899,
  "mrp": 1199,
  "rating": 4.4,
  "reviews": 388,
  "description": "A 10.5 inch tablet for notes, reading and video, with a pressure-sensitive stylus in the box.",
  "highlights": [
   "10.5 inch display",
   "128 GB storage",
   "Stylus included",
   "10 h battery"
  ],
  "image": "img/tablet.webp",
  "stock": 40,
  "added": 6
 },
 {
  "id": "tshirt",
  "name": "Everyday Cotton T-Shirt",
  "category": "Fashion",
  "price": 39,
  "mrp": 69,
  "rating": 4.3,
  "reviews": 3120,
  "description": "Soft combed cotton tee with a regular fit that keeps its shape wash after wash.",
  "highlights": [
   "100% combed cotton",
   "Regular fit",
   "Sizes S to XXL",
   "Machine washable"
  ],
  "image": "img/tshirt.webp",
  "stock": 3,
  "added": 7
 },
 {
  "id": "sneakers",
  "name": "CloudStep Running Sneakers",
  "category": "Fashion",
  "price": 229,
  "mrp": 329,
  "rating": 4.5,
  "reviews": 967,
  "description": "Light, breathable runners with a cushioned sole for daily runs and long days on your feet.",
  "highlights": [
   "Breathable mesh",
   "Cushioned sole",
   "Non-slip grip",
   "Sizes 39 to 46"
  ],
  "image": "img/sneakers.webp",
  "stock": 12,
  "added": 8
 },
 {
  "id": "backpack",
  "name": "Trail Canvas Backpack",
  "category": "Fashion",
  "price": 159,
  "mrp": 229,
  "rating": 4.6,
  "reviews": 581,
  "description": "Waxed canvas backpack with leather straps, a padded laptop sleeve and plenty of pockets.",
  "highlights": [
   "Fits 15.6 inch laptop",
   "Water resistant canvas",
   "25 litre capacity",
   "Padded straps"
  ],
  "image": "img/backpack.webp",
  "stock": 40,
  "added": 9
 },
 {
  "id": "sunglasses",
  "name": "Tortoise Classic Sunglasses",
  "category": "Fashion",
  "price": 79,
  "mrp": 129,
  "rating": 4.1,
  "reviews": 442,
  "description": "Timeless round frames with polarised UV400 lenses and a hard case.",
  "highlights": [
   "Polarised lenses",
   "UV400 protection",
   "Hard case included",
   "Unisex"
  ],
  "image": "img/sunglasses.webp",
  "stock": 3,
  "added": 10
 },
 {
  "id": "watch-leather",
  "name": "Heritage Leather Watch",
  "category": "Fashion",
  "price": 249,
  "mrp": 349,
  "rating": 4.5,
  "reviews": 628,
  "description": "A clean analog dial on a genuine leather strap. Water resistant for everyday wear.",
  "highlights": [
   "Quartz movement",
   "Genuine leather strap",
   "3 ATM water resistant",
   "40 mm case"
  ],
  "image": "img/watch-leather.webp",
  "stock": 40,
  "added": 11
 },
 {
  "id": "hoodie",
  "name": "Cozy Fleece Hoodie",
  "category": "Fashion",
  "price": 99,
  "mrp": 149,
  "rating": 4.4,
  "reviews": 1205,
  "description": "Brushed fleece hoodie with a kangaroo pocket and a relaxed fit.",
  "highlights": [
   "Cotton blend fleece",
   "Relaxed fit",
   "Kangaroo pocket",
   "Sizes S to XXL"
  ],
  "image": "img/hoodie.webp",
  "stock": 8,
  "added": 12
 },
 {
  "id": "coffee-maker",
  "name": "Bloom Pour-Over Coffee Set",
  "category": "Home & Kitchen",
  "price": 119,
  "mrp": 169,
  "rating": 4.7,
  "reviews": 354,
  "description": "Glass carafe and reusable dripper for a clean, smooth cup at home.",
  "highlights": [
   "600 ml glass carafe",
   "Reusable steel filter",
   "Heat resistant glass",
   "Dishwasher safe"
  ],
  "image": "img/coffee-maker.webp",
  "stock": 3,
  "added": 13
 },
 {
  "id": "mug-set",
  "name": "Terracotta Mug Set of 2",
  "category": "Home & Kitchen",
  "price": 59,
  "mrp": 89,
  "rating": 4.6,
  "reviews": 812,
  "description": "Handmade speckled ceramic mugs that keep your tea and coffee warm longer.",
  "highlights": [
   "Set of 2",
   "350 ml each",
   "Microwave safe",
   "Dishwasher safe"
  ],
  "image": "img/mug-set.webp",
  "stock": 3,
  "added": 14
 },
 {
  "id": "desk-lamp",
  "name": "Halo LED Desk Lamp",
  "category": "Home & Kitchen",
  "price": 109,
  "mrp": 159,
  "rating": 4.4,
  "reviews": 503,
  "description": "Warm, eye-friendly light with three brightness levels and a solid wooden base.",
  "highlights": [
   "3 brightness levels",
   "Warm white LED",
   "Wooden base",
   "USB powered"
  ],
  "image": "img/desk-lamp.webp",
  "stock": 25,
  "added": 15
 },
 {
  "id": "cookware",
  "name": "ProCook Non-Stick Pan 28 cm",
  "category": "Home & Kitchen",
  "price": 89,
  "mrp": 139,
  "rating": 4.3,
  "reviews": 1678,
  "description": "Even heating, easy release non-stick coating and a cool-touch handle. Works on all hobs.",
  "highlights": [
   "28 cm diameter",
   "PFOA-free coating",
   "Induction ready",
   "Cool-touch handle"
  ],
  "image": "img/cookware.webp",
  "stock": 25,
  "added": 16
 },
 {
  "id": "plant-pot",
  "name": "Mini Succulent in Ceramic Pot",
  "category": "Home & Kitchen",
  "price": 35,
  "mrp": 55,
  "rating": 4.8,
  "reviews": 926,
  "description": "A real, easy-care succulent in a matte white pot. Perfect for desks and shelves.",
  "highlights": [
   "Live plant",
   "Matte ceramic pot",
   "Low maintenance",
   "Gift ready"
  ],
  "image": "img/plant-pot.webp",
  "stock": 3,
  "added": 17
 },
 {
  "id": "water-bottle",
  "name": "Hydro Steel Bottle 750 ml",
  "category": "Sports",
  "price": 69,
  "mrp": 99,
  "rating": 4.7,
  "reviews": 2210,
  "description": "Double-wall insulated bottle that keeps drinks cold for 24 hours and hot for 12.",
  "highlights": [
   "750 ml",
   "Cold 24 h, hot 12 h",
   "Leak-proof lid",
   "BPA free"
  ],
  "image": "img/water-bottle.webp",
  "stock": 8,
  "added": 18
 },
 {
  "id": "yoga-mat",
  "name": "FlexGrip Yoga Mat 6 mm",
  "category": "Sports",
  "price": 79,
  "mrp": 119,
  "rating": 4.5,
  "reviews": 1340,
  "description": "Thick, non-slip mat with a carry strap for home workouts and studio classes.",
  "highlights": [
   "6 mm thick",
   "Non-slip surface",
   "Carry strap",
   "Easy to clean"
  ],
  "image": "img/yoga-mat.webp",
  "stock": 3,
  "added": 19
 },
 {
  "id": "dumbbells",
  "name": "Hex Dumbbells Pair 5 kg",
  "category": "Sports",
  "price": 149,
  "mrp": 199,
  "rating": 4.6,
  "reviews": 690,
  "description": "Rubber-coated hex dumbbells that do not roll, with a knurled chrome grip.",
  "highlights": [
   "2 x 5 kg",
   "Anti-roll hex shape",
   "Rubber coated",
   "Knurled grip"
  ],
  "image": "img/dumbbells.webp",
  "stock": 40,
  "added": 20
 },
 {
  "id": "skincare",
  "name": "Glow Daily Skincare Duo",
  "category": "Beauty",
  "price": 129,
  "mrp": 189,
  "rating": 4.4,
  "reviews": 577,
  "description": "A light vitamin C serum and a daily moisturiser for soft, bright skin.",
  "highlights": [
   "30 ml serum",
   "50 ml moisturiser",
   "For all skin types",
   "Fragrance free"
  ],
  "image": "img/skincare.webp",
  "stock": 25,
  "added": 21
 },
 {
  "id": "perfume",
  "name": "Amber Oud Eau de Parfum",
  "category": "Beauty",
  "price": 189,
  "mrp": 279,
  "rating": 4.6,
  "reviews": 1102,
  "description": "Warm amber and oud with a soft vanilla finish. Long lasting, 100 ml.",
  "highlights": [
   "100 ml",
   "Long lasting",
   "Amber, oud, vanilla",
   "Gift box"
  ],
  "image": "img/perfume.webp",
  "stock": 3,
  "added": 22
 },
 {
  "id": "notebook",
  "name": "Kraft Notebook Pack of 3",
  "category": "Books & Stationery",
  "price": 29,
  "mrp": 45,
  "rating": 4.5,
  "reviews": 1890,
  "description": "A5 ruled notebooks with recycled kraft covers and smooth 80 gsm paper, plus a gel pen.",
  "highlights": [
   "Pack of 3, A5",
   "80 gsm ruled paper",
   "Recycled covers",
   "Gel pen included"
  ],
  "image": "img/notebook.webp",
  "stock": 40,
  "added": 23
 }
];
