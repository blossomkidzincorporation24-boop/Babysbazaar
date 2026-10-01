/**
 * Seed 55 Products for Baby's Bazaar 11 Toy Categories (5 per category)
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pyopqnrubhfknxsmuqkc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b3BxbnJ1Ymhma254c211cWtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc2ODg4NSwiZXhwIjoyMTA2MzQ0ODg1fQ.cMtB1uoy5NpeiSuRwAnxm4ChcUxi_b0SZj2joafN4hQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TOY_PRODUCTS_DATA = [
  // 1. BABY TOYS
  {
    category_slug: 'baby-toys',
    title: 'Soft Baby Rattle',
    slug: 'soft-baby-rattle',
    price: 299,
    description: 'A lightweight sensory rattle designed for little hands, helping babies explore sounds, colors and movement.',
    short_description: 'Lightweight sensory rattle for 0–12 months with gentle chime and safe grip.',
    product_images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'baby-toys',
    title: 'Sensory Activity Ball',
    slug: 'sensory-activity-ball',
    price: 399,
    description: "Textured multi-surface sensory ball with soothing chime sounds to develop baby's grasp and tactile senses.",
    short_description: 'Multi-textured graspable sensory ball for 3–18 months with gentle rattles.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },
  {
    category_slug: 'baby-toys',
    title: 'Baby Teether Toy',
    slug: 'baby-teether-toy',
    price: 249,
    description: 'BPA-free soft silicone cooling teether that gently massages sore gums and provides instant teething comfort.',
    short_description: 'Food-grade silicone teether for 3–12 months with soothing textured ridges.',
    product_images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'baby-toys',
    title: 'Musical Baby Toy',
    slug: 'musical-baby-toy',
    price: 499,
    description: 'Charming light-up musical toy with soothing lullabies and playful sound effects for early auditory stimulation.',
    short_description: 'Light-up musical toy for 6–24 months with cheerful melodies and soft lights.',
    product_images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: true
  },
  {
    category_slug: 'baby-toys',
    title: 'Newborn Activity Toy',
    slug: 'newborn-activity-toy',
    price: 449,
    description: 'Multi-functional plush clip-on activity toy with squeaker, mirror, and gentle crinkle textures for strollers and cribs.',
    short_description: 'Stroller & crib clip-on activity toy for 0–12 months with discovery mirror.',
    product_images: ['https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },

  // 2. EDUCATIONAL TOYS
  {
    category_slug: 'educational-toys',
    title: 'Wooden Learning Blocks',
    slug: 'wooden-learning-blocks',
    price: 599,
    description: 'Eco-friendly natural wood building and sorting blocks with numbers, letters, and vibrant child-safe colors.',
    short_description: 'Solid wood learning block set for 1–4 years with non-toxic water-based paints.',
    product_images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'educational-toys',
    title: 'Alphabet Learning Puzzle',
    slug: 'alphabet-learning-puzzle',
    price: 399,
    description: 'Chunky wooden alphabet puzzle board that introduces letter recognition, phonics, and hand-eye coordination.',
    short_description: 'Chunky letter board for 2–5 years promoting early vocabulary and fine motor dexterity.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'educational-toys',
    title: 'Number Counting Toy',
    slug: 'number-counting-toy',
    price: 499,
    description: 'Interactive counting abacus and stacking rings for early math skills, color sorting, and logical thinking.',
    short_description: 'Montessori math abacus & stacking rings for 2–5 years to build number mastery.',
    product_images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },
  {
    category_slug: 'educational-toys',
    title: 'STEM Building Kit',
    slug: 'stem-building-kit',
    price: 899,
    description: 'Hands-on engineering and construction STEM kit designed to inspire curiosity, problem solving, and creativity.',
    short_description: 'Engineering model STEM kit for 4–8 years with gears, connectors and wheels.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'educational-toys',
    title: 'Shape Sorting Board',
    slug: 'shape-sorting-board',
    price: 349,
    description: 'Geometric shape peg board helping toddlers master shapes, spatial awareness, and fine motor skills.',
    short_description: 'Geometric matching puzzle board for 1–3 years for early cognitive recognition.',
    product_images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },

  // 3. REMOTE CONTROL TOYS
  {
    category_slug: 'remote-control-toys',
    title: 'RC Racing Car',
    slug: 'rc-racing-car',
    price: 1299,
    description: 'High-speed 2.4GHz remote control race car with aerodynamic styling, working LED headlights, and responsive steering.',
    short_description: 'High-speed 2.4GHz drift racing car for 4–10 years with rechargeable battery.',
    product_images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'remote-control-toys',
    title: 'RC Monster Truck',
    slug: 'rc-monster-truck',
    price: 1799,
    description: 'Heavy-duty off-road remote control monster truck with shock absorbers, big rubber grip tires, and rechargeable battery.',
    short_description: 'All-terrain 4WD off-road monster truck for 5–12 years with rugged suspension.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },
  {
    category_slug: 'remote-control-toys',
    title: 'RC Stunt Car',
    slug: 'rc-stunt-car',
    price: 1499,
    description: 'Double-sided 360-degree rotating stunt car with flashing lights, rolling flips, and rugged terrain performance.',
    short_description: '360° tumbling and flipping stunt vehicle for 4–10 years with colorful LED effects.',
    product_images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'remote-control-toys',
    title: 'Remote Control Bike',
    slug: 'remote-control-bike',
    price: 999,
    description: 'Futuristic high-speed RC stunt motorcycle with gyro balancing technology and drift capabilities.',
    short_description: 'Self-balancing high-speed RC racer motorcycle for 5–10 years with rubber grip tires.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: true
  },
  {
    category_slug: 'remote-control-toys',
    title: 'Mini RC Drone',
    slug: 'mini-rc-drone',
    price: 2199,
    description: 'Safe indoor altitude-hold mini drone with 360-degree propeller guards, one-key takeoff, and stunt flip features.',
    short_description: 'Altitude-hold quadcopter drone for 6–12 years with propeller crash guards.',
    product_images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: false
  },

  // 4. CARS & VEHICLES
  {
    category_slug: 'cars-and-vehicles',
    title: 'Die-Cast Racing Car',
    slug: 'die-cast-racing-car',
    price: 399,
    description: 'Durable metal die-cast collectible sports car with opening doors, pull-back action, and authentic detailing.',
    short_description: 'Metal die-cast pull-back supercar for 3–8 years with precision detail.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'cars-and-vehicles',
    title: 'Mini Fire Truck',
    slug: 'mini-fire-truck',
    price: 499,
    description: 'Rescue fire engine with extendable rotating ladder, realistic siren sounds, and rolling friction wheels.',
    short_description: 'Extendable ladder rescue fire truck for 2–6 years with friction-powered drive.',
    product_images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'cars-and-vehicles',
    title: 'Toy Police Car',
    slug: 'toy-police-car',
    price: 449,
    description: 'Classic city police patrol car with flashing emergency lights, realistic sound effects, and pull-back drive.',
    short_description: 'City patrol cruiser for 2–6 years with emergency siren and light bar.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },
  {
    category_slug: 'cars-and-vehicles',
    title: 'Toy Construction Truck',
    slug: 'toy-construction-truck',
    price: 599,
    description: 'Heavy-duty construction excavator and dump truck set with movable lifting arm for sandbox and indoor play.',
    short_description: 'Heavy excavator & dump truck for 3–7 years with articulated digging arm.',
    product_images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'cars-and-vehicles',
    title: 'Mini School Bus',
    slug: 'mini-school-bus',
    price: 349,
    description: 'Classic yellow die-cast school bus with working doors, smooth glide wheels, and cheerful styling.',
    short_description: 'Yellow die-cast school bus for 2–6 years with pull-back friction motor.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },

  // 5. DOLLS & PRETEND PLAY
  {
    category_slug: 'dolls-and-pretend-play',
    title: 'Baby Doll',
    slug: 'baby-doll',
    price: 799,
    description: 'Soft-bodied cuddly baby doll with lifelike facial expressions, removable outfit, and feeding bottle accessories.',
    short_description: 'Huggable soft-body baby doll for 2–6 years with pacifier and feeding set.',
    product_images: ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'dolls-and-pretend-play',
    title: 'Doll Kitchen Set',
    slug: 'doll-kitchen-set',
    price: 1199,
    description: 'Complete pretend cooking set with pots, pans, utensils, play food, and sound effects for little chefs.',
    short_description: 'Interactive mini chef cooking station for 3–7 years with kitchen utensils and cookware.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'dolls-and-pretend-play',
    title: 'Doctor Pretend Play Set',
    slug: 'doctor-pretend-play-set',
    price: 699,
    description: 'Portable medical kit case with stethoscope, thermometer, syringe, and doctor tools to encourage empathy and imaginative play.',
    short_description: 'Medical clinic doctor kit case for 3–7 years with pretend healthcare tools.',
    product_images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'dolls-and-pretend-play',
    title: 'Toy Grocery Set',
    slug: 'toy-grocery-set',
    price: 599,
    description: 'Mini supermarket shopping cart with colorful fruits, vegetables, canned foods, and play money.',
    short_description: 'Pretend shopping trolley & organic grocery set for 2–6 years.',
    product_images: ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'dolls-and-pretend-play',
    title: 'Doll House Play Set',
    slug: 'doll-house-play-set',
    price: 1499,
    description: 'Charming multi-room dollhouse with miniature furniture, figurines, and creative storytelling layouts.',
    short_description: 'Foldable miniature family dollhouse for 3–8 years with modular furniture.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },

  // 6. BUILDING TOYS
  {
    category_slug: 'building-toys',
    title: 'Color Building Blocks',
    slug: 'color-building-blocks',
    price: 499,
    description: 'Classic vibrant interlocking building blocks in a handy storage tub to inspire open-ended construction.',
    short_description: 'Big interlocking construction blocks for 1.5–5 years with easy-carry bucket.',
    product_images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'building-toys',
    title: 'Magnetic Building Tiles',
    slug: 'magnetic-building-tiles',
    price: 1299,
    description: 'Translucent 3D magnetic building geometric tiles that spark architectural imagination and geometry learning.',
    short_description: '3D clear magnetic building tiles for 3–8 years with strong neodymium magnets.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'building-toys',
    title: 'Construction Brick Set',
    slug: 'construction-brick-set',
    price: 799,
    description: 'Multi-piece themed vehicle and structure brick building set compatible with standard building bricks.',
    short_description: 'Architectural construction brick set for 4–9 years with step-by-step blueprint guide.',
    product_images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'building-toys',
    title: 'Engineering Building Kit',
    slug: 'engineering-building-kit',
    price: 1099,
    description: 'STEM nuts, bolts, wheels and tool set for young builders to create cranes, cars, and mechanical models.',
    short_description: 'Mechanical nuts & bolts engineering workshop for 4–8 years with working wrench.',
    product_images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'building-toys',
    title: 'Creative Building Set',
    slug: 'creative-building-set',
    price: 699,
    description: 'Flexible connecting rods and spheres to build forts, castles, and 3D geometric structures.',
    short_description: '3D fort and sphere connecting structural set for 3–7 years for open-ended play.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },

  // 7. MUSICAL TOYS
  {
    category_slug: 'musical-toys',
    title: 'Kids Xylophone',
    slug: 'kids-xylophone',
    price: 499,
    description: 'Rainbow colored 8-key metal xylophone with wooden mallets for introducing musical scale and rhythm.',
    short_description: 'Tuned 8-note metal rainbow xylophone for 1–5 years with dual safety mallets.',
    product_images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'musical-toys',
    title: 'Musical Piano Toy',
    slug: 'musical-piano-toy',
    price: 899,
    description: 'Electronic mini keyboard piano with demo songs, animal sound buttons, and record-playback features.',
    short_description: 'Electronic educational keyboard for 2–6 years with melody presets and animal voices.',
    product_images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'musical-toys',
    title: 'Kids Drum Set',
    slug: 'kids-drum-set',
    price: 749,
    description: 'Fun tabletop jazz drum kit with bass drum, tom drums, cymbal, and lightweight drumsticks.',
    short_description: 'Tabletop jazz percussion drum station for 2–6 years with splash cymbal.',
    product_images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'musical-toys',
    title: 'Toy Microphone',
    slug: 'toy-microphone',
    price: 399,
    description: 'Sing-along echo microphone with built-in cheerful tunes, applause effects, and LED light show.',
    short_description: 'Sing-along karaoke echo microphone for 2–5 years with dynamic voice amplification.',
    product_images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'musical-toys',
    title: 'Musical Keyboard',
    slug: 'musical-keyboard',
    price: 1199,
    description: 'Portable 37-key musical keyboard synthesizer with microphone for budding young musicians.',
    short_description: '37-key synthesizer with karaoke mic and multiple instrument modes for 3–8 years.',
    product_images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },

  // 8. OUTDOOR TOYS
  {
    category_slug: 'outdoor-toys',
    title: 'Kids Football',
    slug: 'kids-football',
    price: 399,
    description: 'Soft, durable size 3 kids football designed for backyard drills, park games, and active outdoor play.',
    short_description: 'Cushioned TPU size 3 soccer ball for 3–8 years for outdoor coordination.',
    product_images: ['https://images.unsplash.com/photo-1533560904424-a0c61dc302ff?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'outdoor-toys',
    title: 'Kids Cricket Set',
    slug: 'kids-cricket-set',
    price: 599,
    description: 'Lightweight plastic cricket kit with bat, stumps, base stand, and soft ball for family outdoor fun.',
    short_description: 'Complete junior cricket kit with lightweight bat and safety wind ball for 4–10 years.',
    product_images: ['https://images.unsplash.com/photo-1533560904424-a0c61dc302ff?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'outdoor-toys',
    title: 'Bubble Blower Toy',
    slug: 'bubble-blower-toy',
    price: 349,
    description: 'Automatic battery-operated bubble gun producing thousands of giant iridescent bubbles per minute.',
    short_description: 'High-output automatic bubble blaster for 2–7 years with non-toxic solution bottle.',
    product_images: ['https://images.unsplash.com/photo-1533560904424-a0c61dc302ff?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'outdoor-toys',
    title: 'Outdoor Ring Toss',
    slug: 'outdoor-ring-toss',
    price: 449,
    description: 'Classic wooden quoits ring toss game for garden parties, picnics, and target coordination skills.',
    short_description: 'Family lawn ring toss target game for 3–8 years with rope quoits and score pegs.',
    product_images: ['https://images.unsplash.com/photo-1533560904424-a0c61dc302ff?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'outdoor-toys',
    title: 'Kids Garden Play Set',
    slug: 'kids-garden-play-set',
    price: 499,
    description: 'Colorful kid-sized gardening tools including shovel, rake, watering can, and carrier bag.',
    short_description: 'Outdoor nature explorer gardening tools for 3–7 years with mini watering can.',
    product_images: ['https://images.unsplash.com/photo-1533560904424-a0c61dc302ff?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },

  // 9. SOFT TOYS
  {
    category_slug: 'soft-toys',
    title: 'Teddy Bear',
    slug: 'teddy-bear',
    price: 699,
    description: 'Ultra-plush velvety brown teddy bear with embroidered paws, perfect for nursery cuddles and naptime comfort.',
    short_description: 'Velvety plush heritage teddy bear for all ages with huggable hypoallergenic stuffing.',
    product_images: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'soft-toys',
    title: 'Plush Bunny',
    slug: 'plush-bunny',
    price: 599,
    description: 'Adorable floppy-eared plush bunny in pastel blush with silky soft hypoallergenic fur.',
    short_description: 'Pastel floppy-eared bunny for newborn cuddles and baby shower gifting.',
    product_images: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'soft-toys',
    title: 'Soft Elephant Toy',
    slug: 'soft-elephant-toy',
    price: 799,
    description: 'Super soft comforting plush elephant pillow with gentle weighted feel for restful sleep and play.',
    short_description: 'Calming plush elephant snuggle buddy for 0+ months with satin ear lining.',
    product_images: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'soft-toys',
    title: 'Plush Puppy',
    slug: 'plush-puppy',
    price: 549,
    description: 'Sweet cuddly golden retriever plush puppy with adorable floppy ears and huggable soft filling.',
    short_description: 'Golden retriever plush companion for toddlers with safety-lock stitched eyes.',
    product_images: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'soft-toys',
    title: 'Cuddly Bear Pillow',
    slug: 'cuddly-bear-pillow',
    price: 899,
    description: 'Multi-purpose foldable plush bear cushion that unfastens into a comfortable nap pillow for toddlers.',
    short_description: '2-in-1 plush folding sleep cushion for 1+ years for nursery and travel.',
    product_images: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },

  // 10. ACTIVITY & PUZZLE
  {
    category_slug: 'activity-and-puzzle',
    title: 'Wooden Jigsaw Puzzle',
    slug: 'wooden-jigsaw-puzzle',
    price: 349,
    description: 'Colorful wooden animal jigsaw puzzle with chunky easy-grasp pieces for early pattern recognition.',
    short_description: 'Chunky wooden animal jigsaw for 2–5 years with self-correcting peg bases.',
    product_images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'activity-and-puzzle',
    title: 'Kids Maze Puzzle',
    slug: 'kids-maze-puzzle',
    price: 399,
    description: 'Magnetic bead maze navigation game developing concentration, patience, and precision pen control.',
    short_description: 'Enclosed magnetic wand marble maze board for 3–6 years for precision dexterity.',
    product_images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'activity-and-puzzle',
    title: 'Animal Matching Puzzle',
    slug: 'animal-matching-puzzle',
    price: 299,
    description: 'Self-correcting 2-piece animal and habitat matching puzzle cards for vocabulary and memory building.',
    short_description: 'Self-correcting 24-piece pairing card puzzle for 2–4 years.',
    product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  },
  {
    category_slug: 'activity-and-puzzle',
    title: 'Memory Card Game',
    slug: 'memory-card-game',
    price: 249,
    description: 'Fun 36-card illustrated memory matching game to boost visual memory and focus for family game nights.',
    short_description: 'Visual matching memory card deck for 3–7 years with illustrated animal themes.',
    product_images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'activity-and-puzzle',
    title: 'Brain Activity Board',
    slug: 'brain-activity-board',
    price: 699,
    description: 'Montessori sensory busy board with latches, gears, zippers, and switches for tactile exploration.',
    short_description: 'Montessori wooden sensory busy board for 1.5–4 years with latches, gears and locks.',
    product_images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },

  // 11. RIDE-ON TOYS
  {
    category_slug: 'ride-on-toys',
    title: 'Baby Push Car',
    slug: 'baby-push-car',
    price: 1699,
    description: 'Foot-to-floor ride-on cruiser car with steering horn, under-seat secret storage, and high back support.',
    short_description: 'Foot-to-floor push cruiser for 1–3 years with musical steering horn.',
    product_images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'ride-on-toys',
    title: 'Kids Ride-On Jeep',
    slug: 'kids-ride-on-jeep',
    price: 3999,
    description: 'Rugged electric ride-on 4x4 Jeep with parental remote control, LED headlights, and MP3 music player.',
    short_description: '12V motorized electric 4x4 Jeep for 3–7 years with parental wireless remote control.',
    product_images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80'],
    new_arrival: true,
    best_seller: true,
    featured: true
  },
  {
    category_slug: 'ride-on-toys',
    title: 'Battery Ride-On Car',
    slug: 'battery-ride-on-car',
    price: 4499,
    description: 'Rechargeable 12V sports car with butterfly doors, smooth suspension, forward/reverse drive, and seatbelt.',
    short_description: 'Rechargeable 12V luxury sports car for 3–7 years with LED headlamps and seat safety harness.',
    product_images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80'],
    new_arrival: false,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'ride-on-toys',
    title: 'Kids Ride-On Bike',
    slug: 'kids-ride-on-bike',
    price: 2499,
    description: 'Electric 3-wheel balance motorcycle with foot pedal accelerator, working headlight, and training wheels.',
    short_description: 'Trike balance electric motorcycle for 2–5 years with foot accelerator and light effects.',
    product_images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80'],
    new_arrival: true,
    best_seller: false,
    featured: false
  },
  {
    category_slug: 'ride-on-toys',
    title: 'Push & Ride Scooter',
    slug: 'push-and-ride-scooter',
    price: 1499,
    description: 'Adjustable 3-wheel lean-to-steer kick scooter with light-up LED wheels and non-slip wide deck.',
    short_description: 'Lean-to-steer 3-wheel kick scooter for 3–8 years with kinetic flashing LED wheels.',
    product_images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80'],
    new_arrival: false,
    best_seller: true,
    featured: false
  }
];

async function run() {
  console.log('🚀 Starting Baby\'s Bazaar Toy Catalogue Seeding...');

  // 1. Fetch Categories
  const { data: categories, error: catError } = await supabase.from('categories').select('id, slug, name');
  if (catError || !categories) {
    console.error('❌ Could not fetch categories:', catError);
    return;
  }

  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });

  console.log(`📦 Found ${categories.length} total categories in database.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of TOY_PRODUCTS_DATA) {
    const categoryId = catMap[item.category_slug];
    if (!categoryId) {
      console.warn(`⚠️ Warning: Category ${item.category_slug} not found. Skipping ${item.title}.`);
      continue;
    }

    const payload = {
      title: item.title,
      slug: item.slug,
      price: item.price,
      description: item.description,
      short_description: item.short_description,
      product_images: item.product_images,
      category_id: categoryId,
      new_arrival: item.new_arrival,
      best_seller: item.best_seller,
      featured: item.featured,
      status: 'active',
      updated_at: new Date().toISOString()
    };

    // Check if product with slug already exists
    const { data: existing } = await supabase.from('products').select('id').eq('slug', item.slug).maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase.from('products').update(payload).eq('id', existing.id);
      if (updateErr) {
        console.error(`❌ Error updating ${item.title}:`, updateErr.message);
      } else {
        updatedCount++;
      }
    } else {
      const { error: insertErr } = await supabase.from('products').insert(payload);
      if (insertErr) {
        console.error(`❌ Error inserting ${item.title}:`, insertErr.message);
      } else {
        insertedCount++;
      }
    }
  }

  console.log(`\n🎉 SEEDING COMPLETED!`);
  console.log(`✅ Newly Inserted: ${insertedCount}`);
  console.log(`🔄 Updated/Verified: ${updatedCount}`);
  console.log(`📊 Total Toy Products in Batch: ${TOY_PRODUCTS_DATA.length}`);
}

run();
