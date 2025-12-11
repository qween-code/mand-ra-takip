export interface Cow {
    id: string;
    name: string;
    tagNumber: string;
    morningMilked: boolean;
    eveningMilked: boolean;
    morningLiters: number;
    eveningLiters: number;
    yesterdayLiters?: number;
}

export interface Calf {
    id: string;
    name: string;
    motherName: string;
    ageMonths: number;
    targetConsumption: number;
    dailyConsumption: number;
}

export interface FarmerCollection {
    id: string;
    name: string;
    amount: number;
    temperature: number;
    qualityOk: boolean;
    collected: boolean;
}
