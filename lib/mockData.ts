// Centralized mock data and helpers used when MongoDB is unavailable
interface CitizenMock {
  _id: string;
  name: string;
  fatherName: string;
  motherName: string;
  nid: string;
  phone: string;
  address: string;
  dob: string;
  createdAt: string;
}

interface CertificateMock {
  _id: string;
  citizenId: {
    name: string;
    nid: string;
  };
  certificateNumber: string;
  type: string;
  issueDate: string;
  status: string;
  createdAt: string;
}

const nowIso = new Date().toISOString();

export const mockCitizens: CitizenMock[] = [
  {
    _id: 'mock-citizen-1',
    name: 'Ayesha Rahman',
    fatherName: 'Mahmud Rahman',
    motherName: 'Sara Rahman',
    nid: '1987654321',
    phone: '+8801700000001',
    address: 'Banani, Dhaka',
    dob: new Date('1990-05-12').toISOString(),
    createdAt: nowIso,
  },
  {
    _id: 'mock-citizen-2',
    name: 'Imran Hossain',
    fatherName: 'Faruque Hossain',
    motherName: 'Nasima Hossain',
    nid: '1987654322',
    phone: '+8801700000002',
    address: 'Chittagong',
    dob: new Date('1985-11-03').toISOString(),
    createdAt: nowIso,
  },
  {
    _id: 'mock-citizen-3',
    name: 'Farhana Akter',
    fatherName: 'Anisul Akter',
    motherName: 'Razia Akter',
    nid: '1987654323',
    phone: '+8801700000003',
    address: 'Rajshahi',
    dob: new Date('1995-02-18').toISOString(),
    createdAt: nowIso,
  },
];

export const mockCertificates: CertificateMock[] = [
  {
    _id: 'mock-cert-1',
    citizenId: {
      name: mockCitizens[0].name,
      nid: mockCitizens[0].nid,
    },
    certificateNumber: 'CIT-240512-001',
    type: 'Citizenship',
    issueDate: nowIso,
    status: 'Issued',
    createdAt: nowIso,
  },
  {
    _id: 'mock-cert-2',
    citizenId: {
      name: mockCitizens[1].name,
      nid: mockCitizens[1].nid,
    },
    certificateNumber: 'CHR-240512-002',
    type: 'Character',
    issueDate: nowIso,
    status: 'Pending',
    createdAt: nowIso,
  },
];

export const defaultSettings = {
  siteName: 'Admin Dashboard',
  adminEmail: 'admin@example.com',
  enableNotifications: true,
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  unionNameEn: 'Union Parishad',
  unionNameBn: 'ইউনিয়ন পরিষদ',
  unionAddressEn: '',
  unionAddressBn: '',
  chairmanNameEn: '',
  chairmanNameBn: '',
  unionLogo: '',
  holdingTaxAmount: 0,
  isHoldingTaxMandatory: false,
  holdingTaxYearStartMonth: 7,
};

export function generateMockAnalytics() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = days.map((day) => ({
    name: day,
    revenue: Math.floor(Math.random() * 5000) + 3000,
    users: Math.floor(Math.random() * 200) + 100,
    sessions: Math.floor(Math.random() * 500) + 200,
  }));

  return {
    stats: {
      totalUsers: 12543,
      activeUsers: 3241,
      revenue: 45230,
      conversions: 892,
      sessions: 8432,
      bounceRate: 45.2,
    },
    chartData,
  };
}

export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { name?: string; message?: string };
  return !!(
    err?.name === 'MongooseServerSelectionError' ||
    err?.message?.includes('ECONNREFUSED') ||
    err?.message?.includes('failed to connect to server')
  );
}
