export interface FilmingItem {
  id: number;
  name: string;
  cost: number;
  status: 'planned' | 'confirmed' | 'completed';
  contact?: string;
}

export interface FilmingCategory {
  name: string;
  items: FilmingItem[];
  budget: number;
}

export interface FilmingProduction {
  title: string;
  director: string;
  totalBudget: number;
  categories: {
    locations: FilmingCategory;
    characters: FilmingCategory;
    extras: FilmingCategory;
    props: FilmingCategory;
    transportation: FilmingCategory;
    animals: FilmingCategory;
    stunts: FilmingCategory;
  };
}
