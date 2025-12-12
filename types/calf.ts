export type Calf = {
  id: string;
  ear_tag: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
  mother_id?: string;
  status: 'active' | 'sold' | 'deceased' | 'culled';
  health_status: 'healthy' | 'sick' | 'recovering' | 'critical';
  current_weight: number;
  is_weaned: boolean;
};

// ... existing types
