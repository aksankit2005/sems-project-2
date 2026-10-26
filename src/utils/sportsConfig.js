// Official MPGI Sports Fest 2026 (APEX Championship) Sports Configuration
// Aligned with mpgisports.in tournament data

export const MPGI_SPORTS = [
  {
    id: 'cricket',
    name: 'Cricket',
    icon: '🏏',
    category: 'Outdoor',
    type: 'Team (11 Players)',
    tagline: 'Glory, Boundaries & High Voltage Drama',
    description: 'T20 Knockout tournament featuring electrifying boundaries, clinical bowling spells, and intense inter-college rivalries.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    venue: 'Main University Stadium Ground 1',
    teamSize: '11 + 4 Subs',
    minPlayers: 11,
    maxPlayers: 15,
    rules: [
      '8-Over or 10-Over Cricket rules as per tournament format (8/10 overs per innings).',
      '11 players per team on field.',
      'Powerplay: 2 overs (8-Over) or 3 overs (10-Over); Max 2 overs per bowler.',
      'Wide: 1 extra run + rebowled; No-Ball: 1 extra run + Free Hit.',
      'Innings Break: 5 to 7 mins; Tie: Super Over deciding match.'
    ]
  },
  {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    category: 'Outdoor',
    type: 'Team (5-8 Players)',
    tagline: 'Passion, Skill & Fast-Paced 5v5 Adrenaline',
    description: 'High-octane 5-a-side mini football tournament. High pressing, tactical masterclasses, fast rolling substitutions, and penalty shootouts.',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=60',
    venue: 'Ground 1 / Ground 2',
    teamSize: '5 - 8 Players',
    minPlayers: 5,
    maxPlayers: 8,
    rules: [
      '1. Team Composition: 5 players on field (1 GK + 4 Outfield). Squad size 5-8 players.',
      '2. Match Duration: 2 halves × 10 mins (5-min halftime break). Tied knockout matches go to penalty shootout (3 penalties + sudden death).',
      '3. Kick-Off: Starts from center circle. Direct goal scoring from kick-off allowed.',
      '4. Ball Out of Play: Sideline restarts via kick-in or throw-in. Goal line restarts via goal kick or corner kick.',
      '5. Goalkeeper Rules: Hands allowed only in penalty area. No handling of deliberate foot back-passes.',
      '6. Offside Rule: No Offside Rule in 5v5 mini-football format for fast gameplay.',
      '7. Cards & Suspensions: Yellow Card (warning) | Red Card (player sent off). 2 Yellow Cards = Red Card.'
    ]
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    category: 'Indoor',
    type: 'Singles & Doubles',
    tagline: 'Soar, Smash & Dominate the Court',
    description: 'High-energy racket sport demanding speed, agility, and precision footwork. Features Mens Singles, Womens Singles, and Mixed Doubles.',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    venue: 'Badminton Arena Courts 1-4',
    teamSize: '1 - 2 Players',
    minPlayers: 1,
    maxPlayers: 2,
    rules: [
      'BWF standard scoring (21 points per game, best of 3).',
      'Yonex AS-30 feather shuttles will be used.',
      'Strict dress code: Sports jersey & non-marking indoor shoes.',
      'Walkover given if player is late by more than 15 minutes.'
    ]
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    icon: '🏓',
    category: 'Indoor',
    type: 'Singles & Doubles',
    tagline: 'Speed, Spin & Lightning Reflexes',
    description: 'Fast-paced indoor sport testing quick reflexes, spin control, and tactical shot placement across singles and doubles events.',
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
    venue: 'Indoor Sports Complex Hall A',
    teamSize: '1 - 2 Players',
    minPlayers: 1,
    maxPlayers: 2,
    rules: [
      '1. Games are played to 11 points (Must win by 2 points. Best 3 of 5 Games).',
      '2. Alternate serves every two points (At 10-10 deuce, service alternates every point).',
      '3. Toss the ball straight up at least 6" when serving from open palm behind table.',
      '4. Doubles serves must go right court to right court. Partners alternate hits during rally.'
    ]
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    category: 'Outdoor',
    type: 'Team (5 Players)',
    tagline: 'Fast Breaks, High Flies & Rim Shakers',
    description: 'Full-court 5v5 basketball with fast-paced transitions, three-pointers, and electric atmosphere under stadium floodlights.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    venue: 'Outdoor Synthetic Basketball Court',
    teamSize: '5 + 5 Subs',
    minPlayers: 5,
    maxPlayers: 10,
    rules: [
      'FIBA official rules apply.',
      '4 quarters of 8 minutes each (stop-clock in last 2 mins).',
      '5 team fouls per quarter result in bonus free throws.',
      'Overtime duration 3 minutes if tied at full-time.'
    ]
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    icon: '🏐',
    category: 'Outdoor',
    type: 'Team (6 Players)',
    tagline: 'Set, Spike & Block Your Way to Victory',
    description: 'Dynamic 6v6 volleyball featuring powerful spikes, tactical sets, and dramatic rallies on the outdoor clay court.',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    venue: 'Volleyball Arena Court 1',
    teamSize: '6 + 4 Subs',
    minPlayers: 6,
    maxPlayers: 10,
    rules: [
      'FIVB rules (Best of 3 sets, 25 pts first 2 sets, 15 pts 3rd set).',
      'Rotation rule mandatory on service gains.',
      'Libero player must wear contrasting jersey color.',
      'Net touch results in immediate point award to opponent.'
    ]
  },
  {
    id: 'kabaddi',
    name: 'Kabaddi',
    icon: '🤼',
    category: 'Traditional & Combat',
    type: 'Team (7 Players)',
    tagline: 'Power, Strategy & Raw Athleticism',
    description: 'Pro-style Kabaddi on synthetic matting with high-impact tackles, super raids, and intense adrenaline-fueled momentum.',
    image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    venue: 'Indoor Kabaddi Arena Mat 1',
    teamSize: '7 + 5 Subs',
    minPlayers: 7,
    maxPlayers: 12,
    rules: [
      'Pro Kabaddi League rules on approved mats.',
      '20 minutes each half with a 5-minute break.',
      'Do-or-Die raid active on every 3rd empty raid.',
      'Super Tackle awards 2 points when 3 or fewer defenders are on mat.'
    ]
  },
  {
    id: 'chess',
    name: 'Chess',
    icon: '♟️',
    category: 'Mind Sport',
    type: 'Individual',
    tagline: 'Master the Board, Outsmart the Mind',
    description: 'The ultimate battle of intellect and strategic depth. FIDE Blitz and Rapid rounds featuring top collegiate players.',
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
    venue: 'Central Auditorium Hall B',
    teamSize: '1 Player',
    minPlayers: 1,
    maxPlayers: 1,
    rules: [
      'FIDE Rapid format: 15 mins + 10s increment per move.',
      'Swiss-system tournament over 7 rounds.',
      'Electronic devices strictly prohibited in tournament area.',
      'Tie-breaks resolved via Buchholz system & Armageddon.'
    ]
  },
  {
    id: 'athletics',
    name: 'Athletics',
    icon: '🏃',
    category: 'Track & Field',
    type: 'Individual & Relay',
    tagline: 'Faster, Higher, Stronger',
    description: 'Track and field spectacle including 100m, 200m, 400m, 4x100m Relay, Shot Put, and Long Jump events.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    venue: 'Olympic Synthetic Track & Field Arena',
    teamSize: '1 Player / Relay Team',
    minPlayers: 1,
    maxPlayers: 4,
    rules: [
      'IAAF timing rules with electronic timing gate.',
      'False start rule: 1st false start disqualifies the runner.',
      'Spikes allowed (max 6mm length).',
      'Medals awarded for Top 3 in each track & field event.'
    ]
  },
  {
    id: 'kho-kho',
    name: 'Kho-Kho',
    icon: '🏃‍♂️',
    category: 'Traditional',
    type: 'Team (9 Players)',
    tagline: 'Speed, Endurance & Tactical Chasing',
    description: 'Traditional Indian tag sport featuring rapid zig-zag chasing, dodges, and exhilarating squad coordination.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
    venue: 'Outdoor Sports Ground 2',
    teamSize: '9 + 3 Subs',
    minPlayers: 9,
    maxPlayers: 12,
    rules: [
      'KKFI official guidelines.',
      '2 innings per match, each inning consists of 9-minute turns.',
      'Chasers can change direction only at poles.',
      'Proper chest number bibs mandatory.'
    ]
  },
  {
    id: 'tug-of-war',
    name: 'Tug of War',
    icon: '🪢',
    category: 'Strength',
    type: 'Team (8 Players)',
    tagline: 'Raw Power, Grip Endurance & Team Grit',
    description: 'Exclusively open to campus students. Raw test of collective power, grip endurance, and teamwork in a best-of-3 pulls showdown.',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    venue: 'Main Central Grass Field',
    teamSize: '8 Players',
    minPlayers: 8,
    maxPlayers: 10,
    rules: [
      'TWIF official rules & weight class limits.',
      'Best of 3 pulls; 4-meter mark to cross centerline.',
      'No boots with metal studs or cleats allowed.',
      'Anchor position must wrap rope safely around waist.'
    ]
  },
  {
    id: 'gully-cricket',
    name: 'Gully Cricket',
    icon: '🏏',
    category: 'Outdoor',
    type: 'Team (6 Players)',
    tagline: 'Street Rules, Rapid Sixes & High Energy',
    description: 'High-octane 6-over fast box cricket played under local street rules with boundary walls and one-hand one-bounce catches.',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    venue: 'Street Pitch Ground 1',
    teamSize: '6 Players',
    minPlayers: 5,
    maxPlayers: 8,
    rules: [
      '6 overs per innings limit.',
      'Direct wall hit boundary counts for 4 or 6 runs.',
      'One-hand one-bounce catch declared out.',
      'Overarm fast bowling strictly prohibited.'
    ]
  }
];

export const getSportConfig = (sportId) => {
  if (!sportId) return MPGI_SPORTS[0];
  const normalized = sportId.toLowerCase().trim();
  return MPGI_SPORTS.find(s => 
    s.id === normalized || 
    s.name.toLowerCase() === normalized ||
    normalized.includes(s.id) ||
    s.id.includes(normalized)
  ) || MPGI_SPORTS[0];
};
