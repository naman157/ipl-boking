// IPL 2025 Teams - Colors, taglines, home grounds
export const IPL_TEAMS = {
  CSK: {
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    color: '#F5A800',
    secondaryColor: '#0A2B6E',
    tagline: 'Whistle Podu!',
    captain: 'MS Dhoni',
    homeGround: 'MA Chidambaram Stadium',
    titles: 5,
    gradient: 'linear-gradient(135deg, #F5A800, #ffcc44)',
  },
  MI: {
    name: 'Mumbai Indians',
    shortName: 'MI',
    color: '#004BA0',
    secondaryColor: '#D1AB3E',
    tagline: 'Duniya Hila Denge',
    captain: 'Hardik Pandya',
    homeGround: 'Wankhede Stadium',
    titles: 5,
    gradient: 'linear-gradient(135deg, #004BA0, #0066cc)',
  },
  RCB: {
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    color: '#EC1C24',
    secondaryColor: '#000000',
    tagline: 'Ee Sala Cup Namde!',
    captain: 'Virat Kohli',
    homeGround: 'M. Chinnaswamy Stadium',
    titles: 0,
    gradient: 'linear-gradient(135deg, #EC1C24, #ff4444)',
  },
  KKR: {
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    color: '#3A225D',
    secondaryColor: '#B3892B',
    tagline: 'Korbo Lorbo Jeetbo',
    captain: 'Shreyas Iyer',
    homeGround: 'Eden Gardens',
    titles: 3,
    gradient: 'linear-gradient(135deg, #3A225D, #6b3fa0)',
  },
  DC: {
    name: 'Delhi Capitals',
    shortName: 'DC',
    color: '#0078BC',
    secondaryColor: '#EF1C25',
    tagline: 'Roar Machaenge',
    captain: 'Rishabh Pant',
    homeGround: 'Arun Jaitley Stadium',
    titles: 0,
    gradient: 'linear-gradient(135deg, #0078BC, #00aaff)',
  },
  PBKS: {
    name: 'Punjab Kings',
    shortName: 'PBKS',
    color: '#ED1B24',
    secondaryColor: '#A7A9AC',
    tagline: 'Sher Punjab Da',
    captain: 'Shikhar Dhawan',
    homeGround: 'PCA Stadium',
    titles: 1,
    gradient: 'linear-gradient(135deg, #ED1B24, #ff5533)',
  },
  RR: {
    name: 'Rajasthan Royals',
    shortName: 'RR',
    color: '#EA1A85',
    secondaryColor: '#254AA5',
    tagline: 'Halla Bol',
    captain: 'Sanju Samson',
    homeGround: 'Sawai Mansingh Stadium',
    titles: 2,
    gradient: 'linear-gradient(135deg, #EA1A85, #ff44aa)',
  },
  SRH: {
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    color: '#FF6200',
    secondaryColor: '#000000',
    tagline: 'Orange Army',
    captain: 'Pat Cummins',
    homeGround: 'Rajiv Gandhi Intl Stadium',
    titles: 1,
    gradient: 'linear-gradient(135deg, #FF6200, #ff8c00)',
  },
  GT: {
    name: 'Gujarat Titans',
    shortName: 'GT',
    color: '#1C1C5E',
    secondaryColor: '#C8A951',
    tagline: 'Aava Do',
    captain: 'Shubman Gill',
    homeGround: 'Narendra Modi Stadium',
    titles: 2,
    gradient: 'linear-gradient(135deg, #1C1C5E, #2e2e8f)',
  },
  LSG: {
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    color: '#A72B2A',
    secondaryColor: '#FFCC00',
    tagline: 'Sixer Maar',
    captain: 'KL Rahul',
    homeGround: 'BRSABV Ekana Stadium',
    titles: 0,
    gradient: 'linear-gradient(135deg, #A72B2A, #cc3333)',
  }
};

// SVG Team Logo components (geometric/abstract style)
export const TeamLogo = ({ shortName, size = 52 }) => {
  const team = IPL_TEAMS[shortName] || {};
  const color = team.color || '#ff6b00';
  const secondary = team.secondaryColor || '#ffffff';

  const logos = {
    CSK: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <circle cx="50" cy="50" r="38" fill="none" stroke={secondary} strokeWidth="3" />
        <text x="50" y="58" textAnchor="middle" fill={secondary} fontSize="28" fontWeight="900" fontFamily="Arial Black">CSK</text>
        <path d="M 20 70 Q 50 85 80 70" fill="none" stroke={secondary} strokeWidth="2.5" />
      </svg>
    ),
    MI: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <path d="M50 15 L85 70 L15 70 Z" fill={secondary} opacity="0.9" />
        <text x="50" y="65" textAnchor="middle" fill={color} fontSize="18" fontWeight="900" fontFamily="Arial Black">MI</text>
      </svg>
    ),
    RCB: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill="#111" />
        <circle cx="50" cy="50" r="38" fill={color} />
        <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900" fontFamily="Arial Black">RCB</text>
        <path d="M 25 25 L 50 10 L 75 25" fill="none" stroke="#ffd700" strokeWidth="3" />
      </svg>
    ),
    KKR: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <polygon points="50,15 62,40 90,40 68,57 76,82 50,65 24,82 32,57 10,40 38,40" fill={secondary} />
        <text x="50" y="55" textAnchor="middle" fill={color} fontSize="16" fontWeight="900" fontFamily="Arial Black">KKR</text>
      </svg>
    ),
    DC: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <rect x="20" y="35" width="60" height="8" rx="4" fill="#fff" />
        <rect x="20" y="57" width="60" height="8" rx="4" fill="#EF1C25" />
        <text x="50" y="52" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="Arial Black">DC</text>
      </svg>
    ),
    PBKS: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <path d="M50 20 C30 20 15 35 15 55 C15 72 30 82 50 82 C70 82 85 72 85 55 C85 35 70 20 50 20Z" fill="#fff" opacity="0.15" />
        <text x="50" y="56" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Arial Black">PBKS</text>
        <text x="50" y="72" textAnchor="middle" fill="#ffcc00" fontSize="11" fontFamily="Arial">PUNJAB KINGS</text>
      </svg>
    ),
    RR: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="8 4" />
        <text x="50" y="55" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900" fontFamily="Arial Black">RR</text>
      </svg>
    ),
    SRH: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill="#111" />
        <path d="M10 50 Q50 10 90 50" fill={color} />
        <path d="M10 50 Q50 90 90 50" fill={color} opacity="0.5" />
        <text x="50" y="56" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900" fontFamily="Arial Black">SRH</text>
      </svg>
    ),
    GT: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <path d="M50 15 L80 45 L80 75 L50 85 L20 75 L20 45 Z" fill="none" stroke={secondary} strokeWidth="3" />
        <text x="50" y="57" textAnchor="middle" fill={secondary} fontSize="26" fontWeight="900" fontFamily="Arial Black">GT</text>
      </svg>
    ),
    LSG: (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill={color} />
        <path d="M25 75 L50 20 L75 75 Z" fill="none" stroke="#FFCC00" strokeWidth="4" />
        <text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Arial Black">LSG</text>
      </svg>
    ),
  };

  return logos[shortName] || (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="48" fill={color} />
      <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900" fontFamily="Arial Black">{shortName}</text>
    </svg>
  );
};
