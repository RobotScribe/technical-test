// TODO: Move to a shared types file
export type Pokemon = {
    name: string;
    image: string;
    imageUrl: string;
    apiTypes: {
        name: string;
        image: string;
    }[];
    stats: {
        HP: number;
        attack: number;
        defense: number;
        speed: number;
    };
};
