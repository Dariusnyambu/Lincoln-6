export interface RSVPData {
  timestamp?: string;
  parentName: string;
  phone: string;
  email?: string;
  childName: string;
  adults: number;
  children: number;
  attendance: 'attending' | 'not-attending' | '';
  notes?: string;
}

export interface RSVPStats {
  total: number;
  attending: number;
  notAttending: number;
  totalAdults: number;
  totalChildren: number;
}

export interface RSVPApiResponse {
  success: boolean;
  rsvps?: RSVPData[];
  stats?: RSVPStats;
  error?: string;
}
