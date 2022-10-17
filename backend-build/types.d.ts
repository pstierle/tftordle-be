export interface ITrait {
    label: string;
    imagePath: string;
}
export interface IChampion {
    id: string;
    name: string;
    traits: ITrait[];
    traitCount: number;
    imagePath: string;
    cost: number;
    set: number;
}
