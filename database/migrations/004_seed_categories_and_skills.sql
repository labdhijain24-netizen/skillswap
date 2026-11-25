-- ============================================================================
-- SkillSwap Migration 004: Seed Canonical Categories & Skills
-- Pre-populates the database with foundational skill taxonomies
-- ============================================================================

-- Insert Categories
INSERT INTO public.skill_categories (name, slug, description, icon) VALUES
    ('Programming & Tech', 'programming-tech', 'Software development, web design, cloud, and IT skills', 'Code'),
    ('Design & Creative', 'design-creative', 'UI/UX design, illustration, 3D modeling, and graphic arts', 'Palette'),
    ('Languages', 'languages', 'World languages, conversational fluency, and translation', 'Languages'),
    ('Music & Audio', 'music-audio', 'Musical instruments, vocal coaching, music theory, and audio production', 'Music'),
    ('Business & Marketing', 'business-marketing', 'Entrepreneurship, SEO, product management, and copywriting', 'Briefcase'),
    ('Photography & Video', 'photography-video', 'Camera techniques, lighting, video editing, and color grading', 'Camera'),
    ('Health & Fitness', 'health-fitness', 'Strength training, yoga, nutrition, and wellness practices', 'HeartPulse'),
    ('Culinary Arts', 'culinary-arts', 'Baking, cooking techniques, culinary knife skills, and food plating', 'Utensils')
ON CONFLICT (name) DO NOTHING;

-- Insert Canonical Skills under Programming & Tech
WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'programming-tech')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('JavaScript', 'javascript', 'Modern ECMAScript, closures, async/await, and DOM manipulation'),
    ('React.js', 'react-js', 'Component architecture, React hooks, state management, and Vite'),
    ('Node.js & Express', 'node-express', 'REST APIs, server-side development, middleware, and backend architecture'),
    ('Python', 'python', 'Python fundamentals, data processing, scripting, and automation'),
    ('TypeScript', 'typescript', 'Static typing, interfaces, generics, and large-scale JavaScript development'),
    ('PostgreSQL & SQL', 'postgresql-sql', 'Relational database schema design, queries, joins, and indexing'),
    ('Docker & Containers', 'docker-containers', 'Containerizing applications, Dockerfile writing, and microservices')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

-- Insert Canonical Skills under Design & Creative
WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'design-creative')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('UI/UX Design in Figma', 'ui-ux-figma', 'Wireframing, interactive prototyping, design systems, and auto-layout'),
    ('Logo & Brand Identity', 'logo-brand-identity', 'Vector logo creation, visual identity guidelines, and typography'),
    ('Graphic Design with Photoshop', 'graphic-design-photoshop', 'Photo manipulation, digital compositing, and visual graphics'),
    ('3D Modeling with Blender', '3d-blender', 'Polygon modeling, materials, lighting, and rendering in Blender')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

-- Insert Canonical Skills under Languages
WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'languages')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('Conversational Spanish', 'conversational-spanish', 'Everyday dialogue, grammar essentials, and pronunciation'),
    ('Conversational French', 'conversational-french', 'French vocabulary, conversational phrasing, and listening comprehension'),
    ('Japanese for Beginners', 'japanese-beginners', 'Hiragana, Katakana, basic Kanji, and everyday polite phrases'),
    ('German Fundamentals', 'german-fundamentals', 'Sentence structures, cases, everyday conversation, and pronunciation'),
    ('English for Professionals', 'english-professionals', 'Business presentations, professional writing, and interview practice')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

-- Insert Canonical Skills under Music & Audio
WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'music-audio')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('Acoustic Guitar', 'acoustic-guitar', 'Chords, fingerpicking, rhythm, and song accompaniment'),
    ('Piano & Keyboard', 'piano-keyboard', 'Scales, chord progressions, reading sheet music, and ear training'),
    ('Music Production in Ableton', 'music-production-ableton', 'Beat making, MIDI sequencing, synthesis, and mixing'),
    ('Vocal Training', 'vocal-training', 'Breath control, pitch accuracy, vocal range expansion, and resonance')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

-- Insert Canonical Skills under Business & Marketing
WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'business-marketing')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('Search Engine Optimization (SEO)', 'seo', 'Keyword research, on-page optimization, and technical SEO'),
    ('Content Marketing & Copywriting', 'copywriting', 'Engaging headline writing, email copy, and storytelling for brands'),
    ('Product Management', 'product-management', 'Agile sprints, user stories, roadmapping, and MVP prioritization')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

-- Insert Canonical Skills under Culinary Arts & Fitness
WITH cat_culinary AS (SELECT id FROM public.skill_categories WHERE slug = 'culinary-arts'),
     cat_fitness AS (SELECT id FROM public.skill_categories WHERE slug = 'health-fitness')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat_culinary.id, 'Artisan Bread Baking', 'bread-baking', 'Sourdough starter maintenance, fermentation, and shaping'
FROM cat_culinary
UNION ALL
SELECT cat_fitness.id, 'Vinyasa Yoga', 'vinyasa-yoga', 'Asana flows, alignment, breath connection, and flexibility'
FROM cat_fitness
ON CONFLICT (name) DO NOTHING;
