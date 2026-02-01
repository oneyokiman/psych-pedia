export interface Mechanism {
  name: string;
  description: string;
  role: string;
}

export type MechanismDB = Record<string, Mechanism>;

// Receptor action types
export type ReceptorAction = 
  | 'agonist'           // 激动剂 - activates receptor
  | 'partial_agonist'   // 部分激动剂 - partial activation
  | 'antagonist'        // 拮抗剂 - blocks receptor
  | 'inverse_agonist'   // 反向激动剂 - opposite effect
  | 'pam'               // 正向变构调节剂 - positive allosteric modulator
  | 'nam';              // 负向变构调节剂 - negative allosteric modulator

// Enhanced receptor binding data with action type
export interface ReceptorBinding {
  label: string;        // Display label (e.g., "D2", "5HT1A")
  value: number;        // 0-10 affinity scale
  action: ReceptorAction; // Type of receptor interaction
  link_id: string;      // Key to lookup in MechanismDB
}

// Radar chart data structure
export interface StahlRadarData {
  // New format: array of detailed binding objects
  bindings?: ReceptorBinding[];
  
  // Legacy format: separate arrays (maintained for backward compatibility)
  labels?: string[]; // Display labels (e.g., "D2", "5HT1A")
  values?: number[]; // 0-10 affinity scale
  link_ids?: string[]; // Keys to lookup in MechanismDB
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