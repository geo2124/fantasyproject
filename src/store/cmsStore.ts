import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavItem {
  id: string;
  label: string;
  to: string;
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tag: string;
  sport: 'football' | 'basketball' | 'all';
}

import { Player, PlayerStats } from '../types';

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  sport: 'football' | 'basketball' | 'all';
}

export interface PriceFormula {
  id: string;
  name: string;
  sport: 'football' | 'basketball';
  formula: string; // e.g. "pts * 0.1 + reb * 0.05"
}

export interface Round {
  id: string;
  name: string;
  sport: 'football' | 'basketball';
  startDate: string;
  endDate: string;
  isComplete: boolean;
}

export interface CmsState {
  ads: {
    popupEnabled: boolean;
    popupImage: string;
    popupLink: string;
    bannerEnabled: boolean;
    bannerImage: string;
    bannerLink: string;
  };
  footballHome: {
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    tickerText: string;
    statsHighlight: string;
    heroImage: string;
    heroVideo: string;
  };
  basketballHome: {
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    tickerText: string;
    statsHighlight: string;
    heroImage: string;
    heroVideo: string;
  };
  navigation: {
    mainNav: NavItem[];
    footerCol1: NavItem[];
    footerCol2: NavItem[];
    footerCol3: NavItem[];
  };
  blogs: BlogItem[];
  players: Player[];
  priceFormulas: PriceFormula[];
  analytics: {
    googleAnalyticsId: string;
    metaPixelId: string;
    customScripts: string;
  };
  
  pages: CustomPage[];
  rounds: Round[];
  
  updateAds: (updates: Partial<CmsState["ads"]>) => void;
  updateFootballHome: (updates: Partial<CmsState['footballHome']>) => void;
  updateBasketballHome: (updates: Partial<CmsState['basketballHome']>) => void;
  updateNavigation: (updates: Partial<CmsState['navigation']>) => void;
  
  addRound: (round: Round) => void;
  updateRound: (id: string, updates: Partial<Round>) => void;
  deleteRound: (id: string) => void;
  
  addPage: (page: CustomPage) => void;
  updatePage: (id: string, updates: Partial<CustomPage>) => void;
  deletePage: (id: string) => void;

  addBlog: (blog: BlogItem) => void;
  updateBlog: (id: string, updates: Partial<BlogItem>) => void;
  deleteBlog: (id: string) => void;

  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  addPlayerStats: (playerId: string, fixtureId: string, stats: PlayerStats) => void;

  addFormula: (formula: PriceFormula) => void;
  updateFormula: (id: string, updates: Partial<PriceFormula>) => void;
  deleteFormula: (id: string) => void;
  
  updateAnalytics: (updates: Partial<CmsState['analytics']>) => void;
}

export const useCmsStore = create<CmsState>()(
  persist(
    (set) => ({
      footballHome: {
         heroTitle1: "ORCHESTRATE",
         heroTitle2: "THE PITCH.",
         heroSubtitle: "Granular event data. Build your squad, earn in real time.",
         tickerText: "PREMIER LEAGUE, LA LIGA, SERIE A, BUNDESLIGA, LIGUE 1",
         statsHighlight: "1.2M MANAGERS ACTIVE",
         heroImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop",
         heroVideo: "",
      },
      basketballHome: {
         heroTitle1: "DOMINATE",
         heroTitle2: "THE HARDWOOD.",
         heroSubtitle: "Draft elite players. Track realtime assists, points, and rebounds.",
         tickerText: "LBL DIVISION 1, DUBAI TOURNAMENT, LEB CUP",
         statsHighlight: "500K MANAGERS",
         heroImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2000&auto=format&fit=crop",
         heroVideo: "",
      },
      navigation: {
         mainNav: [
           { id: '1', label: 'LEAGUES', to: '/league' },
           { id: '2', label: 'SCOUT', to: '/scout' },
           { id: '3', label: 'NEWS', to: '/news' }
         ],
         footerCol1: [
           { id: 'f1-1', label: 'Leagues', to: '/leagues' },
           { id: 'f1-2', label: 'Fixtures', to: '/fixtures' },
           { id: 'f1-3', label: 'Standings', to: '/standings' },
         ],
         footerCol2: [
           { id: 'f2-1', label: 'Players', to: '/players' },
           { id: 'f2-2', label: 'Transfers', to: '/dashboard/transfers' },
         ],
         footerCol3: [
           { id: 'f3-1', label: 'Sign In', to: '/login' },
           { id: 'f3-2', label: 'Support', to: '/support' },
         ]
      },
      blogs: [
         {
           id: 'b1',
           title: "Gameweek 4: Captaincy Picks",
           excerpt: "Who should wear the armband this week?",
           content: "Full content here...",
           date: "2H AGO",
           tag: "STRATEGY",
           sport: "football"
         },
         {
           id: 'b2',
           title: "Top 5 Guards for the Playoffs",
           excerpt: "Maximize your points with these PG selections.",
           content: "Full content here...",
           date: "1D AGO",
           tag: "SCOUT",
           sport: "basketball"
         }
      ],
      players: [
        { id: 'b1', name: 'Wael Arakji', team: 'Al Riyadi', position: 'PG', price: 8.5, totalPoints: 210, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Wael_Arakji.jpg', basketballPosDetail: { type: 'combo', primary: 'PG', secondary: 'SG', label: 'COMBO GUARD' } },
        { id: 'b2', name: 'Ali Haidar', team: 'Beirut Club', position: 'PF', price: 8.0, totalPoints: 195, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'C', label: 'BIG' } },
        { id: 'b3', name: 'Sergio El Darwich', team: 'Sagesse', position: 'SG', price: 7.5, totalPoints: 180, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'GUARD' } },
        { id: 'b4', name: 'Karim Zeinoun', team: 'Al Riyadi', position: 'SG', price: 6.0, totalPoints: 160, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'WING' } },
        { id: 'b5', name: 'Ali Mansour', team: 'Dynamo', position: 'PG', price: 5.5, totalPoints: 140, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
        { id: 'b6', name: 'Ater Majok', team: 'Sagesse', position: 'C', price: 7.0, totalPoints: 170, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' }, isImport: true },
        { id: 'b7', name: 'Amir Saoud', team: 'Al Riyadi', position: 'SG', price: 6.5, totalPoints: 155, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'SHARPSHOOTER' } },
        { id: 'b8', name: 'Hayk Gyokchyan', team: 'Al Riyadi', position: 'PF', price: 4.5, totalPoints: 130, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'SF', label: 'FORWARD' } },
        { id: 'b9', name: 'Jean Abdel Nour', team: 'Al Riyadi', position: 'SF', price: 2.0, totalPoints: 85, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' }, isImport: false },
        { id: 'b10', name: 'Gerard Hadidian', team: 'Beirut Club', position: 'C', price: 3.5, totalPoints: 110, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1542178243-fc20202b85e6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },
        { id: 'b11', name: 'Mark Khoury', team: 'Sagesse', position: 'PF', price: 1.5, totalPoints: 45, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'SF', label: 'FORWARD' } },
        { id: 'b12', name: 'Elie Rustom', team: 'Beirut Club', position: 'SF', price: 3.0, totalPoints: 95, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
        { id: 'b13', name: 'Jad Khalil', team: 'Dynamo', position: 'PG', price: 4.0, totalPoints: 120, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PG', secondary: 'SG', label: 'COMBO GUARD' } },
        { id: 'b14', name: 'Marc Khoueiry', team: 'Sagesse', position: 'SG', price: 1.5, totalPoints: 50, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'GUARD' } },
        { id: 'b15', name: 'Jimmy Salem', team: 'Dynamo', position: 'SG', price: 2.0, totalPoints: 60, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'WING' } },
        { id: 'b16', name: 'Karim Ezzedine', team: 'Dynamo', position: 'C', price: 2.5, totalPoints: 75, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'C', secondary: 'PF', label: 'BIG' } },
        { id: 'b17', name: 'Omar Jamaleddine', team: 'Beirut Club', position: 'SF', price: 2.5, totalPoints: 80, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
        { id: 'b18', name: 'Ali Mezher', team: 'Sagesse', position: 'PG', price: 3.5, totalPoints: 105, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
        { id: 'b19', name: 'Georges El Beyrouty', team: 'Dynamo', position: 'PG', price: 1.5, totalPoints: 40, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
        { id: 'b20', name: 'Gabriel Salibi', team: 'Beirut Club', position: 'SG', price: 1.0, totalPoints: 20, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'GUARD' } },
        { id: 'b21', name: 'Nadim Souaid', team: 'Sagesse', position: 'SF', price: 1.0, totalPoints: 25, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1504257404282-534fc139367c?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
        { id: 'b22', name: 'Izzat El Kaissi', team: 'Al Riyadi', position: 'C', price: 1.0, totalPoints: 15, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },
        { id: 'b23', name: 'Ali Farhat', team: 'Hoops', position: 'PG', price: 1.5, totalPoints: 30, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
        { id: 'b24', name: 'Khalil Aoun', team: 'Hoops', position: 'PF', price: 2.0, totalPoints: 40, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'C', label: 'BIG' } },
        { id: 'b25', name: 'Jason Rabeh', team: 'Hoops', position: 'SG', price: 1.0, totalPoints: 10, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'WING' } },
        { id: 'b26', name: 'Youssef Ghantous', team: 'Antranik', position: 'PG', price: 2.5, totalPoints: 60, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
        { id: 'b27', name: 'Christian Harvey', team: 'Antranik', position: 'SG', price: 3.5, totalPoints: 90, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'PG', label: 'GUARD' } },
        { id: 'b28', name: 'Salim Alaaeddine', team: 'Antranik', position: 'PF', price: 1.0, totalPoints: 15, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PF', label: 'FORWARD' } },
        { id: 'b29', name: 'Javien Williams', team: 'Champville', position: 'SG', price: 4.5, totalPoints: 120, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'SHARPSHOOTER' } },
        { id: 'b30', name: 'Patrick Bou Abboud', team: 'Champville', position: 'SF', price: 3.0, totalPoints: 70, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SF', secondary: 'PF', label: 'FORWARD' } },
        { id: 'b31', name: 'Gaby Ajemian', team: 'Champville', position: 'PG', price: 1.5, totalPoints: 25, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1542178243-fc20202b85e6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
        { id: 'b32', name: 'Dallas Morgan', team: 'NSA', position: 'SG', price: 4.0, totalPoints: 100, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'GUARD' } },
        { id: 'b33', name: 'Calvin Godfrey', team: 'NSA', position: 'C', price: 5.0, totalPoints: 130, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },
        { id: 'b34', name: 'Elias Sebaaly', team: 'NSA', position: 'PF', price: 1.0, totalPoints: 10, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'SF', label: 'FORWARD' } },
        { sport: 'football', id: 'p1', name: 'Hassan Maatouk', team: 'Al Ansar', position: 'FWD', price: 14.0, totalPoints: 180, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/144673-1629891784.jpg' },
        { sport: 'football', id: 'p2', name: 'Mohamad Haidar', team: 'Al Ahed', position: 'MID', price: 13.0, totalPoints: 175, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171578-1568213693.jpg' },
        { sport: 'football', id: 'p3', name: 'Rabih Ataya', team: 'Nejmeh', position: 'MID', price: 9.0, totalPoints: 150, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171577-1629891395.jpg' },
        { sport: 'football', id: 'p4', name: 'Bassel Jradi', team: 'Bangkok United', position: 'FWD', price: 8.5, totalPoints: 140, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/267727-1602061036.jpg' },
        { sport: 'football', id: 'p5', name: 'Kassem El Zein', team: 'Nejmeh', position: 'DEF', price: 7.0, totalPoints: 100, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171574-1629892015.jpg' },
        { sport: 'football', id: 'p6', name: 'Mostafa Matar', team: 'Al Ahed', position: 'GKP', price: 5.5, totalPoints: 90, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/543166-1629891963.jpg' },
        { sport: 'football', id: 'p7', name: 'Nour Mansour', team: 'Al Ahed', position: 'DEF', price: 5.5, totalPoints: 110, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/144672-1629891638.jpg' },
      ],
      pages: [
         {
           id: 'p1',
           slug: 'about',
           title: 'About',
           content: '# About Us\n\nWelcome to the fantasy platform...',
           sport: 'all'
         },
         {
           id: 'p2',
           slug: 'contact',
           title: 'Contact',
           content: '# Contact Us\n\nReach out at support@example.com',
           sport: 'all'
         }
      ],
      rounds: [
        { id: 'r1', name: 'Gameweek 1', sport: 'basketball', startDate: '2026-05-01', endDate: '2026-05-07', isComplete: true },
        { id: 'r2', name: 'Gameweek 2', sport: 'basketball', startDate: '2026-05-08', endDate: '2026-05-14', isComplete: false },
      ],
      priceFormulas: [
        { id: 'f-b-1', name: 'Standard Basketball', sport: 'basketball', formula: 'points * 0.1 + assists * 0.2 + rebounds * 0.15 + (steals + blocks) * 0.3 - turnovers * 0.2' }
      ],
      analytics: {
         googleAnalyticsId: '',
         metaPixelId: '',
         customScripts: ''
      },
      ads: {
         popupEnabled: true,
         popupImage: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80',
         popupLink: '#',
         bannerEnabled: true,
         bannerImage: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80',
         bannerLink: '#'
      },
      updateAds: (updates) => set((state) => ({ ads: { ...state.ads, ...updates } })),
      updateFootballHome: (updates) => set((state) => ({ footballHome: { ...state.footballHome, ...updates } })),
      updateBasketballHome: (updates) => set((state) => ({ basketballHome: { ...state.basketballHome, ...updates } })),
      updateNavigation: (updates) => set((state) => ({ navigation: { ...state.navigation, ...updates } })),
      
      addRound: (round) => set((state) => ({ rounds: [round, ...state.rounds] })),
      updateRound: (id, updates) => set((state) => ({ rounds: state.rounds.map(r => r.id === id ? { ...r, ...updates } : r) })),
      deleteRound: (id) => set((state) => ({ rounds: state.rounds.filter(r => r.id !== id) })),

      addPage: (page) => set((state) => ({ pages: [page, ...state.pages] })),
      updatePage: (id, updates) => set((state) => ({ pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p) })),
      deletePage: (id) => set((state) => ({ pages: state.pages.filter(p => p.id !== id) })),

      addBlog: (blog) => set((state) => ({ blogs: [blog, ...state.blogs] })),
      updateBlog: (id, updates) => set((state) => ({ blogs: state.blogs.map(b => b.id === id ? { ...b, ...updates } : b) })),
      deleteBlog: (id) => set((state) => ({ blogs: state.blogs.filter(b => b.id !== id) })),

      addPlayer: (player) => set((state) => ({ players: [player, ...state.players] })),
      updatePlayer: (id, updates) => set((state) => ({ players: state.players.map(p => p.id === id ? { ...p, ...updates } : p) })),
      deletePlayer: (id) => set((state) => ({ players: state.players.filter(p => p.id !== id) })),
      addPlayerStats: (playerId, fixtureId, stats) => set((state) => ({
        players: state.players.map(p => p.id === playerId ? { 
          ...p, 
          statsHistory: { ...p.statsHistory, [fixtureId]: stats } 
        } : p)
      })),

      addFormula: (formula) => set((state) => ({ priceFormulas: [formula, ...state.priceFormulas] })),
      updateFormula: (id, updates) => set((state) => ({ priceFormulas: state.priceFormulas.map(f => f.id === id ? { ...f, ...updates } : f) })),
      deleteFormula: (id) => set((state) => ({ priceFormulas: state.priceFormulas.filter(f => f.id !== id) })),
      
      updateAnalytics: (updates) => set((state) => ({ analytics: { ...state.analytics, ...updates } })),
    }),
    {
      name: 'cms-store',
      merge: (persistedState: unknown, currentState: CmsState) => {
        const persisted = (persistedState as Partial<CmsState>) || {};
        return {
          ...currentState,
          ...persisted,
          footballHome: { ...currentState.footballHome, ...(persisted.footballHome || {}) },
          basketballHome: { ...currentState.basketballHome, ...(persisted.basketballHome || {}) },
          navigation: {
            mainNav: persisted.navigation?.mainNav || currentState.navigation.mainNav,
            footerCol1: persisted.navigation?.footerCol1 || currentState.navigation.footerCol1,
            footerCol2: persisted.navigation?.footerCol2 || currentState.navigation.footerCol2,
            footerCol3: persisted.navigation?.footerCol3 || currentState.navigation.footerCol3,
          },
          analytics: { ...currentState.analytics, ...(persisted.analytics || {}) },
          ads: { ...currentState.ads, ...(persisted.ads || {}) },
          rounds: persisted.rounds || currentState.rounds,
          priceFormulas: persisted.priceFormulas || currentState.priceFormulas,
          pages: persisted.pages || currentState.pages,
          blogs: persisted.blogs || currentState.blogs,
          players: persisted.players || currentState.players,
        };
      },
    }
  )
);

