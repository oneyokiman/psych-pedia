export interface Mechanism {
  name: string;
  description: string;
  role: string;
}

export type MechanismDB = Record<string, Mechanism>;

export interface StahlRadarData {
  labels: string[]; // Display labels (e.g., "D2", "5HT1A")
  values: number[]; // 0-10 affinity scale
  link_ids: string[]; // Keys to lookup in MechanismDB
}

export interface Pearl {
  title: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  content: string;
}

export interface PKData {
  half_life: string;
  protein_binding: string;
  metabolism: string;
  peak_time?: string;
  excretion?: string;
}

export interface MarketInfo {
  price: string;
  insurance: string;
  pregnancy: string;
}

export interface Drug {
  id: string;
  name_cn: string;
  name_en: string;
  category: string;
  tags: string[];
  stahl_radar: StahlRadarData;
  pearls: Pearl[];
  market_info: MarketInfo;
  pk_data: PKData;
  wiki_content?: string; // Markdown format encyclopedic content
}

export type PrincipleType = 'receptor' | 'hypothesis' | 'neuroanatomy';

export interface Principle {
  id: string;
  type: PrincipleType;
  title: string;
  subtitle?: string;
  content: string;
  visual_guide?: string; // Placeholder for image URL
  wiki_content?: string; // Markdown format encyclopedic content
}