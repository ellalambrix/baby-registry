import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  peach:      "#df9a81", // primary CTA, FAB, buttons, active states
  peachDark:  "#c47d62", // hover / gradient end
  peachLight: "#f5e2da", // tinted backgrounds, light badges
  peachFaint: "#faf0ec", // very subtle tints

  green:      "#477760", // headings, dark text
  greenDark:  "#2e4f3f", // darkest text
  greenMid:   "#5a8a73", // medium text
  greenFaint: "#e8f0ec", // very light green tint

  pink:       "#e59bc4", // top pick badge, highlights
  pinkFaint:  "#fbeef6", // pink tinted backgrounds

  blue:       "#7298af", // secondary UI chrome, some borders
  blueFaint:  "#e8eff5", // blue tinted backgrounds

  gray:       "#a9a392", // muted text, dividers, placeholders
  grayLight:  "#e8e6e2", // borders, subtle lines
  grayFaint:  "#f5f4f1", // alt row backgrounds

  page:       "#FAFAF5", // page background (from palette image)
  card:       "#FFFFFF",

  downvote:   "#7f2922", // stitched tote bag — downvote active
};

// ── Category colors from palette ──────────────────────────────────────────
const CATEGORY_COLORS = {
  // Baby categories
  Sleep:                        "#7298af",
  Feeding:                      "#df9a81",
  Diapering:                    "#477760",
  Transport:                    "#295ba4",
  Bathing:                      "#7298af",
  "Play & Development":         "#dccf73",
  "Clothing & Comfort":         "#e59bc4",
  "Health & Safety":            "#7f2922",
  // Parent resource categories
  "Feeding Support":            "#df9a81",
  "Solids & Starting Foods":    "#5a8a73",
  "Sleep Resources":            "#7298af",
  "Postpartum Recovery":        "#e59bc4",
  "Mental Health & Wellness":   "#7f2922",
  "Parenting Tools & Apps":     "#2e4f3f",
  "Recommended Reading":        "#dccf73",
  "Favorite Shops & Resale":    "#df9a81",
};
const DEFAULT_CAT_COLOR = P.peach;

// ── Section groups ─────────────────────────────────────────────────────────
const BABY_CATS   = ["Sleep", "Feeding", "Diapering", "Transport", "Bathing", "Play & Development", "Clothing & Comfort", "Health & Safety"];
const PARENT_CATS = ["Feeding Support", "Solids & Starting Foods", "Sleep Resources", "Postpartum Recovery", "Mental Health & Wellness", "Parenting Tools & Apps", "Recommended Reading", "Favorite Shops & Resale"];

const initialItems = [
  // ── Baby: Sleep ───────────────────────────────────────────────────────────
  { id: 1,  category: "Sleep", name: "Crib / Bassinet",        recs: [{ id: "r1-1",  brand: "SNOO Smart Sleeper",  model: "Happiest Baby SNOO",             votes: 12, comments: [{ id: 1, author: "Sarah M.", text: "Absolute lifesaver for the first few months!", date: "Mar 2" }] }, { id: "r1-2",  brand: "IKEA",           model: "SUNDVIK Crib",                   votes: 7,  comments: [{ id: 1, author: "Priya K.", text: "Budget-friendly and grows with baby.", date: "Mar 8" }] }] },
  { id: 2,  category: "Sleep", name: "Crib Mattress",          recs: [{ id: "r2-1",  brand: "Newton Baby",         model: "Original Crib Mattress",          votes: 8,  comments: [] }, { id: "r2-2",  brand: "Naturepedic",    model: "Organic Lightweight Classic",    votes: 5,  comments: [] }] },
  { id: 3,  category: "Sleep", name: "Baby Monitor",           recs: [{ id: "r3-1",  brand: "Nanit",               model: "Pro Camera",                      votes: 15, comments: [{ id: 1, author: "Jake T.", text: "The breathing monitoring gave us so much peace of mind.", date: "Feb 28" }] }, { id: "r3-2",  brand: "Owlet",          model: "Dream Duo",                      votes: 10, comments: [] }] },
  { id: 38, category: "Sleep", name: "Baby Sleep Sack",        recs: [{ id: "r38-1", brand: "HALO",                model: "SleepSack Wearable Blanket",      votes: 19, comments: [] }, { id: "r38-2", brand: "Kyte Baby",       model: "Sleep Bag (Bamboo)",             votes: 15, comments: [{ id: 1, author: "Bea C.", text: "So soft. The zip-down makes nighttime diaper changes so easy.", date: "Apr 16" }] }] },
  { id: 39, category: "Sleep", name: "Sound Machine",          recs: [{ id: "r39-1", brand: "Hatch",               model: "Rest+ 2nd Gen",                   votes: 18, comments: [{ id: 1, author: "Simone B.", text: "The app control from your phone at night is clutch.", date: "Apr 13" }] }, { id: "r39-2", brand: "LectroFan",      model: "Classic White Noise Machine",    votes: 16, comments: [] }, { id: "r39-3", brand: "Marpac",         model: "Hushh Portable (Travel)",        votes: 12, comments: [] }] },
  { id: 40, category: "Sleep", name: "Blackout Curtains",      recs: [{ id: "r40-1", brand: "SlumberPod",          model: "Privacy Pod",                    votes: 14, comments: [{ id: 1, author: "Mia H.", text: "Essential for travel and naps anywhere.", date: "Apr 17" }] }, { id: "r40-2", brand: "Redi Shade",     model: "Blackout Pleated Shade",         votes: 8,  comments: [] }] },
  { id: 44, category: "Sleep", name: "Bedside Co-Sleeper",     recs: [{ id: "r44-1", brand: "HALO",                model: "BassiNest Swivel Sleeper",        votes: 17, comments: [] }, { id: "r44-2", brand: "Arm's Reach",    model: "Co-Sleeper Bassinet",            votes: 13, comments: [{ id: 1, author: "Rosa P.", text: "Kept baby close without bed-sharing risks.", date: "Apr 20" }] }] },

  // ── Baby: Feeding ─────────────────────────────────────────────────────────
  { id: 4,  category: "Feeding", name: "Breast / Chest Pump",   recs: [{ id: "r4-1",  brand: "Spectra",             model: "S1 Plus",                         votes: 20, comments: [{ id: 1, author: "Amy L.", text: "Insurance often covers this — check first!", date: "Mar 5" }] }, { id: "r4-2",  brand: "Elvie",          model: "Stride Plus (Wearable)",         votes: 14, comments: [{ id: 1, author: "Monica R.", text: "Completely hands-free — I wore it during meetings.", date: "Apr 1" }] }, { id: "r4-3", brand: "Willow", model: "Go Wearable Pump", votes: 9, comments: [] }] },
  { id: 5,  category: "Feeding", name: "Bottles",                recs: [{ id: "r5-1",  brand: "Dr. Brown's",         model: "Anti-Colic Options+",             votes: 9,  comments: [] }, { id: "r5-2",  brand: "Comotomo",       model: "Soft Silicone Bottle",           votes: 6,  comments: [] }] },
  { id: 6,  category: "Feeding", name: "High Chair",             recs: [{ id: "r6-1",  brand: "Stokke",              model: "Tripp Trapp",                     votes: 11, comments: [{ id: 1, author: "Elena V.", text: "Grows from infant to adult. Worth every penny.", date: "Mar 7" }] }, { id: "r6-2",  brand: "BABYBJÖRN",     model: "Baby Chair Bliss",               votes: 7,  comments: [] }] },
  { id: 7,  category: "Feeding", name: "Bottle Sterilizer",      recs: [{ id: "r7-1",  brand: "Philips Avent",       model: "3-in-1 Electric Steam",           votes: 5,  comments: [] }] },
  { id: 24, category: "Feeding", name: "Nursing Pillow",         recs: [{ id: "r24-1", brand: "Boppy",               model: "Original Nursing Pillow",         votes: 18, comments: [] }, { id: "r24-2", brand: "My Brest Friend", model: "Original Pillow",               votes: 11, comments: [{ id: 1, author: "Jen A.", text: "The strap keeps it in place — huge for latching.", date: "Apr 3" }] }] },
  { id: 26, category: "Feeding", name: "Nursing Bra",            recs: [{ id: "r26-1", brand: "Kindred Bravely",     model: "French Terry Racerback",          votes: 15, comments: [{ id: 1, author: "Maya S.", text: "Comfortable enough to sleep in, supportive enough for day.", date: "Apr 4" }] }] },
  { id: 27, category: "Feeding", name: "Milk Storage Bags",      recs: [{ id: "r27-1", brand: "Lansinoh",            model: "Breastmilk Storage Bags",         votes: 12, comments: [] }, { id: "r27-2", brand: "Medela",         model: "Pump & Save Bags",               votes: 7,  comments: [] }] },
  { id: 25, category: "Feeding", name: "Nipple Cream",           recs: [{ id: "r25-1", brand: "Lansinoh",            model: "HPA Lanolin Cream",               votes: 22, comments: [{ id: 1, author: "Tara L.", text: "Apply after every single feed in the first few weeks.", date: "Apr 2" }] }, { id: "r25-2", brand: "Earth Mama",     model: "Organic Nipple Butter",          votes: 10, comments: [] }] },

  // ── Baby: Solids (stays on baby page as gear) ────────────────────────────
  { id: 29, category: "Feeding", name: "Baby Food Maker",        recs: [{ id: "r29-1", brand: "BEABA",               model: "Babycook Neo",                    votes: 13, comments: [{ id: 1, author: "Liz M.", text: "Steams and blends in one bowl. Easy cleanup.", date: "Apr 6" }] }, { id: "r29-2", brand: "Ninja",          model: "Fit Personal Blender",           votes: 8,  comments: [{ id: 1, author: "Ryan P.", text: "We just used our regular blender — works perfectly.", date: "Apr 7" }] }] },
  { id: 30, category: "Feeding", name: "Silicone Bibs",          recs: [{ id: "r30-1", brand: "Bumkins",             model: "Silicone Bib with Pocket",        votes: 17, comments: [{ id: 1, author: "Cass W.", text: "The pocket catches everything. These are the only bibs worth buying.", date: "Apr 8" }] }] },
  { id: 31, category: "Feeding", name: "Suction Bowl & Plate",   recs: [{ id: "r31-1", brand: "ezpz",                model: "Mini Mat",                        votes: 14, comments: [] }, { id: "r31-2", brand: "OXO Tot",        model: "Stick & Stay Bowl",              votes: 9,  comments: [] }] },
  { id: 32, category: "Feeding", name: "First Spoons & Utensils",recs: [{ id: "r32-1", brand: "NumNum",              model: "GOOtensils Pre-Spoon Set",        votes: 10, comments: [{ id: 1, author: "Petra O.", text: "Perfect for self-feeding from the start. Dishwasher safe.", date: "Apr 9" }] }] },
  { id: 33, category: "Feeding", name: "Baby Food Pouches",      recs: [{ id: "r33-1", brand: "Once Upon a Farm",    model: "Cold-Pressed Pouches",            votes: 11, comments: [] }, { id: "r33-2", brand: "Serenity Kids", model: "Meat & Veggie Pouches",          votes: 8,  comments: [{ id: 1, author: "Dan K.", text: "High protein, low sugar — great ingredients.", date: "Apr 10" }] }] },

  // ── Baby: Diapering ───────────────────────────────────────────────────────
  { id: 8,  category: "Diapering", name: "Diaper Bag",          recs: [{ id: "r8-1",  brand: "Freshly Picked",      model: "Classic Diaper Bag",              votes: 11, comments: [{ id: 1, author: "Rachel B.", text: "Holds everything and still looks cute!", date: "Mar 1" }] }, { id: "r8-2",  brand: "Skip Hop",       model: "Forma Backpack",                 votes: 8,  comments: [] }] },
  { id: 9,  category: "Diapering", name: "Changing Pad",        recs: [{ id: "r9-1",  brand: "Keekaroo",            model: "Peanut Changer",                  votes: 14, comments: [] }] },
  { id: 10, category: "Diapering", name: "Diaper Pail",         recs: [{ id: "r10-1", brand: "Ubbi",                model: "Steel Odor Locking Pail",         votes: 18, comments: [] }, { id: "r10-2", brand: "Dekor",          model: "Classic Hands-Free Pail",        votes: 6,  comments: [] }] },
  { id: 37, category: "Diapering", name: "Diaper Subscription", recs: [{ id: "r37-1", brand: "Amazon",              model: "Subscribe & Save",                votes: 12, comments: [] }, { id: "r37-2", brand: "The Honest Company", model: "Diaper Bundle",               votes: 9,  comments: [] }] },

  // ── Baby: Transport ───────────────────────────────────────────────────────
  { id: 11, category: "Transport", name: "Stroller",            recs: [{ id: "r11-1", brand: "UPPAbaby",             model: "VISTA V2",                        votes: 22, comments: [{ id: 1, author: "Tom K.", text: "Pricey but worth every penny. Converts for two kids.", date: "Feb 20" }] }, { id: "r11-2", brand: "Nuna",           model: "TRVL",                           votes: 14, comments: [{ id: 1, author: "Jordan S.", text: "Compact fold, great for travel. Lighter than the Vista.", date: "Mar 10" }] }, { id: "r11-3", brand: "Baby Jogger", model: "City Mini GT2", votes: 10, comments: [] }] },
  { id: 12, category: "Transport", name: "Car Seat (Infant)",   recs: [{ id: "r12-1", brand: "Chicco",               model: "KeyFit 35",                       votes: 19, comments: [] }, { id: "r12-2", brand: "Nuna",           model: "PIPA Lite LX",                   votes: 13, comments: [{ id: 1, author: "Sam T.", text: "Incredibly light — huge plus when baby is asleep.", date: "Mar 6" }] }] },
  { id: 13, category: "Transport", name: "Baby Carrier",        recs: [{ id: "r13-1", brand: "Ergobaby",             model: "Omni 360",                        votes: 16, comments: [{ id: 1, author: "Lisa N.", text: "Great for keeping baby close hands-free.", date: "Mar 3" }] }, { id: "r13-2", brand: "Solly Baby",     model: "Wrap",                           votes: 9,  comments: [] }] },

  // ── Baby: Bathing ─────────────────────────────────────────────────────────
  { id: 14, category: "Bathing", name: "Baby Bathtub",          recs: [{ id: "r14-1", brand: "Frida Baby",           model: "4-in-1 Grow-with-Me Tub",         votes: 8,  comments: [] }, { id: "r14-2", brand: "Blooming Bath",  model: "Lotus Baby Bath Seat",           votes: 6,  comments: [] }] },
  { id: 15, category: "Bathing", name: "Baby Thermometer",      recs: [{ id: "r15-1", brand: "Fridababy",            model: "3-in-1 Infrared Thermometer",     votes: 13, comments: [] }] },

  // ── Baby: Play & Development ──────────────────────────────────────────────
  { id: 16, category: "Play & Development", name: "Baby Bouncer",   recs: [{ id: "r16-1", brand: "BABYBJÖRN",        model: "Bouncer Bliss",                   votes: 12, comments: [{ id: 1, author: "Hana W.", text: "Bounces with baby's own movement — no batteries!", date: "Mar 11" }] }, { id: "r16-2", brand: "4moms",          model: "mamaRoo 4",                      votes: 10, comments: [] }] },
  { id: 17, category: "Play & Development", name: "Activity Gym",   recs: [{ id: "r17-1", brand: "Lovevery",         model: "The Play Gym",                    votes: 17, comments: [{ id: 1, author: "Dana H.", text: "Grows with your baby from newborn through 12 months!", date: "Mar 6" }] }] },
  { id: 18, category: "Play & Development", name: "Baby Swing",     recs: [{ id: "r18-1", brand: "Graco",            model: "Sense2Soothe Swing",              votes: 8,  comments: [] }] },

  // ── Baby: Clothing & Comfort ──────────────────────────────────────────────
  { id: 19, category: "Clothing & Comfort", name: "Swaddles",       recs: [{ id: "r19-1", brand: "Aden + Anais",     model: "Muslin Swaddle Blankets",         votes: 21, comments: [] }, { id: "r19-2", brand: "Nested Bean",   model: "Zen Swaddle Classic",            votes: 7,  comments: [] }] },
  { id: 20, category: "Clothing & Comfort", name: "Wearable Blanket", recs: [{ id: "r20-1", brand: "HALO",           model: "SleepSack Swaddle",               votes: 16, comments: [] }] },

  // ── Baby: Health & Safety ─────────────────────────────────────────────────
  { id: 21, category: "Health & Safety", name: "Nasal Aspirator",   recs: [{ id: "r21-1", brand: "Fridababy",        model: "NoseFrida",                       votes: 25, comments: [{ id: 1, author: "Chris P.", text: "Gross but works better than anything else.", date: "Mar 4" }] }] },
  { id: 22, category: "Health & Safety", name: "Baby First Aid Kit", recs: [{ id: "r22-1", brand: "Safety 1st",      model: "Deluxe Healthcare Kit",           votes: 9,  comments: [] }] },

  // ══════════════════════════════════════════════════════════════════════════
  // ── For Parents ───────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════

  // Feeding Support (resources, not products)
  { id: 100, category: "Feeding Support", name: "Lactation Consultants", recs: [{ id: "rp1-1", brand: "IBCLC Locator", model: "uslca.org/find-an-ibclc", votes: 18, comments: [{ id: 1, author: "Tara L.", text: "See an IBCLC in the hospital if you can — before you go home.", date: "Apr 2" }] }, { id: "rp1-2", brand: "La Leche League", model: "llli.org (free peer support)", votes: 12, comments: [] }] },
  { id: 101, category: "Feeding Support", name: "Lactation Supplements", recs: [{ id: "rp2-1", brand: "Legendairy Milk", model: "Liquid Gold", votes: 8, comments: [{ id: 1, author: "Bree T.", text: "Noticeably helped my supply — start slow though.", date: "Apr 5" }] }, { id: "rp2-2", brand: "BodyBio", model: "Sunflower Lecithin (clogs)", votes: 6, comments: [] }] },
  { id: 102, category: "Feeding Support", name: "Breastfeeding / Chestfeeding Books", recs: [{ id: "rp3-1", brand: "La Leche League", model: "The Womanly Art of Breastfeeding", votes: 12, comments: [] }, { id: "rp3-2", brand: "Robin Kaplan", model: "Latch: A Handbook for Breastfeeding", votes: 8, comments: [] }] },
  { id: 103, category: "Feeding Support", name: "Online Feeding Communities", recs: [{ id: "rp4-1", brand: "Reddit", model: "r/breastfeeding", votes: 10, comments: [{ id: 1, author: "Jen A.", text: "Surprisingly helpful and non-judgmental.", date: "Apr 3" }] }, { id: "rp4-2", brand: "Facebook", model: "Breastfeeding Support groups", votes: 7, comments: [] }] },

  // Solids & Starting Foods (resources / approaches)
  { id: 110, category: "Solids & Starting Foods", name: "Feeding Approaches", recs: [{ id: "rp10-1", brand: "Baby-Led Weaning", model: '"Baby-Led Weaning" by Rapley & Murkett', votes: 15, comments: [{ id: 1, author: "Liz M.", text: "We did BLW and it was so much less stressful than purées.", date: "Apr 6" }] }, { id: "rp10-2", brand: "Solid Starts", model: "solidstarts.com (free food database)", votes: 22, comments: [{ id: 1, author: "Dan K.", text: "Look up any food before serving — shows texture, size, allergen info.", date: "Apr 10" }] }] },
  { id: 111, category: "Solids & Starting Foods", name: "Allergen Introduction", recs: [{ id: "rp11-1", brand: "Ready. Set. Food!", model: "Gradual allergen intro system", votes: 14, comments: [{ id: 1, author: "Petra O.", text: "Pediatrician recommended. Takes the guesswork out of allergen timing.", date: "Apr 9" }] }, { id: "rp11-2", brand: "FARE", model: "foodallergy.org (research + guidance)", votes: 9, comments: [] }] },
  { id: 112, category: "Solids & Starting Foods", name: "Meal Inspiration", recs: [{ id: "rp12-1", brand: "Solid Starts App", model: "First Foods Database", votes: 17, comments: [] }, { id: "rp12-2", brand: "Feeding Littles", model: "feedinglittles.com", votes: 11, comments: [{ id: 1, author: "Cass W.", text: "Great Instagram too — real food, no drama.", date: "Apr 8" }] }] },

  // Sleep Resources
  { id: 120, category: "Sleep Resources", name: "Sleep Training Programs", recs: [{ id: "rp20-1", brand: "Taking Cara Babies", model: "Newborn + ABCs of Sleep courses", votes: 24, comments: [{ id: 1, author: "Erin G.", text: "Life-changing. Worth every penny before baby arrives.", date: "Apr 14" }] }, { id: "rp20-2", brand: "Cara Dumaplin", model: "ABCs of Sleep (4–24 mo)", votes: 18, comments: [] }] },
  { id: 121, category: "Sleep Resources", name: "Sleep Books", recs: [{ id: "rp21-1", brand: "Marc Weissbluth", model: "Healthy Sleep Habits, Happy Child", votes: 15, comments: [{ id: 1, author: "Nina B.", text: "Dense but thorough. Skip to the chapter for your baby's age.", date: "Apr 28" }] }, { id: "rp21-2", brand: "Richard Ferber", model: "Solve Your Child's Sleep Problems", votes: 13, comments: [] }, { id: "rp21-3", brand: "Kim West", model: "The Sleep Lady's Good Night, Sleep Tight", votes: 10, comments: [] }] },
  { id: 122, category: "Sleep Resources", name: "Baby Tracking Apps", recs: [{ id: "rp22-1", brand: "Huckleberry", model: "Smart Sleep Schedule", votes: 20, comments: [{ id: 1, author: "Nate V.", text: "The SweetSpot sleep prediction is scarily accurate.", date: "Apr 12" }] }, { id: "rp22-2", brand: "Baby Tracker", model: "Nursing & Sleep Log", votes: 11, comments: [] }] },
  { id: 123, category: "Sleep Resources", name: "Sleep for You (Postpartum)", recs: [{ id: "rp23-1", brand: "Pregnancy Pillow", model: "Leachco Snoogle Total Body Pillow", votes: 21, comments: [{ id: 1, author: "Kim D.", text: "Started using at 20 weeks and never looked back.", date: "Apr 18" }] }, { id: "rp23-2", brand: "Eye Mask", model: "Manta Sleep Mask Pro", votes: 9, comments: [] }] },

  // Postpartum Recovery
  { id: 130, category: "Postpartum Recovery", name: "Hospital Bag Essentials", recs: [{ id: "rp30-1", brand: "Frida Mom", model: "Labor & Delivery + Recovery Kit", votes: 23, comments: [{ id: 1, author: "Abby K.", text: "Just buy the whole kit. It has everything you need and didn't know you needed.", date: "Apr 21" }] }] },
  { id: 131, category: "Postpartum Recovery", name: "Perineal Care", recs: [{ id: "rp31-1", brand: "Frida Mom", model: "Upside Down Peri Bottle", votes: 27, comments: [{ id: 1, author: "Lucia M.", text: "The angled design is genuinely genius. Non-negotiable.", date: "Apr 22" }] }, { id: "rp31-2", brand: "Earth Mama", model: "Herbal Perineal Spray", votes: 15, comments: [] }, { id: "rp31-3", brand: "Mommy Knows Best", model: "Sitz Bath Soak", votes: 10, comments: [] }] },
  { id: 132, category: "Postpartum Recovery", name: "C-Section Recovery", recs: [{ id: "rp32-1", brand: "Frida Mom", model: "C-Section Recovery Shorts", votes: 13, comments: [{ id: 1, author: "Fran O.", text: "Specifically designed for C-section comfort. So helpful.", date: "Apr 23" }] }, { id: "rp32-2", brand: "Belly Bandit", model: "B.F.F. Postpartum Wrap", votes: 11, comments: [] }] },
  { id: 133, category: "Postpartum Recovery", name: "Nutrition & Supplements", recs: [{ id: "rp33-1", brand: "Colace", model: "Stool Softener", votes: 14, comments: [{ id: 1, author: "Sam W.", text: "Your OB will probably recommend this. Just get it now.", date: "Apr 24" }] }, { id: "rp33-2", brand: "FullWell", model: "Prenatal + Postnatal Vitamins", votes: 10, comments: [] }] },
  { id: 134, category: "Postpartum Recovery", name: "Recovery Resources & Communities", recs: [{ id: "rp34-1", brand: "ACOG", model: "acog.org/postpartum-care", votes: 8, comments: [] }, { id: "rp34-2", brand: "4th Trimester Bodies Project", model: "4thtrimesterbodies.com", votes: 11, comments: [{ id: 1, author: "Gwen S.", text: "A beautiful, normalizing resource.", date: "Apr 30" }] }] },

  // Mental Health & Wellness
  { id: 140, category: "Mental Health & Wellness", name: "Perinatal Therapist Finder", recs: [{ id: "rp40-1", brand: "Postpartum Support International", model: "postpartum.net / helpline: 1-800-944-4773", votes: 16, comments: [{ id: 1, author: "Dr. Chen", text: "PSI specializes in perinatal mental health. Free helpline available.", date: "Apr 25" }] }, { id: "rp40-2", brand: "Therapy for Black Girls", model: "therapyforblackgirls.com", votes: 11, comments: [] }, { id: "rp40-3", brand: "Latinx Therapy", model: "latinxtherapy.com", votes: 8, comments: [] }] },
  { id: 141, category: "Mental Health & Wellness", name: "Meditation & Mindfulness Apps", recs: [{ id: "rp41-1", brand: "Calm", model: "Sleep & Meditation App", votes: 14, comments: [] }, { id: "rp41-2", brand: "Headspace", model: "Mindfulness App", votes: 10, comments: [] }] },
  { id: 142, category: "Mental Health & Wellness", name: "New Parent Support Groups", recs: [{ id: "rp42-1", brand: "PEPS", model: "Program for Early Parent Support (peps.org)", votes: 12, comments: [{ id: 1, author: "Laura K.", text: "Found my village through PEPS. Completely changed my postpartum experience.", date: "Apr 26" }] }, { id: "rp42-2", brand: "Postpartum Support International", model: "Online support groups (free)", votes: 9, comments: [] }] },
  { id: 143, category: "Mental Health & Wellness", name: "Journaling & Reflection", recs: [{ id: "rp43-1", brand: "Promptly Journals", model: "Baby & Me Journal", votes: 9, comments: [] }, { id: "rp43-2", brand: "Five Minute Journal", model: "Daily Gratitude Journal", votes: 7, comments: [] }] },

  // Parenting Tools & Apps
  { id: 150, category: "Parenting Tools & Apps", name: "Pediatrician Finder", recs: [{ id: "rp50-1", brand: "Zocdoc", model: "zocdoc.com — filter by insurance + new patients", votes: 14, comments: [{ id: 1, author: "Alicia F.", text: "Filter by insurance and new patients — saved us so much time.", date: "Apr 11" }] }, { id: "rp50-2", brand: "AAP", model: "healthychildren.org", votes: 9, comments: [] }] },
  { id: 151, category: "Parenting Tools & Apps", name: "All-in-One Baby Tracker", recs: [{ id: "rp51-1", brand: "Huckleberry", model: "huckleberrycare.com", votes: 20, comments: [] }, { id: "rp51-2", brand: "Baby Tracker", model: "Baby Tracker — Nursing & Log", votes: 11, comments: [] }] },
  { id: 152, category: "Parenting Tools & Apps", name: "CPR & First Aid Training", recs: [{ id: "rp52-1", brand: "American Red Cross", model: "redcross.org/infant-cpr", votes: 18, comments: [{ id: 1, author: "Todd F.", text: "Take a class before baby arrives. It's 2 hours and gives you so much confidence.", date: "Apr 27" }] }, { id: "rp52-2", brand: "American Heart Association", model: "Heartsaver Pediatric First Aid CPR", votes: 12, comments: [] }] },
  { id: 153, category: "Parenting Tools & Apps", name: "Car Seat Safety Check", recs: [{ id: "rp53-1", brand: "NHTSA", model: "nhtsa.gov/car-seats — find a certified tech", votes: 15, comments: [{ id: 1, author: "Sam T.", text: "Free inspection at fire stations and hospitals. Most car seats are installed wrong.", date: "Mar 6" }] }] },

  // Recommended Reading
  { id: 160, category: "Recommended Reading", name: "Newborn Care",             recs: [{ id: "rp60-1", brand: "Harvey Karp",        model: "The Happiest Baby on the Block",           votes: 19, comments: [{ id: 1, author: "Todd F.", text: "The 5 S's really work. Read before baby arrives.", date: "Apr 27" }] }, { id: "rp60-2", brand: "Heidi Murkoff",    model: "What to Expect the First Year",            votes: 14, comments: [] }] },
  { id: 161, category: "Recommended Reading", name: "Parenting Philosophy",     recs: [{ id: "rp61-1", brand: "Daniel Siegel",      model: "The Whole-Brain Child",                    votes: 17, comments: [] }, { id: "rp61-2", brand: "Janet Lansbury",   model: "No Bad Kids: Toddler Discipline",          votes: 14, comments: [{ id: 1, author: "Chris A.", text: "Her RIE approach is calm, respectful, and actually works.", date: "Apr 29" }] }] },
  { id: 162, category: "Recommended Reading", name: "Postpartum & Parent Wellbeing", recs: [{ id: "rp62-1", brand: "Alexandra Sacks", model: "What No One Tells You",                 votes: 16, comments: [{ id: 1, author: "Gwen S.", text: "Read this before and after birth. Normalizes so much.", date: "Apr 30" }] }, { id: "rp62-2", brand: "Emily Oster",      model: "Cribsheet",                                votes: 18, comments: [{ id: 1, author: "Paul N.", text: "Data-driven takes on every major first-year decision. No judgment.", date: "May 1" }] }] },
  { id: 163, category: "Recommended Reading", name: "Relationship & Co-Parenting", recs: [{ id: "rp63-1", brand: "John Gottman",     model: "And Baby Makes Three",                     votes: 11, comments: [{ id: 1, author: "Bea C.", text: "Essential if you want to protect your relationship through the newborn phase.", date: "Apr 16" }] }] },

  // Favorite Shops & Resale
  { id: 170, category: "Favorite Shops & Resale", name: "Baby Clothing",        recs: [{ id: "rp70-1", brand: "Primary",            model: "primary.com",                              votes: 14, comments: [{ id: 1, author: "Jade W.", text: "Simple, affordable basics in great colors. No logos or characters.", date: "May 2" }] }, { id: "rp70-2", brand: "Hanna Andersson", model: "hannaandersson.com",                        votes: 12, comments: [] }, { id: "rp70-3", brand: "Pact",             model: "wearpact.com — organic + fair trade",      votes: 9, comments: [] }] },
  { id: 171, category: "Favorite Shops & Resale", name: "Toys & Books",         recs: [{ id: "rp71-1", brand: "Lovevery",           model: "lovevery.com",                             votes: 20, comments: [{ id: 1, author: "Mia C.", text: "The play kits are curated by age and stage. Nothing feels like filler.", date: "May 4" }] }, { id: "rp71-2", brand: "Tegu",             model: "tegu.com — magnetic wooden blocks",        votes: 9, comments: [] }] },
  { id: 172, category: "Favorite Shops & Resale", name: "Secondhand & Resale",  recs: [{ id: "rp72-1", brand: "Facebook Marketplace", model: "Local Buy Nothing groups",               votes: 16, comments: [{ id: 1, author: "Carla B.", text: "Babies outgrow things so fast — secondhand is totally the move.", date: "May 5" }] }, { id: "rp72-2", brand: "ThredUp",          model: "thredup.com — kids section",               votes: 11, comments: [] }, { id: "rp72-3", brand: "Poshmark",         model: "Kids & Baby category",                     votes: 8, comments: [] }] },
  { id: 173, category: "Favorite Shops & Resale", name: "Gear & Big Ticket Items", recs: [{ id: "rp73-1", brand: "Albee Baby",      model: "albeebaby.com",                            votes: 13, comments: [{ id: 1, author: "Derek P.", text: "Better stroller selection and prices than the big box stores.", date: "May 6" }] }, { id: "rp73-2", brand: "Buy Buy Baby",     model: "buybuybaby.com",                           votes: 10, comments: [] }] },
];

const BASE_CATEGORIES = [...BABY_CATS, ...PARENT_CATS];
const MEDAL = ["🥇", "🥈", "🥉"];

// ── Helpers ────────────────────────────────────────────────────────────────
const catColor = (cat) => CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;

// ── FAB Modal ──────────────────────────────────────────────────────────────
function AddItemModal({ isOpen, onClose, categories, activeCategory, onAdd }) {
  const [step, setStep] = useState(1);
  const [itemName, setItemName] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [isNewCat, setIsNewCat] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState("");
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setItemName(""); setNewCatName(""); setBrand(""); setModel(""); setNote(""); setAuthor("");
      setIsNewCat(false);
      setSelectedCat(activeCategory !== "All" ? activeCategory : categories[0] || "");
      setTimeout(() => firstInputRef.current?.focus(), 120);
    }
  }, [isOpen, activeCategory, categories]);

  const finalCategory = isNewCat ? newCatName.trim() : selectedCat;
  const cc = catColor(finalCategory) || P.peach;
  const canProceed = itemName.trim() && finalCategory;

  const handleAdd = () => {
    if (!canProceed) return;
    const hasBrand = brand.trim() || model.trim();
    const recId = `r-${Date.now()}`;
    const newItem = {
      id: Date.now(), category: finalCategory, name: itemName.trim(),
      recs: hasBrand ? [{ id: recId, brand: brand.trim(), model: model.trim(), votes: 1, comments: note.trim() ? [{ id: Date.now(), author: author.trim() || "Anonymous", text: note.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] : [] }] : []
    };
    onAdd(newItem);
    onClose();
  };

  if (!isOpen) return null;

  const inputStyle = (accent) => ({
    width: "100%", padding: "11px 14px", border: `1.5px solid ${P.grayLight}`, borderRadius: "12px",
    fontSize: "14.5px", fontFamily: "inherit", outline: "none", color: P.greenDark,
    background: P.card, boxSizing: "border-box", transition: "border-color 0.15s",
  });

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,44,36,0.5)", backdropFilter: "blur(4px)", zIndex: 50, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51, background: P.page, borderRadius: "24px 24px 0 0", boxShadow: "0 -8px 48px rgba(30,44,36,0.16)", padding: "0 0 env(safe-area-inset-bottom, 24px)", animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)", maxHeight: "92vh", overflowY: "auto", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: P.grayLight }} />
        </div>
        <div style={{ padding: "8px 22px 16px", borderBottom: `1.5px solid ${P.grayLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "400", color: P.greenDark, fontStyle: "italic" }}>Add Registry Item</h2>
            <p style={{ margin: "3px 0 0", fontSize: "13px", color: P.gray }}>Step {step} of 2 — {step === 1 ? "Item details" : "First recommendation"}</p>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: P.grayFaint, color: P.gray, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {/* Progress */}
        <div style={{ height: "3px", background: P.grayLight }}>
          <div style={{ height: "100%", width: step === 1 ? "50%" : "100%", background: cc, borderRadius: "0 2px 2px 0", transition: "width 0.35s ease, background 0.3s ease" }} />
        </div>

        <div style={{ padding: "20px 22px 28px" }}>
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: P.gray, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>Item name *</label>
                <input ref={firstInputRef} value={itemName} onChange={e => setItemName(e.target.value)} onKeyDown={e => e.key === "Enter" && canProceed && setStep(2)} placeholder="e.g. Onesies, Nursing Pillow…" style={inputStyle(cc)} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: P.gray, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>Category *</label>
                {!isNewCat ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {categories.map(cat => {
                      const cc2 = catColor(cat);
                      const active = selectedCat === cat;
                      return (
                        <button key={cat} onClick={() => setSelectedCat(cat)} style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${active ? cc2 : P.grayLight}`, background: active ? cc2 : "transparent", color: active ? "#fff" : P.gray, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", fontWeight: active ? "600" : "400" }}>{cat}</button>
                      );
                    })}
                    <button onClick={() => { setIsNewCat(true); setSelectedCat(""); }} style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px dashed ${P.peach}`, background: "transparent", color: P.peach, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>+ New category</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category name…" style={{ ...inputStyle(P.peach), flex: 1 }} onFocus={e => e.target.style.borderColor = P.peach} onBlur={e => e.target.style.borderColor = P.grayLight} />
                    <button onClick={() => { setIsNewCat(false); setSelectedCat(categories[0] || ""); }} style={{ padding: "10px 14px", borderRadius: "12px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: P.gray, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  </div>
                )}
              </div>
              {finalCategory && itemName.trim() && (
                <div style={{ padding: "10px 14px", borderRadius: "12px", background: cc + "18", border: `1px solid ${cc}45`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                  <span style={{ fontSize: "13.5px", color: P.green }}><strong>{itemName.trim()}</strong> → <strong>{finalCategory}</strong></span>
                </div>
              )}
              <button onClick={() => setStep(2)} disabled={!canProceed} style={{ padding: "13px", borderRadius: "14px", border: "none", background: canProceed ? cc : P.grayLight, color: canProceed ? "#fff" : P.gray, fontSize: "15px", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: "600", transition: "all 0.2s", marginTop: "4px" }}>Next: Add a recommendation →</button>
              <button onClick={handleAdd} disabled={!canProceed} style={{ padding: "10px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: canProceed ? P.gray : P.grayLight, fontSize: "13.5px", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Skip, just add item</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "12px", background: cc + "18", border: `1px solid ${cc}45`, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: P.green }}><strong>{itemName.trim()}</strong> · {finalCategory}</span>
                <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: "11.5px", color: cc, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>edit</button>
              </div>
              <p style={{ margin: 0, fontSize: "13.5px", color: P.gray, fontStyle: "italic" }}>Suggest the first brand/model — others can add more and vote.</p>
              {[["Brand", brand, setBrand, "e.g. Carter's, Lovevery…"], ["Model / version", model, setModel, "e.g. 5-Pack Short Sleeve…"], ["Your name", author, setAuthor, "optional"]].map(([lbl, val, setter, ph]) => (
                <div key={lbl}>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: P.gray, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>{lbl}</label>
                  <input autoFocus={lbl === "Brand"} value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={inputStyle(cc)} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: P.gray, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>Why do you love it?</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="optional tip or note…" rows={2} style={{ ...inputStyle(cc), resize: "vertical" }} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={() => setStep(1)} style={{ padding: "12px 16px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: P.gray, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "none", background: cc, color: "#fff", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>🎉 Add to Registry</button>
              </div>
              <button onClick={handleAdd} style={{ padding: "10px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: P.gray, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Add without recommendation</button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
    </>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function BabyRegistry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("baby");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recVotes, setRecVotes] = useState({});

  // ── Load all data from Supabase ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: itemRows }, { data: recRows }, { data: commentRows }] = await Promise.all([
        supabase.from("items").select("*").order("id"),
        supabase.from("recs").select("*").order("votes", { ascending: false }),
        supabase.from("comments").select("*").order("created_at"),
      ]);

      // Shape into the nested structure the UI expects
      const commentsByRec = (commentRows || []).reduce((acc, c) => {
        if (!acc[c.rec_id]) acc[c.rec_id] = [];
        acc[c.rec_id].push(c);
        return acc;
      }, {});

      const recsByItem = (recRows || []).reduce((acc, r) => {
        if (!acc[r.item_id]) acc[r.item_id] = [];
        acc[r.item_id].push({ ...r, comments: commentsByRec[r.id] || [] });
        return acc;
      }, {});

      const shaped = (itemRows || []).map(item => ({
        ...item,
        recs: recsByItem[item.id] || [],
      }));

      setItems(shaped);
    } catch (err) {
      console.error("Failed to load registry data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedRec, setExpandedRec] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [commentAuthor, setCommentAuthor] = useState({});
  const [sortBy, setSortBy] = useState("category");
  const [addingRecTo, setAddingRecTo] = useState(null);
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [fabHover, setFabHover] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const allCategories = [...new Set([...BASE_CATEGORIES, ...items.map(i => i.category)])];
  const sectionCats = activeSection === "baby"
    ? allCategories.filter(c => !PARENT_CATS.includes(c) || BABY_CATS.includes(c))
    : allCategories.filter(c => PARENT_CATS.includes(c) || (!BABY_CATS.includes(c) && !PARENT_CATS.includes(c)));

  const handleAddItem = async (newItem) => {
    // Optimistic update
    setItems(its => [...its, newItem]);
    const isParentCat = PARENT_CATS.includes(newItem.category);
    setActiveSection(isParentCat ? "parents" : "baby");
    setActiveCategory(newItem.category);
    setExpandedItem(newItem.id);
    setSuccessMsg(`"${newItem.name}" added to ${newItem.category}!`);
    setTimeout(() => setSuccessMsg(""), 3000);

    // Persist to Supabase
    try {
      const { data: itemData } = await supabase
        .from("items")
        .insert({ id: newItem.id, category: newItem.category, name: newItem.name })
        .select()
        .single();

      if (newItem.recs.length > 0) {
        const rec = newItem.recs[0];
        await supabase.from("recs").insert({
          id: rec.id, item_id: itemData.id,
          brand: rec.brand, model: rec.model, votes: rec.votes,
        });
        if (rec.comments.length > 0) {
          const c = rec.comments[0];
          await supabase.from("comments").insert({
            rec_id: rec.id, author: c.author, text: c.text, date: c.date,
          });
        }
      }
    } catch (err) {
      console.error("Failed to save new item:", err);
    }
  };

  const handleRecVote = async (itemId, recId, dir) => {
    const existing = recVotes[recId];
    const delta = dir === "up" ? 1 : -1;
    const adjustment = existing === dir ? -delta : existing ? delta * 2 : delta;
    setRecVotes(v => { const n = { ...v }; if (existing === dir) delete n[recId]; else n[recId] = dir; return n; });
    // Optimistic UI update
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, votes: r.votes + adjustment } : r) }));
    // Persist
    try {
      const { data: rec } = await supabase.from("recs").select("votes").eq("id", recId).single();
      await supabase.from("recs").update({ votes: rec.votes + adjustment }).eq("id", recId);
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const addComment = async (itemId, recId) => {
    const text = (newComment[recId] || "").trim();
    const author = (commentAuthor[recId] || "").trim() || "Anonymous";
    if (!text) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const comment = { id: Date.now(), rec_id: recId, author, text, date };
    // Optimistic
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, comments: [...r.comments, comment] } : r) }));
    setNewComment(n => ({ ...n, [recId]: "" }));
    setCommentAuthor(n => ({ ...n, [recId]: "" }));
    // Persist
    try {
      await supabase.from("comments").insert({ rec_id: recId, author, text, date });
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const submitNewRec = async (itemId) => {
    if (!newBrand.trim() && !newModel.trim()) return;
    const recId = `r${itemId}-${Date.now()}`;
    const newRec = { id: recId, item_id: itemId, brand: newBrand.trim(), model: newModel.trim(), votes: 1, comments: newNote.trim() ? [{ id: Date.now(), author: newNoteAuthor.trim() || "Anonymous", text: newNote.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] : [] };
    // Optimistic
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: [...item.recs, newRec] }));
    setRecVotes(v => ({ ...v, [recId]: "up" }));
    setAddingRecTo(null);
    setNewBrand(""); setNewModel(""); setNewNote(""); setNewNoteAuthor("");
    // Persist
    try {
      await supabase.from("recs").insert({ id: recId, item_id: itemId, brand: newRec.brand, model: newRec.model, votes: 1 });
      if (newRec.comments.length > 0) {
        const c = newRec.comments[0];
        await supabase.from("comments").insert({ rec_id: recId, author: c.author, text: c.text, date: c.date });
      }
    } catch (err) {
      console.error("Failed to save recommendation:", err);
    }
  };

  const sortedRecs = (recs) => [...recs].sort((a, b) => b.votes - a.votes);

  const displayCategories = ["All", ...sectionCats];
  const filtered = items
    .filter(i => sectionCats.includes(i.category))
    .filter(i => activeCategory === "All" || i.category === activeCategory)
    .sort((a, b) => sortBy === "votes"
      ? Math.max(...b.recs.map(r => r.votes), 0) - Math.max(...a.recs.map(r => r.votes), 0)
      : a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const grouped = filtered.reduce((acc, item) => { if (!acc[item.category]) acc[item.category] = []; acc[item.category].push(item); return acc; }, {});
  const totalComments = (item) => item.recs.reduce((s, r) => s + r.comments.length, 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: P.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", gap: "16px" }}>
      <div style={{ fontSize: "44px", animation: "spin 2s linear infinite" }}>🍼</div>
      <p style={{ color: P.gray, fontSize: "15px", fontStyle: "italic" }}>Loading registry…</p>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: P.page, fontFamily: "Georgia, serif" }}>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${P.peachFaint} 0%, ${P.greenFaint} 50%, ${P.blueFaint} 100%)`, borderBottom: `2px solid ${P.grayLight}`, padding: "44px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 15% 85%, ${P.pink}22 0%, transparent 55%), radial-gradient(circle at 85% 15%, ${P.blue}18 0%, transparent 55%)` }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>🍼</div>
          <h1 style={{ margin: "0 0 5px", fontSize: "clamp(26px, 5vw, 40px)", fontWeight: "400", color: P.greenDark, letterSpacing: "0.02em", fontStyle: "italic" }}>Baby Registry</h1>
          <p style={{ margin: "0 0 18px", color: P.gray, fontSize: "14.5px" }}>Community-ranked recommendations — vote for your favorites</p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 18px", borderRadius: "20px", border: `1.5px solid ${P.peach}`, background: "rgba(255,255,255,0.8)", color: P.greenDark, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
            <option value="category">Sort by Category</option>
            <option value="votes">Sort by Most Loved</option>
          </select>
        </div>
      </div>

      {/* ── Section switcher (Baby / For Parents) ── */}
      <div style={{ background: P.greenDark, display: "flex" }}>
        {[
          { key: "baby",    label: "👶  For Baby",    emoji: "👶" },
          { key: "parents", label: "🧡  For Parents",  emoji: "🧡" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => { setActiveSection(s.key); setActiveCategory("All"); }}
            style={{
              flex: 1, padding: "13px 8px", border: "none", cursor: "pointer", fontFamily: "inherit",
              background: activeSection === s.key ? P.page : "transparent",
              color: activeSection === s.key ? P.greenDark : "rgba(255,255,255,0.65)",
              fontSize: "14px", fontWeight: "600", letterSpacing: "0.02em",
              borderBottom: activeSection === s.key ? `3px solid ${activeSection === "baby" ? P.peach : P.pink}` : "3px solid transparent",
              transition: "all 0.2s",
            }}
          >{s.label}</button>
        ))}
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ background: P.page, borderBottom: `1.5px solid ${P.grayLight}`, padding: "10px 16px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "7px", minWidth: "max-content", margin: "0 auto", maxWidth: "960px" }}>
          {displayCategories.map(cat => {
            const cc = cat === "All" ? (activeSection === "baby" ? P.peach : P.pink) : catColor(cat);
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${active ? cc : P.grayLight}`, background: active ? cc : "transparent", color: active ? "#fff" : P.gray, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", fontWeight: active ? "600" : "400", transition: "all 0.18s", whiteSpace: "nowrap" }}>{cat}</button>
            );
          })}
        </div>
      </div>

      {/* ── Items ── */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "26px 16px 100px" }}>
        {Object.entries(grouped).map(([category, catItems]) => {
          const cc = catColor(category);
          return (
            <div key={category} style={{ marginBottom: "34px" }}>
              {sortBy === "category" && activeCategory === "All" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                  <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "400", color: P.green, fontStyle: "italic" }}>{category}</h2>
                  <div style={{ flex: 1, height: "1px", background: P.grayLight }} />
                  <span style={{ fontSize: "11.5px", color: P.gray }}>{catItems.length} items</span>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {catItems.map(item => {
                  const cc = catColor(item.category);
                  const sorted = sortedRecs(item.recs);
                  const isOpen = expandedItem === item.id;
                  const topRec = sorted[0];

                  return (
                    <div key={item.id} style={{ background: P.card, borderRadius: "16px", border: `1.5px solid ${P.grayLight}`, overflow: "hidden", boxShadow: isOpen ? `0 6px 28px ${cc}22` : `0 1px 5px rgba(46,79,63,0.06)`, transition: "box-shadow 0.2s" }}>

                      {/* Card header */}
                      <div onClick={() => { setExpandedItem(isOpen ? null : item.id); if (!isOpen) setAddingRecTo(null); }} style={{ display: "flex", alignItems: "center", padding: "14px 18px", gap: "12px", cursor: "pointer", userSelect: "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "15.5px", fontWeight: "600", color: P.greenDark }}>{item.name}</span>
                            <span style={{ fontSize: "10.5px", padding: "2px 8px", borderRadius: "10px", background: cc + "22", color: P.greenDark, border: `1px solid ${cc}55` }}>{item.category}</span>
                          </div>
                          {topRec ? (
                            <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", color: cc, fontWeight: "600" }}>🥇 Top pick:</span>
                              <span style={{ fontSize: "13px", color: P.green, fontWeight: "500" }}>{topRec.brand}</span>
                              {topRec.model && <><span style={{ color: P.gray, fontSize: "11px" }}>·</span><span style={{ fontSize: "12.5px", color: P.gray, fontStyle: "italic" }}>{topRec.model}</span></>}
                              <span style={{ fontSize: "11.5px", color: P.gray }}>({topRec.votes} votes{item.recs.length > 1 ? `, +${item.recs.length - 1} alt${item.recs.length > 2 ? "s" : ""}` : ""})</span>
                            </div>
                          ) : (
                            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: P.gray, fontStyle: "italic" }}>No recommendations yet — be the first!</p>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                          {totalComments(item) > 0 && <span style={{ fontSize: "12px", color: P.gray }}>💬 {totalComments(item)}</span>}
                          <span style={{ fontSize: "17px", color: cc, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", lineHeight: 1 }}>⌄</span>
                        </div>
                      </div>

                      {/* Expanded recommendations */}
                      {isOpen && (
                        <div style={{ borderTop: `1.5px solid ${P.grayLight}` }}>
                          {sorted.map((rec, idx) => {
                            const myVote = recVotes[rec.id];
                            const recOpen = expandedRec === rec.id;
                            const isTop = idx === 0;
                            return (
                              <div key={rec.id} style={{ borderBottom: `1px solid ${P.grayFaint}`, background: isTop ? "#fff" : P.grayFaint }}>
                                <div style={{ display: "flex", alignItems: "flex-start", padding: "12px 16px 12px 14px", gap: "10px" }}>
                                  {/* Rank */}
                                  <div style={{ width: "26px", flexShrink: 0, textAlign: "center", paddingTop: "6px" }}>
                                    <span style={{ fontSize: idx < 3 ? "17px" : "12px", lineHeight: 1, color: P.gray, fontWeight: "600" }}>{idx < 3 ? MEDAL[idx] : `#${idx + 1}`}</span>
                                  </div>
                                  {/* Vote buttons */}
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", flexShrink: 0, paddingTop: "2px" }}>
                                    <button onClick={e => { e.stopPropagation(); handleRecVote(item.id, rec.id, "up"); }} style={{ width: "30px", height: "25px", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "11px", background: myVote === "up" ? cc : P.grayLight, color: myVote === "up" ? "#fff" : P.gray, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>▲</button>
                                    <span style={{ fontSize: "13.5px", fontWeight: "700", color: rec.votes > 0 ? P.green : rec.votes < 0 ? P.downvote : P.gray, minWidth: "22px", textAlign: "center", lineHeight: "1.6" }}>{rec.votes}</span>
                                    <button onClick={e => { e.stopPropagation(); handleRecVote(item.id, rec.id, "down"); }} style={{ width: "30px", height: "25px", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "11px", background: myVote === "down" ? P.downvote : P.grayLight, color: myVote === "down" ? "#fff" : P.gray, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>▼</button>
                                  </div>
                                  {/* Content */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "14.5px", fontWeight: "600", color: P.greenDark }}>{rec.brand}</span>
                                      {rec.model && <span style={{ fontSize: "13px", color: P.gray, fontStyle: "italic" }}>{rec.model}</span>}
                                      {isTop && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "8px", background: P.pink, color: "#fff", fontWeight: "700", letterSpacing: "0.04em" }}>TOP PICK</span>}
                                    </div>
                                    {rec.comments.length > 0 && <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: P.gray, lineHeight: "1.45", fontStyle: "italic" }}>"{rec.comments[0].text}" <span style={{ fontStyle: "normal", fontWeight: "500", color: P.gray }}>— {rec.comments[0].author}</span></p>}
                                  </div>
                                  {/* Comment toggle */}
                                  <button onClick={e => { e.stopPropagation(); setExpandedRec(recOpen ? null : rec.id); }} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: recOpen ? P.grayFaint : "transparent", color: P.gray, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all 0.15s" }}>💬 {rec.comments.length}</button>
                                </div>

                                {/* Comments */}
                                {recOpen && (
                                  <div style={{ background: P.card, borderTop: `1px solid ${P.grayLight}`, padding: "13px 16px 14px 70px" }}>
                                    {rec.comments.length === 0 ? <p style={{ margin: "0 0 11px", color: P.gray, fontSize: "13px", fontStyle: "italic" }}>No notes yet — share why you love this one!</p> : (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "13px" }}>
                                        {rec.comments.map(c => (
                                          <div key={c.id} style={{ background: P.grayFaint, borderRadius: "10px", padding: "9px 13px", border: `1px solid ${P.grayLight}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                              <span style={{ fontSize: "12.5px", fontWeight: "600", color: P.green }}>{c.author}</span>
                                              <span style={{ fontSize: "11.5px", color: P.gray }}>{c.date}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "13.5px", color: P.greenDark, lineHeight: "1.5" }}>{c.text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                      <input value={commentAuthor[rec.id] || ""} onChange={e => setCommentAuthor(n => ({ ...n, [rec.id]: e.target.value }))} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 11px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "12.5px", fontFamily: "inherit", background: P.page, outline: "none", color: P.greenDark, boxSizing: "border-box" }} />
                                      <div style={{ display: "flex", gap: "7px" }}>
                                        <input value={newComment[rec.id] || ""} onChange={e => setNewComment(n => ({ ...n, [rec.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addComment(item.id, rec.id)} placeholder="Why do you love this one?" style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", background: P.page, outline: "none", color: P.greenDark }} />
                                        <button onClick={() => addComment(item.id, rec.id)} style={{ padding: "8px 15px", border: "none", borderRadius: "9px", background: cc, color: "#fff", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", flexShrink: 0 }}>Post</button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Add rec inline */}
                          {addingRecTo === item.id ? (
                            <div style={{ padding: "16px 18px", background: P.page, borderTop: `1px solid ${P.grayLight}` }}>
                              <p style={{ margin: "0 0 11px", fontSize: "13.5px", fontWeight: "600", color: P.green }}>➕ Suggest a brand / model</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="Brand *" style={{ flex: "1 1 130px", padding: "8px 12px", border: `1.5px solid ${cc}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card }} />
                                  <input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="Model / version" style={{ flex: "1 1 150px", padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card }} />
                                </div>
                                <input value={newNoteAuthor} onChange={e => setNewNoteAuthor(e.target.value)} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "12.5px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card, boxSizing: "border-box" }} />
                                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Why do you recommend this? (optional)" rows={2} style={{ padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card, resize: "vertical" }} />
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => submitNewRec(item.id)} style={{ padding: "9px 20px", border: "none", borderRadius: "9px", background: cc, color: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Add Recommendation</button>
                                  <button onClick={() => { setAddingRecTo(null); setNewBrand(""); setNewModel(""); setNewNote(""); setNewNoteAuthor(""); }} style={{ padding: "9px 15px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", background: "transparent", color: P.gray, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: "11px 18px", borderTop: `1px dashed ${P.grayLight}`, background: P.grayFaint }}>
                              <button onClick={e => { e.stopPropagation(); setAddingRecTo(item.id); }} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 16px", borderRadius: "20px", border: `1.5px dashed ${cc}`, background: "transparent", color: cc, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>
                                <span style={{ fontSize: "15px", lineHeight: 1 }}>+</span> Suggest another brand / model
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: P.gray }}>
            <div style={{ fontSize: "38px", marginBottom: "12px" }}>🧸</div>
            <p style={{ fontStyle: "italic" }}>No items in this category yet.</p>
            <button onClick={() => setFabOpen(true)} style={{ marginTop: "12px", padding: "10px 22px", borderRadius: "20px", border: `1.5px solid ${P.peach}`, background: "transparent", color: P.peach, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>+ Add the first item</button>
          </div>
        )}
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: P.greenDark, color: "#fff", padding: "11px 22px", borderRadius: "24px", fontSize: "14px", fontFamily: "inherit", zIndex: 60, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1)", whiteSpace: "nowrap" }}>
          🎉 {successMsg}
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setFabOpen(true)}
        onMouseEnter={() => setFabHover(true)}
        onMouseLeave={() => setFabHover(false)}
        style={{ position: "fixed", bottom: "28px", right: "24px", zIndex: 40, width: fabHover ? "auto" : "58px", height: "58px", padding: fabHover ? "0 22px" : "0", borderRadius: "29px", border: "none", background: `linear-gradient(135deg, ${P.peach} 0%, ${P.peachDark} 100%)`, color: "#fff", fontSize: fabHover ? "15px" : "26px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", boxShadow: `0 4px 20px ${P.peach}66, 0 2px 8px rgba(0,0,0,0.12)`, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap", animation: "fabPop 0.45s cubic-bezier(0.34,1.56,0.64,1)", overflow: "hidden" }}
        title="Add registry item"
      >
        <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0 }}>＋</span>
        {fabHover && <span style={{ fontSize: "14px", fontWeight: "600" }}>Add Item</span>}
      </button>

      <AddItemModal isOpen={fabOpen} onClose={() => setFabOpen(false)} categories={allCategories} activeCategory={activeCategory} onAdd={handleAddItem} />

      <style>{`
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)}to{transform:translateY(0)} }
        @keyframes fabPop { 0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1} }
        @keyframes successPop { 0%{transform:translateX(-50%) scale(0.7);opacity:0}60%{transform:translateX(-50%) scale(1.05)}100%{transform:translateX(-50%) scale(1);opacity:1} }
      `}</style>
    </div>
  );
}
