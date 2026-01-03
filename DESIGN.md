# Quiz App - Design Specification

> **How to Resume:** If you run out of Claude Pro time, start a new conversation and say:
> "I'm building a Quiz App for BCBA/RBT training. Please read DESIGN.md in my project folder and continue from where we left off."
> Claude will read this file and understand the full context.

---

## Overview
A Kahoot-like web app for **BCBA/RBT teams** to run quizzes about patient Behavior Intervention Plans (BIPs).

### Purpose
- **Training tool:** BCBAs train RBTs on current BIPs, which change frequently
- **Competitive & fun:** Encourages RBTs to study and stay current on patient plans
- **Educational:** Teaches through gameplay - correct answers shown after each question
- **Conversation starter:** Manual mode allows discussion between questions
- **Inclusive:** BCBAs can play too while one hosts
- **Supervision support:** BCBAs can review individual player performance over time

### How It Works
BCBAs create quizzes and display questions on a TV screen; RBTs (and other BCBAs) join via QR code on their phones.

## Requirements Summary
- **Platform:** Web (responsive - desktop for hosts, mobile for players)
- **Scale:** Small (<50 concurrent users)
- **Question Types:** Multiple choice + True/False + **Warmup/Trivia (no scoring)**
- **User Roles:** BCBAs create/host quizzes, RBTs participate
- **HIPAA:** De-identify patient information (use codes, not names)
- **Infrastructure:** Vercel + Supabase + GitHub

### Warmup/Trivia Questions
BCBAs can mark questions as "warmup" or "fun trivia" questions that don't count toward scoring:
- **Purpose:** Warm up players before the real BIP questions, add fun variety
- **Behavior:** Players still answer and see correct/incorrect feedback
- **No points awarded** for warmup questions
- **Streak not affected** (neither gained nor lost)
- **Not counted in leaderboard stats**
- **Visual indicator:** Shows "Just for fun!" on host and player screens

### Key Workflow
1. BCBA creates quiz on computer (with patient info de-identified)
2. BCBA starts game, displays QR code + questions on TV
3. RBTs scan QR code, join on mobile phones
4. RBTs answer questions within time limit
5. Results shown after each question
6. Final leaderboard + all data recorded

### Configurable Settings (defaults + per-quiz override)
- Time limit per question (e.g., 10, 15, 20, 30 seconds)
- Speed affects score (yes/no toggle)
- Points per question
- **Auto-advance questions** (yes/no) - if yes, auto-proceeds after results; if no, host clicks "Next"

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript + Vite | Large ecosystem, type safety |
| Styling | TailwindCSS | Rapid UI development |
| State | Zustand + TanStack Query | Client + server state |
| Backend | **Supabase** | Auth, DB, Realtime, HIPAA-eligible |
| Real-time | **Supabase Realtime** | Built-in, no separate server needed |
| Database | **Supabase PostgreSQL** | Managed, with Row Level Security |
| Auth | **Supabase Auth** | Built-in, supports roles |
| Hosting | **Vercel** | Easy deployment, GitHub integration |
| Repo | **GitHub** | Version control, CI/CD with Vercel |

### Why Supabase?
- **HIPAA-eligible:** Supabase offers BAA (Business Associate Agreement) on Pro plan
- **All-in-one:** Auth, database, real-time subscriptions, storage
- **Serverless:** No backend server to manage
- **Row Level Security:** Fine-grained access control

---

## HIPAA Compliance & De-identification

### Strategy
- **Never store actual patient names** in quiz content
- Use **room + initials format** (e.g., "301 AB", "205 CD") - already standard practice
- Quiz questions reference behavior plans by code, not identifying info
- All data encrypted at rest (Supabase default) and in transit (HTTPS)
- Patient code mappings (301 AB = real name) kept **outside** this app

### Compliance Approach
1. **Start with Supabase Free tier** - includes encryption + Row Level Security
2. **Enforce de-identification** - UI reminders when creating quizzes
3. **Upgrade to Pro + BAA later** if formal HIPAA certification required

### Example De-identified Question
> "According to 301 AB's behavior plan, what is the correct response when they exhibit escape-maintained behavior?"

### UI Guidance (shown when creating quizzes)
- Patient code field with placeholder: "e.g., 301 AB"
- Reminder text: "Use room + initials only. Never enter full patient names."

---

## Avatar System

### Design
- **Style:** Cute cartoon animals/creatures (fox, owl, bear, cat, dog, rabbit, etc.)
- **Selection:** Per-game only (quick pick when joining - no account required)
- **Base characters:** 10 animal options (fox, owl, bear, cat, dog, rabbit, panda, lion, penguin, koala)
- **Accessories:** 7 items (glasses, sunglasses, top hat, cap, crown, bow, headphones)
- **Layered rendering:** Accessories appear ON the avatar (Kahoot-style) rather than floating beside it

### Implementation
```
Player joins game:
1. Enter nickname
2. Pick base avatar (grid of 10 animals)
3. Optionally add 1 accessory (horizontal scroll of items)
4. Join game

Avatar stored as: { base: "fox", accessory: "glasses" | null }
```

### Avatar Rendering (Layered System)
The Avatar component supports two rendering modes:
1. **Emoji fallback (current):** Uses emoji characters with CSS positioning
2. **Image mode:** Uses PNG images with accessories layered on top

The system automatically falls back to emojis if image files are not found.

Each avatar has per-accessory position configs in `src/lib/constants.ts`:
```typescript
accessoryPositions: {
  glasses: { top: '38%', left: '50%', transform: 'translateX(-50%)' },
  tophat: { top: '-8%', left: '50%', transform: 'translateX(-50%)' },
  // ... etc
}
```

### Upgrading to Image Avatars (Optional)

To replace emojis with custom artwork:

**1. Create the folder structure:**
```
public/
├── avatars/
│   ├── fox.png
│   ├── owl.png
│   ├── bear.png
│   ├── cat.png
│   ├── dog.png
│   ├── rabbit.png
│   ├── panda.png
│   ├── lion.png
│   ├── penguin.png
│   └── koala.png
└── accessories/
    ├── glasses.png
    ├── sunglasses.png
    ├── tophat.png
    ├── cap.png
    ├── crown.png
    ├── bow.png
    └── headphones.png
```

**2. Image specifications:**
- **Format:** PNG with transparent background
- **Size:** Square aspect ratio (256x256 or 512x512 recommended)
- **Avatar style:** Consistent art style across all animals, face centered
- **Accessory style:** Just the item (glasses without a face, hat without a head)

**3. Fine-tune positions (if needed):**
Edit `src/lib/constants.ts` to adjust accessory positions per avatar. Different face shapes may need different offsets.

**4. Image sources:**
- AI generators (Midjourney, DALL-E)
- Asset packs (game asset marketplaces)
- Commission an artist (Fiverr, ~$50-100 for a set)
- DiceBear or similar avatar generators

### Avatar Display
- **Player lobby:** Avatar + nickname shown in player list
- **Host view:** Avatars shown next to names in leaderboard
- **Results:** Winner's avatar featured prominently

---

## UI/UX Design (Kahoot-Inspired)

### Design Principles
- **Bold & Fun:** Bright primary colors, playful typography
- **Fast & Responsive:** Instant visual feedback on every tap
- **Large Touch Targets:** Buttons fill the screen on mobile
- **Minimal Text:** Icons and colors communicate quickly
- **Celebration:** Animations for correct answers, streaks, wins

### Color Palette
```
Answer Buttons (Kahoot-style):
- Red:    #E21B3C (Triangle)
- Blue:   #1368CE (Diamond)
- Yellow: #D89E00 (Circle)
- Green:  #26890C (Square)

UI Colors:
- Primary:    #46178F (Purple - brand color)
- Background: #1A1A2E (Dark blue-purple)
- Success:    #66BF39 (Bright green)
- Error:      #FF3355 (Bright red)
- Text:       #FFFFFF (White on dark)
```

### Mobile Player Screens

**Join Screen:**
```
┌─────────────────────────┐
│      [Quiz Logo]        │
│                         │
│   ┌─────────────────┐   │
│   │  Enter PIN      │   │
│   └─────────────────┘   │
│                         │
│   [ SCAN QR CODE ]      │
│                         │
│   ─── or enter PIN ───  │
│                         │
│   [______PIN______]     │
│                         │
│   [    JOIN GAME    ]   │
└─────────────────────────┘
```

**Avatar Selection:**
```
┌─────────────────────────┐
│     Choose Your Look    │
│                         │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │🦊│ │🦉│ │🐻│ ...   │
│  └───┘ └───┘ └───┘     │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │🐱│ │🐶│ │🐰│ ...   │
│  └───┘ └───┘ └───┘     │
│                         │
│     Add Accessory       │
│  [🎩][👓][🎀][🧢]...    │
│                         │
│  ┌─────────────────┐    │
│  │  Your Nickname  │    │
│  └─────────────────┘    │
│                         │
│  [     LET'S GO!     ]  │
└─────────────────────────┘
```

**Answer Screen (Full Screen Buttons):**
```
┌─────────────────────────┐
│  ⏱️ 15                  │
├─────────────────────────┤
│                         │
│  ┌─────────────────┐    │
│  │   🔺  RED       │    │
│  │   Option A      │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │   🔷  BLUE      │    │
│  │   Option B      │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │   ⭕  YELLOW    │    │
│  │   Option C      │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │   🟩  GREEN     │    │
│  │   Option D      │    │
│  └─────────────────┘    │
│                         │
└─────────────────────────┘
```

**Result Feedback (After Answer):**
```
┌─────────────────────────┐
│                         │
│         ✓               │
│      CORRECT!           │
│                         │
│      +950 pts           │
│                         │
│    🔥 3 Streak!         │
│                         │
│    You're #2            │
│                         │
└─────────────────────────┘
```

### Host/TV Screens

**Lobby (Show on TV):**
```
┌────────────────────────────────────────────┐
│                                            │
│            Join at: quizapp.com            │
│                                            │
│         ┌──────────────────┐               │
│         │   [QR CODE]      │   PIN: 847291 │
│         │                  │               │
│         └──────────────────┘               │
│                                            │
│  Players (5):                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │🦊 │ │🐻 │ │🦉 │ │🐱 │ │🐶 │       │
│  │Alex│ │Sam │ │Jo  │ │Pat │ │Chris│       │
│  └────┘ └────┘ └────┘ └────┘ └────┘       │
│                                            │
│            [ START GAME ]                  │
│                                            │
└────────────────────────────────────────────┘
```

**Question Display (TV):**
```
┌────────────────────────────────────────────┐
│  Question 3 of 10                    ⏱️ 15 │
├────────────────────────────────────────────┤
│                                            │
│   What is the correct response when        │
│   Client J.D. exhibits escape behavior?    │
│                                            │
├────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐ │
│  │ 🔺 Redirect to   │ │ 🔷 Block the     │ │
│  │    task          │ │    exit          │ │
│  └──────────────────┘ └──────────────────┘ │
│  ┌──────────────────┐ ┌──────────────────┐ │
│  │ ⭕ Offer a break │ │ 🟩 Ignore the    │ │
│  │                  │ │    behavior      │ │
│  └──────────────────┘ └──────────────────┘ │
├────────────────────────────────────────────┤
│            5 of 8 answered                 │
└────────────────────────────────────────────┘
```

**Results Display (TV):**
```
┌────────────────────────────────────────────┐
│  Question 3 Results                        │
├────────────────────────────────────────────┤
│                                            │
│   Correct: 🔺 Redirect to task             │
│                                            │
│   ████████████████ 5 (62%)   🔺            │
│   ████           2 (25%)   🔷            │
│   █              1 (13%)   ⭕            │
│                  0 (0%)    🟩            │
│                                            │
│   ✓ Alex, Sam, Jo, Chris, Taylor           │
│   ✗ Pat, Morgan, Jordan                    │
│                                            │
│        [ NEXT QUESTION ]  (or auto: 5s)    │
│                                            │
└────────────────────────────────────────────┘
```

### Animations & Feedback
- **Button press:** Scale down slightly (0.95) + color darken
- **Correct answer:** Green pulse + checkmark animation
- **Wrong answer:** Red shake + X animation
- **Timer:** Pulsing animation when < 5 seconds
- **Streak:** Fire emoji animation, grows with streak
- **Winner:** Confetti burst, podium rise animation

### Audio (Host TV Only)
- No sounds on player phones
- Optional: Background music on host screen
- Optional: Timer tick sounds on host screen

---

## Database Schema (Supabase PostgreSQL)

```sql
-- ORGANIZATIONS (clinics/practices)
organizations
├── id (uuid, primary key)
├── name
├── created_at
└── settings (jsonb) -- default quiz settings for org

-- USERS (with Supabase Auth)
profiles
├── id (uuid, references auth.users)
├── organization_id (uuid, references organizations)
├── email
├── display_name
├── role (enum: 'bcba', 'rbt', 'admin')
├── created_at
└── Indexes: organization_id, role

-- USER SETTINGS (personal defaults)
user_settings
├── user_id (uuid, primary key, references profiles)
├── default_time_limit (int, seconds, default 20)
├── default_speed_scoring (boolean, default true)
├── default_points_per_question (int, default 1000)
├── default_auto_advance (boolean, default false) -- auto-proceed to next question

-- QUIZZES
quizzes
├── id (uuid, primary key)
├── organization_id (uuid, references organizations)
├── creator_id (uuid, references profiles)
├── title
├── description
├── patient_code (text) -- de-identified reference (e.g., "Client J.D.")
├── share_code (text, unique) -- for sharing within org
├── is_active (boolean)
├── created_at, updated_at
│
├── -- Quiz-specific settings (override defaults)
├── time_limit (int, seconds)
├── speed_scoring (boolean) -- does speed affect score?
├── points_per_question (int)
├── auto_advance (boolean) -- auto-proceed after showing results
└── Indexes: organization_id, creator_id, share_code

-- QUESTIONS
questions
├── id (uuid, primary key)
├── quiz_id (uuid, references quizzes)
├── type (enum: 'multiple_choice', 'true_false')
├── question_text
├── order_index (int)
├── time_limit_override (int, nullable) -- per-question override
└── Indexes: quiz_id, order_index

-- QUESTION OPTIONS
question_options
├── id (uuid, primary key)
├── question_id (uuid, references questions)
├── option_text
├── is_correct (boolean)
├── order_index (int)
└── Indexes: question_id

-- GAME SESSIONS (live quiz instances)
game_sessions
├── id (uuid, primary key)
├── quiz_id (uuid, references quizzes)
├── host_id (uuid, references profiles)
├── game_pin (text, unique, 6 digits)
├── status (enum: 'lobby', 'active', 'question', 'results', 'finished')
├── current_question_index (int, default -1)
├── question_started_at (timestamp)
├── started_at, ended_at, created_at
│
├── -- Snapshot of settings at game time
├── time_limit (int)
├── speed_scoring (boolean)
├── points_per_question (int)
├── auto_advance (boolean)
│
├── -- Final results
├── winner_id (uuid, references profiles, nullable)
└── Indexes: game_pin, status, quiz_id

-- GAME PARTICIPANTS
game_participants
├── id (uuid, primary key)
├── game_session_id (uuid, references game_sessions)
├── user_id (uuid, references profiles, nullable) -- null for guests
├── nickname (text)
├── avatar_base (text) -- e.g., "fox", "owl", "bear"
├── avatar_accessory (text, nullable) -- e.g., "glasses", "hat"
├── total_score (int, default 0)
├── current_streak (int, default 0)
├── joined_at
└── Indexes: game_session_id, user_id
└── Unique: (game_session_id, nickname)

-- QUESTION RESPONSES (detailed answer tracking)
question_responses
├── id (uuid, primary key)
├── game_session_id (uuid, references game_sessions)
├── participant_id (uuid, references game_participants)
├── question_id (uuid, references questions)
├── user_id (uuid, references profiles, nullable)
├── selected_option_id (uuid, references question_options, nullable)
├── is_correct (boolean)
├── response_time_ms (int)
├── points_awarded (int)
├── answered_at (timestamp)
└── Indexes: game_session_id, participant_id, question_id, user_id
└── Unique: (participant_id, question_id)

-- LEADERBOARD (aggregated stats per user per organization)
leaderboard_entries
├── id (uuid, primary key)
├── user_id (uuid, references profiles)
├── organization_id (uuid, references organizations)
├── total_games_played (int)
├── total_games_won (int)
├── total_questions_answered (int)
├── total_correct_answers (int)
├── total_points (int)
├── best_streak (int)
├── updated_at
└── Indexes: organization_id + total_points (for ranking)
└── Unique: (user_id, organization_id)

-- PLAYER REGISTRY (nickname → real name mapping for supervision)
player_registry
├── id (uuid, primary key)
├── organization_id (uuid, references organizations)
├── real_name (text) -- e.g., "Sarah Johnson"
├── created_at
└── Indexes: organization_id, real_name

-- NICKNAME MAPPINGS (link fun nicknames to real players)
nickname_mappings
├── id (uuid, primary key)
├── player_id (uuid, references player_registry)
├── nickname (text) -- e.g., "CoolCat99", "SpeedyRBT"
├── created_at
└── Indexes: player_id, nickname
└── Unique: (player_id, nickname)
```

### Row Level Security (RLS) Policies
- Users can only see data within their organization
- BCBAs can create/edit quizzes; RBTs can only view/play
- Game responses visible to host and participant only

---

## Supervision Features

### Nickname → Real Name Workflow
```
1. Quiz ends, BCBA views results
2. For each player nickname not yet mapped:
   - System prompts: "Who is 'CoolCat99'?"
   - BCBA selects from existing players OR creates new player
   - Mapping saved: CoolCat99 → Sarah Johnson

3. Next time "CoolCat99" plays, automatically linked
4. If same person uses "SpeedyRBT" next week:
   - BCBA maps: SpeedyRBT → Sarah Johnson
   - All history unified under Sarah Johnson
```

### Supervision View (Player Lookup)
```
┌──────────────────────────────────────────────────┐
│  Player: Sarah Johnson                           │
│  Nicknames: CoolCat99, SpeedyRBT, SarahJ         │
├──────────────────────────────────────────────────┤
│  Quiz History:                                   │
│                                                  │
│  Dec 15 - 301 AB BIP Quiz      92%   1st place  │
│  Dec 8  - 205 CD BIP Quiz      85%   3rd place  │
│  Dec 1  - General ABA Quiz     78%   5th place  │
│                                                  │
│  Trend: ↑ Improving (+14% over 3 weeks)         │
│                                                  │
│  [ Export History to CSV ]                       │
└──────────────────────────────────────────────────┘
```

### CSV Export Format
```csv
Quiz Title,Date,Player,Nickname,Question,Player Answer,Correct Answer,Correct?,Points
"301 AB BIP Quiz",2024-12-15,"Sarah Johnson","CoolCat99","What is the target behavior?","Escape","Escape",Yes,950
"301 AB BIP Quiz",2024-12-15,"Sarah Johnson","CoolCat99","Correct response to aggression?","Block","Redirect",No,0
...
```

---

## Project Structure

```
quiz-app/                        # Single repo (no separate backend!)
├── .github/
│   └── workflows/ci.yml         # GitHub Actions for CI
│
├── src/
│   ├── main.tsx                 # App entry
│   ├── App.tsx                  # Routes + providers
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── database.types.ts    # Generated from Supabase
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth state + methods
│   │   ├── useProfile.ts        # User profile
│   │   ├── useQuizzes.ts        # Quiz CRUD
│   │   ├── useGame.ts           # Game state + realtime
│   │   ├── useLeaderboard.ts
│   │   └── useSettings.ts       # User default settings
│   │
│   ├── stores/
│   │   ├── authStore.ts         # Zustand - auth state
│   │   └── gameStore.ts         # Zustand - live game state
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Settings.tsx         # Default quiz settings
│   │   │
│   │   ├── quiz/
│   │   │   ├── QuizList.tsx     # Browse org quizzes
│   │   │   ├── QuizCreate.tsx   # Create new quiz
│   │   │   ├── QuizEdit.tsx     # Edit quiz + questions
│   │   │   └── QuizPreview.tsx  # Preview before hosting
│   │   │
│   │   ├── host/                # BCBA host screens (desktop/TV)
│   │   │   ├── HostSetup.tsx    # Select quiz, see QR code
│   │   │   ├── HostLobby.tsx    # Show PIN + QR, see players
│   │   │   ├── HostQuestion.tsx # Display question on TV
│   │   │   ├── HostResults.tsx  # Show results after question
│   │   │   └── HostFinal.tsx    # Final leaderboard
│   │   │
│   │   ├── play/                # RBT player screens (mobile)
│   │   │   ├── JoinGame.tsx     # Enter PIN or scan QR
│   │   │   ├── PlayerLobby.tsx  # Waiting for start
│   │   │   ├── PlayerAnswer.tsx # Answer buttons
│   │   │   ├── PlayerWait.tsx   # Waiting for results
│   │   │   └── PlayerFinal.tsx  # See final standing
│   │   │
│   │   ├── leaderboard/
│   │   │   └── Leaderboard.tsx  # Org-wide leaderboard
│   │   │
│   │   └── history/             # BCBA supervision views
│   │       ├── GameHistory.tsx  # List of past quiz sessions
│   │       ├── GameDetail.tsx   # Detailed results for one session
│   │       ├── PlayerLookup.tsx # Search player, see their history
│   │       ├── PlayerRegistry.tsx # Manage real names + nickname mappings
│   │       └── ExportButton.tsx # CSV download component
│   │
│   ├── components/
│   │   ├── ui/                  # Base components (Button, Input, Card)
│   │   ├── layout/              # Header, Layout, MobileLayout
│   │   ├── quiz/                # QuizCard, QuestionEditor
│   │   ├── game/                # Timer, AnswerButton, QRCode, Scoreboard
│   │   └── charts/              # Results visualizations
│   │
│   └── utils/
│       ├── scoring.ts           # Score calculation logic
│       ├── gamePin.ts           # Generate 6-digit PINs
│       └── qrcode.ts            # QR code generation
│
├── supabase/
│   ├── migrations/              # SQL migrations
│   ├── seed.sql                 # Test data
│   └── functions/               # Edge functions (if needed)
│
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### No Separate Backend!
With Supabase, all backend functionality is handled:
- **Auth:** Supabase Auth
- **Database:** Direct client queries with RLS
- **Real-time:** Supabase Realtime subscriptions
- **Edge Functions:** For complex logic (optional)

---

## Real-Time Game Flow (Supabase Realtime)

### Game States
```
LOBBY → ACTIVE → QUESTION → RESULTS → (repeat) → FINISHED
```

### How It Works with Supabase Realtime

**1. Host Creates Game (BCBA on computer)**
```
- Insert into game_sessions (status: 'lobby', game_pin: generated)
- Display QR code pointing to: https://app.com/join?pin=123456
- Subscribe to game_participants table (filter: game_session_id)
- See players appear in real-time as they join
```

**2. Players Join (RBTs scan QR on phones)**
```
- Scan QR or enter PIN manually
- Insert into game_participants (nickname, game_session_id)
- Subscribe to game_sessions table (filter: id = session_id)
- Wait for status change to 'question'
```

**3. Host Starts Game**
```
- Update game_sessions: status = 'question', current_question_index = 0
- All players receive update via subscription
- Host displays question on TV
- Players see answer buttons on phones
```

**4. Players Answer**
```
- Insert into question_responses (selected_option, response_time_ms)
- Client calculates points locally (validated server-side later)
- Player UI shows "Answer submitted, waiting..."
```

**5. Host Shows Results**
```
- Update game_sessions: status = 'results'
- Query question_responses for current question
- Display: correct answer, who got it right, point distribution
- All subscribed clients update their views
```

**6. Next Question / Finish**
```
- Host clicks "Next": increment current_question_index, status = 'question'
- After last question: status = 'finished', winner_id = top scorer
- Update leaderboard_entries for all registered participants
```

### Supabase Channels for Realtime
```typescript
// Host subscribes to players joining
supabase
  .channel('lobby')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'game_participants',
    filter: `game_session_id=eq.${sessionId}`
  }, handlePlayerJoined)

// Players subscribe to game state
supabase
  .channel('game')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'game_sessions',
    filter: `id=eq.${sessionId}`
  }, handleGameStateChange)
```

### Scoring Logic

```typescript
function calculateScore(
  basePoints: number,      // e.g., 1000
  timeLimitMs: number,     // e.g., 20000 (20 seconds)
  responseTimeMs: number,  // how fast they answered
  speedScoring: boolean,   // quiz setting
  currentStreak: number
): number {
  if (!isCorrect) return 0;

  let points = basePoints;

  // Time bonus (only if speed scoring enabled)
  if (speedScoring) {
    const timeRatio = Math.max(0, 1 - (responseTimeMs / timeLimitMs));
    points = Math.round(basePoints * (0.5 + 0.5 * timeRatio));
    // Fast answer (0ms) = 100% of points
    // Slow answer (at limit) = 50% of points
  }

  // Streak bonus (always applies)
  const streakBonus = Math.min(currentStreak * 100, 500);

  return points + streakBonus;
}
```

---

## Implementation Phases

### Phase 1: Project Setup & Auth
**Goal: Working app skeleton with authentication**

1. Create Vite + React + TypeScript project
2. Set up TailwindCSS, ESLint, Prettier
3. Create GitHub repo, connect to Vercel
4. Create Supabase project
5. Set up database schema (migrations)
6. Configure Row Level Security policies
7. Supabase Auth integration (login/register)
8. Profile creation with role (bcba/rbt)
9. Organization setup (single org for MVP)

**Deliverable:** Users can register, login, see dashboard

---

### Phase 2: Quiz Creation (BCBA Flow)
**Goal: BCBAs can create and manage quizzes**

1. Settings page (default time limit, speed scoring, points)
2. Quiz list page (org quizzes)
3. Create/edit quiz form with settings override
4. Patient code field (de-identified reference)
5. Question editor (add/edit/delete/reorder)
6. Multiple choice + True/False question types
7. Quiz preview mode
8. Quiz lifecycle rules:
   - Quizzes with game history are marked as "Played" and cannot be deleted; duplicate to rerun on a new date
   - Fresh (unplayed) quizzes can be edited/deleted
   - Dev-only force delete is gated by `VITE_DEV_FORCE_DELETE=true` (never enable in production)

**Deliverable:** BCBAs can create complete quizzes

---

### Phase 3: Live Game - Host Side (TV Display)
**Goal: BCBAs can host live games**

1. Game session creation (generate PIN)
2. QR code generation (links to join URL)
3. Host lobby: large QR, PIN, player list (realtime)
4. Host question display: question, options, timer
5. Host results: correct answer, response chart
6. Host final: leaderboard, podium, end game

**Deliverable:** BCBAs can run complete game sessions

---

### Phase 4: Live Game - Player Side (Mobile)
**Goal: RBTs can join and play on phones**

1. QR scanner + manual PIN entry
2. Nickname entry
3. **Avatar selection** (pick character + optional accessory)
4. Join game, player lobby (waiting for host)
5. Player answer screen (large colorful buttons, timer)
6. Player results (correct/wrong animation, points, rank)
7. Player final (your rank, avatar on podium)

**Deliverable:** Full multiplayer game flow with avatars

---

### Phase 5: Results & Leaderboard
**Goal: Persistent tracking and analytics for supervision**

1. Store all question_responses with player nickname
2. Determine and store winner
3. Update leaderboard_entries after each game
4. Game history page (past sessions)
5. Detailed results view (per-question breakdown)
6. Organization leaderboard page
7. **Player registry & nickname mapping:**
   - BCBAs can create "real player" entries (e.g., "Sarah Johnson")
   - Link nicknames to real players (CoolCat99 → Sarah Johnson)
   - Supervision view shows real names with unified history
   - If nickname not yet mapped, prompt BCBA to assign it
8. **CSV/Excel export:**
   - Export any quiz results to CSV
   - Columns: Quiz Title, Date, Player (real name), Question, Their Answer, Correct Answer, Points
   - Download button on game detail page

**Deliverable:** Complete tracking for competition AND supervision

---

### Phase 6: Polish & Deploy
**Goal: Production-ready application**

1. Responsive design (desktop host, mobile player)
2. TV-optimized host views (large fonts)
3. Mobile-optimized player views
4. Loading states, error handling
5. PWA setup (add to home screen)
6. Testing with multiple devices
7. Production deployment to Vercel
8. Error monitoring (Sentry)

**Deliverable:** Live, polished application

---

## Critical Files to Create

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `supabase/migrations/001_initial_schema.sql` | Database schema |
| 2 | `src/lib/supabase.ts` | Supabase client |
| 3 | `src/hooks/useAuth.ts` | Auth logic |
| 4 | `src/hooks/useGame.ts` | Real-time game state |
| 5 | `src/components/game/AvatarPicker.tsx` | Avatar selection UI |
| 6 | `src/components/game/Avatar.tsx` | Avatar display component |
| 7 | `src/pages/host/HostLobby.tsx` | QR + player list |
| 8 | `src/pages/play/PlayerAnswer.tsx` | Answer buttons |
| 9 | `src/utils/scoring.ts` | Score calculation |
| 10 | `src/components/game/Timer.tsx` | Animated countdown |
| 11 | `src/components/game/AnswerButton.tsx` | Colorful answer buttons |

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Supabase | All-in-one, HIPAA-eligible |
| Frontend | React + TypeScript | Ecosystem, type safety |
| Hosting | Vercel | GitHub integration |
| Real-time | Supabase Realtime | Built-in, no server |
| Styling | TailwindCSS | Rapid development |
| QR Codes | qrcode.react | Client-side generation |

---

## HIPAA Compliance Checklist

**Required (do now):**
- [ ] Enable RLS on all tables
- [ ] Use room + initials format (e.g., "301 AB"), never real names
- [ ] HTTPS everywhere (Vercel default)
- [ ] No PHI in logs or error messages
- [ ] Add UI reminders about de-identification

**Optional (upgrade path if needed):**
- [ ] Sign Supabase BAA (requires Pro plan ~$25/mo)
- [ ] Formal compliance documentation

---

## How to Resume Development

If you need to continue this project in a new Claude session:

1. Open Claude Code in the project directory
2. Say: **"Please read DESIGN.md and continue building the Quiz App from where we left off"**
3. Claude will read this file and understand the full context

### Current Progress
*Update this section as you build:*

- [x] Phase 1: Project Setup & Auth (COMPLETED)
  - [x] Vite + React + TypeScript project
  - [x] TailwindCSS with Kahoot color palette
  - [x] Supabase client & database types
  - [x] Auth store with login/register/logout
  - [x] Game store with realtime subscriptions
  - [x] UI components (Button, Input, Card, Select, Toggle, Textarea, Layout)
  - [x] Login & Register pages
  - [x] Home dashboard with role-based navigation
  - [x] React Router setup with protected routes
  - [x] Warmup question support (database migration + scoring logic)

- [x] Phase 2: Quiz Creation (COMPLETED)
  - [x] Settings page (default time limit, speed scoring, points, auto-advance)
  - [x] QuizList page with search and CRUD
  - [x] QuizCreate page with settings
  - [x] QuizEdit page with question management
  - [x] QuestionEditor component (multiple choice, true/false, warmup toggle)
  - [x] Patient code field with de-identification reminders

- [x] Phase 3: Host Side (COMPLETED)
  - [x] HostSetup page (select quiz to host)
  - [x] HostLobby page (QR code, PIN, realtime player list)
  - [x] HostGame page (timer, question display, answer results)
  - [x] HostFinal page (podium, leaderboard, stats)
  - [x] Timer component (animated countdown with color changes)
  - [x] GameQRCode component (qrcode.react)
  - [x] Avatar component (display)
  - [x] AnswerButton component (Kahoot-style colored buttons)

- [x] Phase 4: Player Side (COMPLETED)
  - [x] JoinGame page (PIN entry, nickname, avatar selection)
  - [x] AvatarPicker component (10 animals + 8 accessories)
  - [x] PlayerLobby page (waiting for host, shows other players)
  - [x] PlayerGame page (answer buttons, submit answers, results feedback)
  - [x] PlayerFinal page (final ranking, leaderboard preview)

- [ ] Phase 5: Results & Leaderboard ← **NEXT**
  - [ ] Game history page (past sessions)
  - [ ] Detailed results view (per-question breakdown)
  - [ ] Organization leaderboard page
  - [ ] Player registry & nickname mapping
  - [ ] CSV/Excel export

- [ ] Phase 6: Polish & Deploy
  - [ ] Responsive design polish
  - [ ] Loading states & error handling improvements
  - [ ] PWA setup
  - [ ] Production deployment to Vercel
  - [ ] Error monitoring (Sentry)

### Files Created

**Core:**
- `src/lib/supabase.ts` - Supabase client
- `src/lib/database.types.ts` - TypeScript types for all tables
- `src/lib/constants.ts` - Avatars (with image paths & accessory positions), accessories, colors, defaults
- `src/stores/authStore.ts` - Auth state & profile management
- `src/stores/gameStore.ts` - Live game state & realtime subscriptions
- `src/utils/scoring.ts` - Score calculation with warmup support
- `src/utils/gamePin.ts` - 6-digit PIN generation

**Pages:**
- `src/pages/Login.tsx`, `Register.tsx`, `Home.tsx`, `Settings.tsx`
- `src/pages/quiz/QuizList.tsx`, `QuizCreate.tsx`, `QuizEdit.tsx`
- `src/pages/host/HostSetup.tsx`, `HostLobby.tsx`, `HostGame.tsx`, `HostFinal.tsx`
- `src/pages/play/JoinGame.tsx`, `PlayerLobby.tsx`, `PlayerGame.tsx`, `PlayerFinal.tsx`

**Components:**
- `src/components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`, `Select.tsx`, `Toggle.tsx`, `Textarea.tsx`
- `src/components/layout/Layout.tsx`
- `src/components/quiz/QuestionEditor.tsx`
- `src/components/game/Timer.tsx`, `GameQRCode.tsx`, `AnswerButton.tsx`
- `src/components/game/Avatar.tsx` - Layered avatar display (images with emoji fallback)
- `src/components/game/AvatarPicker.tsx` - Avatar + accessory selection UI

**Database:**
- `supabase/migrations/001_initial_schema.sql` - All tables
- `supabase/migrations/002_add_warmup_questions.sql` - Warmup column

### Prerequisites
- **Node.js:** v24.12.0 installed
- **Supabase:** Project created (needs credentials in `.env`)
- **Dependencies:** Run `npm install` to install all packages
