// Enhanced Mock Data for UtsavHub with College Scoping, RBAC, Diversity Mandates & Solo Matchmaking

export const collegesList = [
  { id: 'iet', name: 'IET Lucknow', domain: 'ietlucknow.ac.in', location: 'Lucknow, UP' },
  { id: 'iitk', name: 'IIT Kanpur', domain: 'iitk.ac.in', location: 'Kanpur, UP' },
  { id: 'mnnit', name: 'MNNIT Allahabad', domain: 'mnnit.ac.in', location: 'Prayagraj, UP' },
  { id: 'dtu', name: 'DTU Delhi', domain: 'dtu.ac.in', location: 'New Delhi' },
  { id: 'bhu', name: 'IIT BHU Varanasi', domain: 'iitbhu.ac.in', location: 'Varanasi, UP' }
];

export const initialEvents = [
  {
    id: 'evt-1',
    title: 'HackIET 2026: National AI Hackathon',
    college: 'IET Lucknow',
    collegeScope: 'All Colleges (Inter-College)',
    category: 'Hackathons',
    date: 'Nov 28 - Nov 30, 2026',
    time: '09:00 AM IST',
    venue: 'APJ Abdul Kalam Computer Center & Audi',
    organizer: 'CSE Tech Council',
    description: '48-hour sprint on generative AI, IoT, and Web3 systems. Requires 3-4 members per squad. Diversity prize awarded to teams with female representation.',
    fee: 0,
    isTeam: true,
    teamMin: 3,
    teamMax: 4,
    requiresFemaleTeammate: true,
    seatLimit: 200,
    registeredCount: 142,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    tags: ['AI/ML', 'Diversity Mandate', 'Prize ₹50K']
  },
  {
    id: 'evt-2',
    title: 'Encore: Inter-College Battle of Bands',
    college: 'IET Lucknow',
    collegeScope: 'All Colleges (Inter-College)',
    category: 'Cultural',
    date: 'Dec 05, 2026',
    time: '05:30 PM IST',
    venue: 'Open Air Theatre (OAT), Main Campus',
    organizer: 'Music & Cultural Society',
    description: '16 collegiate rock and fusion bands duel under the stars for the state championship crown and studio recording sponsorship.',
    fee: 150,
    isTeam: true,
    teamMin: 4,
    teamMax: 8,
    requiresFemaleTeammate: false,
    seatLimit: 500,
    registeredCount: 380,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    tags: ['Live Bands', 'Inter-College', 'Fee ₹150']
  },
  {
    id: 'evt-3',
    title: 'RoboKriti: Autonomous Maze & Combat Wars',
    college: 'IIT Kanpur',
    collegeScope: 'All Colleges (Inter-College)',
    category: 'Technical',
    date: 'Dec 12, 2026',
    time: '10:00 AM IST',
    venue: 'Mechanical Robotics Arena, IIT Kanpur',
    organizer: 'IITK Robotics Club',
    description: 'Line follower robots, autonomous maze solvers, and 15kg featherweight robot wars with strict safety and arena guidelines.',
    fee: 250,
    isTeam: true,
    teamMin: 2,
    teamMax: 4,
    requiresFemaleTeammate: false,
    seatLimit: 120,
    registeredCount: 88,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    tags: ['Robotics', 'Hardware', 'Fee ₹250']
  },
  {
    id: 'evt-4',
    title: 'Clash of Coders: Speed Algorithmics',
    college: 'IET Lucknow',
    collegeScope: 'My College Only (IET Lucknow)',
    category: 'Technical',
    date: 'Nov 24, 2026',
    time: '02:00 PM IST',
    venue: 'Lab 3, Department of CSE',
    organizer: 'Coding & Algorithmic Society',
    description: 'Exclusive intra-college speed programming challenge for IET students covering dynamic programming, graphs, and system design.',
    fee: 0,
    isTeam: false,
    teamMin: 1,
    teamMax: 1,
    requiresFemaleTeammate: false,
    seatLimit: 150,
    registeredCount: 135,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    tags: ['Intra-College', 'DSA', 'Free']
  },
  {
    id: 'evt-5',
    title: 'Zenith: Inter-Branch Football & Badminton',
    college: 'IET Lucknow',
    collegeScope: 'My College Only (IET Lucknow)',
    category: 'Sports',
    date: 'Dec 18 - Dec 20, 2026',
    time: '07:30 AM IST',
    venue: 'Institute Sports Complex & Ground',
    organizer: 'Institute Sports Council',
    description: 'Annual inter-department sports tournament with knockout league fixtures for Football, Basketball, and Badminton doubles.',
    fee: 100,
    isTeam: true,
    teamMin: 2,
    teamMax: 11,
    requiresFemaleTeammate: false,
    seatLimit: 300,
    registeredCount: 240,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    tags: ['Intra-College', 'Sports League']
  },
  {
    id: 'evt-6',
    title: 'Full-Stack MERN Architecture Masterclass',
    college: 'IET Lucknow',
    collegeScope: 'All Colleges (Inter-College)',
    category: 'Workshops',
    date: 'Dec 02, 2026',
    time: '11:00 AM IST',
    venue: 'Seminar Hall 2, IT Building',
    organizer: 'IET Alumni Tech Network',
    description: 'Hands-on masterclass on building production-grade MERN apps, JWT auth, MongoDB schema indexing, and Vite frontend optimization.',
    fee: 0,
    isTeam: false,
    teamMin: 1,
    teamMax: 1,
    requiresFemaleTeammate: false,
    seatLimit: 100,
    registeredCount: 92,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    tags: ['MERN', 'Web Dev', 'Alumni Mentorship']
  }
];

export const initialTeams = [
  {
    id: 'team-1',
    eventId: 'evt-1',
    eventTitle: 'HackIET 2026: National AI Hackathon',
    teamName: 'NeuralKnights',
    teamCode: 'NK2026',
    leader: 'Omkar Tripathi',
    leaderRoll: '2500520100142',
    leaderEmail: 'omkar.tripathi@ietlucknow.ac.in',
    minSize: 3,
    maxSize: 4,
    hasFemaleMember: true,
    members: [
      { name: 'Omkar Tripathi', roll: '2500520100142', branch: 'CSE', gender: 'Male', role: 'Leader / Full Stack' },
      { name: 'Aditya Mishra', roll: '2500520100109', branch: 'CSE', gender: 'Male', role: 'ML / Backend' },
      { name: 'Ananya Sharma', roll: '2500520100021', branch: 'IT', gender: 'Female', role: 'UI/UX & Frontend' }
    ],
    status: 'Confirmed (3/4 • Diversity Met ✓)'
  }
];

// Solo students who want to join teams for specific events
export const initialSoloPool = [
  {
    id: 'solo-1',
    eventId: 'evt-1',
    name: 'Pooja Verma',
    rollNo: '2500520100115',
    college: 'IET Lucknow',
    branch: 'CSE',
    year: '3rd Year',
    gender: 'Female',
    skills: ['UI/UX Design', 'React.js', 'Figma'],
    bio: 'Looking for a hackathon squad! Specializes in sleek frontend UI and prototyping.',
    status: 'Available'
  },
  {
    id: 'solo-2',
    eventId: 'evt-1',
    name: 'Rohan Mehra',
    rollNo: '2500520100155',
    college: 'IET Lucknow',
    branch: 'IT',
    year: '3rd Year',
    gender: 'Male',
    skills: ['Node.js', 'MongoDB', 'Python'],
    bio: 'Backend developer with experience in REST APIs and database modeling.',
    status: 'Available'
  },
  {
    id: 'solo-3',
    eventId: 'evt-1',
    name: 'Sneha Srivastava',
    rollNo: '2500520100180',
    college: 'IET Lucknow',
    branch: 'ECE',
    year: '2nd Year',
    gender: 'Female',
    skills: ['Hardware', 'IoT Sensors', 'Arduino'],
    bio: 'Passionate about smart hardware prototypes. Perfect fit for hardware track!',
    status: 'Available'
  },
  {
    id: 'solo-4',
    eventId: 'evt-1',
    name: 'Arjun Das',
    rollNo: '2500520100045',
    college: 'IIT Kanpur',
    branch: 'CSE',
    year: '4th Year',
    gender: 'Male',
    skills: ['PyTorch', 'Computer Vision', 'LLMs'],
    bio: 'ML researcher looking for an ambitious team aiming for 1st place in HackIET.',
    status: 'Available'
  },
  {
    id: 'solo-5',
    eventId: 'evt-2',
    name: 'Kavita Joshi',
    rollNo: '2500520100092',
    college: 'IET Lucknow',
    branch: 'ME',
    year: '3rd Year',
    gender: 'Female',
    skills: ['Classical & Rock Vocals', 'Keyboard'],
    bio: 'Looking to form or join an acoustic/rock band for the Encore battle!',
    status: 'Available'
  }
];

export const initialMatchRequests = [
  {
    id: 'req-1',
    eventId: 'evt-1',
    eventTitle: 'HackIET 2026: National AI Hackathon',
    senderId: 'solo-1',
    senderName: 'Pooja Verma',
    senderRoll: '2500520100115',
    senderGender: 'Female',
    senderSkills: ['UI/UX Design', 'React.js'],
    status: 'Pending'
  }
];

export const initialTickets = [
  {
    id: 'TCK-HACK-8841',
    eventId: 'evt-1',
    eventTitle: 'HackIET 2026: National AI Hackathon',
    college: 'IET Lucknow',
    attendeeName: 'Omkar Tripathi',
    rollNo: '2500520100142',
    branch: 'CSE',
    teamName: 'NeuralKnights',
    teamCode: 'NK2026',
    venue: 'APJ Abdul Kalam Computer Center & Audi',
    date: 'Nov 28, 2026',
    time: '09:00 AM IST',
    feeStatus: 'Paid',
    feeAmount: 0,
    paymentRef: 'COLLEGE_SPONSORED_FREE',
    qrToken: 'UTSAV-HACK-2026-OMKAR-NK2026-TOKEN99',
    checkedIn: false,
    checkedInAt: null
  }
];
