-- ─────────────────────────────────────────────────────────────
-- Baby Registry — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────

-- 1. Registry items (the "what to buy" entries)
create table if not exists items (
  id          bigint primary key,
  category    text not null,
  name        text not null,
  created_at  timestamptz default now()
);

-- 2. Recommendations (brand/model suggestions under each item)
create table if not exists recs (
  id          text primary key,
  item_id     bigint references items(id) on delete cascade,
  brand       text not null default '',
  model       text not null default '',
  votes       int  not null default 0,
  created_at  timestamptz default now()
);

-- 3. Comments on a recommendation
create table if not exists comments (
  id          bigint generated always as identity primary key,
  rec_id      text references recs(id) on delete cascade,
  author      text not null default 'Anonymous',
  text        text not null,
  date        text not null,
  created_at  timestamptz default now()
);

-- ── Enable Row Level Security (allow public read + write for now) ──────────
alter table items    enable row level security;
alter table recs     enable row level security;
alter table comments enable row level security;

-- Public read
create policy "public read items"    on items    for select using (true);
create policy "public read recs"     on recs     for select using (true);
create policy "public read comments" on comments for select using (true);

-- Public insert
create policy "public insert items"    on items    for insert with check (true);
create policy "public insert recs"     on recs     for insert with check (true);
create policy "public insert comments" on comments for insert with check (true);

-- Public update (for vote counts)
create policy "public update recs" on recs for update using (true);

-- ── Seed data ─────────────────────────────────────────────────────────────
-- Items
insert into items (id, category, name) values
  (1,   'Sleep',                   'Crib / Bassinet'),
  (2,   'Sleep',                   'Crib Mattress'),
  (3,   'Sleep',                   'Baby Monitor'),
  (38,  'Sleep',                   'Baby Sleep Sack'),
  (39,  'Sleep',                   'Sound Machine'),
  (40,  'Sleep',                   'Blackout Curtains'),
  (44,  'Sleep',                   'Bedside Co-Sleeper'),
  (4,   'Feeding',                 'Breast / Chest Pump'),
  (5,   'Feeding',                 'Bottles'),
  (6,   'Feeding',                 'High Chair'),
  (7,   'Feeding',                 'Bottle Sterilizer'),
  (24,  'Feeding',                 'Nursing Pillow'),
  (26,  'Feeding',                 'Nursing Bra'),
  (27,  'Feeding',                 'Milk Storage Bags'),
  (25,  'Feeding',                 'Nipple Cream'),
  (29,  'Feeding',                 'Baby Food Maker'),
  (30,  'Feeding',                 'Silicone Bibs'),
  (31,  'Feeding',                 'Suction Bowl & Plate'),
  (32,  'Feeding',                 'First Spoons & Utensils'),
  (33,  'Feeding',                 'Baby Food Pouches'),
  (8,   'Diapering',               'Diaper Bag'),
  (9,   'Diapering',               'Changing Pad'),
  (10,  'Diapering',               'Diaper Pail'),
  (37,  'Diapering',               'Diaper Subscription'),
  (11,  'Transport',               'Stroller'),
  (12,  'Transport',               'Car Seat (Infant)'),
  (13,  'Transport',               'Baby Carrier'),
  (14,  'Bathing',                 'Baby Bathtub'),
  (15,  'Bathing',                 'Baby Thermometer'),
  (16,  'Play & Development',      'Baby Bouncer'),
  (17,  'Play & Development',      'Activity Gym'),
  (18,  'Play & Development',      'Baby Swing'),
  (19,  'Clothing & Comfort',      'Swaddles'),
  (20,  'Clothing & Comfort',      'Wearable Blanket'),
  (21,  'Health & Safety',         'Nasal Aspirator'),
  (22,  'Health & Safety',         'Baby First Aid Kit'),
  (100, 'Feeding Support',         'Lactation Consultants'),
  (101, 'Feeding Support',         'Lactation Supplements'),
  (102, 'Feeding Support',         'Breastfeeding / Chestfeeding Books'),
  (103, 'Feeding Support',         'Online Feeding Communities'),
  (110, 'Solids & Starting Foods', 'Feeding Approaches'),
  (111, 'Solids & Starting Foods', 'Allergen Introduction'),
  (112, 'Solids & Starting Foods', 'Meal Inspiration'),
  (120, 'Sleep Resources',         'Sleep Training Programs'),
  (121, 'Sleep Resources',         'Sleep Books'),
  (122, 'Sleep Resources',         'Baby Tracking Apps'),
  (123, 'Sleep Resources',         'Sleep for You (Postpartum)'),
  (130, 'Postpartum Recovery',     'Hospital Bag Essentials'),
  (131, 'Postpartum Recovery',     'Perineal Care'),
  (132, 'Postpartum Recovery',     'C-Section Recovery'),
  (133, 'Postpartum Recovery',     'Nutrition & Supplements'),
  (134, 'Postpartum Recovery',     'Recovery Resources & Communities'),
  (140, 'Mental Health & Wellness','Perinatal Therapist Finder'),
  (141, 'Mental Health & Wellness','Meditation & Mindfulness Apps'),
  (142, 'Mental Health & Wellness','New Parent Support Groups'),
  (143, 'Mental Health & Wellness','Journaling & Reflection'),
  (150, 'Parenting Tools & Apps',  'Pediatrician Finder'),
  (151, 'Parenting Tools & Apps',  'All-in-One Baby Tracker'),
  (152, 'Parenting Tools & Apps',  'CPR & First Aid Training'),
  (153, 'Parenting Tools & Apps',  'Car Seat Safety Check'),
  (160, 'Recommended Reading',     'Newborn Care'),
  (161, 'Recommended Reading',     'Parenting Philosophy'),
  (162, 'Recommended Reading',     'Postpartum & Parent Wellbeing'),
  (163, 'Recommended Reading',     'Relationship & Co-Parenting'),
  (170, 'Favorite Shops & Resale', 'Baby Clothing'),
  (171, 'Favorite Shops & Resale', 'Toys & Books'),
  (172, 'Favorite Shops & Resale', 'Secondhand & Resale'),
  (173, 'Favorite Shops & Resale', 'Gear & Big Ticket Items')
on conflict (id) do nothing;

-- Recs (a representative sample — add more as needed)
insert into recs (id, item_id, brand, model, votes) values
  ('r1-1',   1,   'SNOO Smart Sleeper',           'Happiest Baby SNOO',              12),
  ('r1-2',   1,   'IKEA',                          'SUNDVIK Crib',                     7),
  ('r2-1',   2,   'Newton Baby',                   'Original Crib Mattress',           8),
  ('r2-2',   2,   'Naturepedic',                   'Organic Lightweight Classic',       5),
  ('r3-1',   3,   'Nanit',                         'Pro Camera',                       15),
  ('r3-2',   3,   'Owlet',                         'Dream Duo',                        10),
  ('r38-1',  38,  'HALO',                          'SleepSack Wearable Blanket',       19),
  ('r38-2',  38,  'Kyte Baby',                     'Sleep Bag (Bamboo)',               15),
  ('r39-1',  39,  'Hatch',                         'Rest+ 2nd Gen',                    18),
  ('r39-2',  39,  'LectroFan',                     'Classic White Noise Machine',      16),
  ('r39-3',  39,  'Marpac',                        'Hushh Portable (Travel)',          12),
  ('r40-1',  40,  'SlumberPod',                    'Privacy Pod',                      14),
  ('r40-2',  40,  'Redi Shade',                    'Blackout Pleated Shade',            8),
  ('r44-1',  44,  'HALO',                          'BassiNest Swivel Sleeper',         17),
  ('r44-2',  44,  'Arm''s Reach',                  'Co-Sleeper Bassinet',              13),
  ('r4-1',   4,   'Spectra',                       'S1 Plus',                          20),
  ('r4-2',   4,   'Elvie',                         'Stride Plus (Wearable)',           14),
  ('r4-3',   4,   'Willow',                        'Go Wearable Pump',                  9),
  ('r5-1',   5,   'Dr. Brown''s',                  'Anti-Colic Options+',               9),
  ('r5-2',   5,   'Comotomo',                      'Soft Silicone Bottle',              6),
  ('r6-1',   6,   'Stokke',                        'Tripp Trapp',                      11),
  ('r6-2',   6,   'BABYBJÖRN',                     'Baby Chair Bliss',                  7),
  ('r7-1',   7,   'Philips Avent',                 '3-in-1 Electric Steam',             5),
  ('r24-1',  24,  'Boppy',                         'Original Nursing Pillow',          18),
  ('r24-2',  24,  'My Brest Friend',               'Original Pillow',                  11),
  ('r26-1',  26,  'Kindred Bravely',               'French Terry Racerback',           15),
  ('r27-1',  27,  'Lansinoh',                      'Breastmilk Storage Bags',          12),
  ('r27-2',  27,  'Medela',                        'Pump & Save Bags',                  7),
  ('r25-1',  25,  'Lansinoh',                      'HPA Lanolin Cream',                22),
  ('r25-2',  25,  'Earth Mama',                    'Organic Nipple Butter',            10),
  ('r8-1',   8,   'Freshly Picked',                'Classic Diaper Bag',               11),
  ('r8-2',   8,   'Skip Hop',                      'Forma Backpack',                    8),
  ('r9-1',   9,   'Keekaroo',                      'Peanut Changer',                   14),
  ('r10-1',  10,  'Ubbi',                          'Steel Odor Locking Pail',          18),
  ('r10-2',  10,  'Dekor',                         'Classic Hands-Free Pail',           6),
  ('r11-1',  11,  'UPPAbaby',                      'VISTA V2',                         22),
  ('r11-2',  11,  'Nuna',                          'TRVL',                             14),
  ('r11-3',  11,  'Baby Jogger',                   'City Mini GT2',                    10),
  ('r12-1',  12,  'Chicco',                        'KeyFit 35',                        19),
  ('r12-2',  12,  'Nuna',                          'PIPA Lite LX',                     13),
  ('r13-1',  13,  'Ergobaby',                      'Omni 360',                         16),
  ('r13-2',  13,  'Solly Baby',                    'Wrap',                              9),
  ('r21-1',  21,  'Fridababy',                     'NoseFrida',                        25),
  ('r22-1',  22,  'Safety 1st',                    'Deluxe Healthcare Kit',             9),
  ('rp1-1',  100, 'IBCLC Locator',                 'uslca.org/find-an-ibclc',          18),
  ('rp1-2',  100, 'La Leche League',               'llli.org (free peer support)',     12),
  ('rp2-1',  101, 'Legendairy Milk',               'Liquid Gold',                       8),
  ('rp20-1', 120, 'Taking Cara Babies',            'Newborn + ABCs of Sleep courses',  24),
  ('rp20-2', 120, 'Cara Dumaplin',                 'ABCs of Sleep (4–24 mo)',          18),
  ('rp21-1', 121, 'Marc Weissbluth',               'Healthy Sleep Habits, Happy Child',15),
  ('rp21-2', 121, 'Richard Ferber',                'Solve Your Child''s Sleep Problems',13),
  ('rp22-1', 122, 'Huckleberry',                   'Smart Sleep Schedule',             20),
  ('rp31-1', 131, 'Frida Mom',                     'Upside Down Peri Bottle',          27),
  ('rp40-1', 140, 'Postpartum Support International','postpartum.net / 1-800-944-4773',16),
  ('rp50-1', 150, 'Zocdoc',                        'zocdoc.com',                       14),
  ('rp52-1', 152, 'American Red Cross',            'redcross.org/infant-cpr',          18),
  ('rp60-1', 160, 'Harvey Karp',                   'The Happiest Baby on the Block',   19),
  ('rp61-2', 161, 'Janet Lansbury',                'No Bad Kids: Toddler Discipline',  14),
  ('rp62-2', 162, 'Emily Oster',                   'Cribsheet',                        18),
  ('rp70-1', 170, 'Primary',                       'primary.com',                      14),
  ('rp72-1', 172, 'Facebook Marketplace',          'Local Buy Nothing groups',         16),
  ('rp73-1', 173, 'Albee Baby',                    'albeebaby.com',                    13)
on conflict (id) do nothing;

-- A few seed comments
insert into comments (rec_id, author, text, date) values
  ('r1-1',   'Sarah M.',  'Absolute lifesaver for the first few months!',                     'Mar 2'),
  ('r3-1',   'Jake T.',   'The breathing monitoring gave us so much peace of mind.',            'Feb 28'),
  ('r11-1',  'Tom K.',    'Pricey but worth every penny. Converts for two kids.',               'Feb 20'),
  ('r11-2',  'Jordan S.', 'Compact fold, great for travel. Lighter than the Vista.',           'Mar 10'),
  ('r21-1',  'Chris P.',  'Gross but works better than anything else.',                         'Mar 4'),
  ('r25-1',  'Tara L.',   'Apply after every single feed in the first few weeks.',             'Apr 2'),
  ('rp31-1', 'Lucia M.',  'The angled design is genuinely genius. Non-negotiable.',             'Apr 22'),
  ('rp20-1', 'Erin G.',   'Life-changing. Worth every penny before baby arrives.',              'Apr 14'),
  ('rp62-2', 'Paul N.',   'Data-driven takes on every major first-year decision. No judgment.','May 1'),
  ('rp52-1', 'Todd F.',   'Take a class before baby arrives. 2 hours, total confidence boost.','Apr 27')
on conflict do nothing;
