import {FilmingProduction} from '../types/scena';


export const movieProduction: FilmingProduction = {
  title: 'Последний рассвет',
  director: 'Иван Петров',
  totalBudget: 5000000,
  categories: {
    locations: {
      name: 'Локации',
      budget: 1200000,
      items: [
        { id: 1, name: 'Заброшенный завод', cost: 500000, status: 'confirmed', contact: 'Мария +7-999-123-45-67' },
        { id: 2, name: 'Городская площадь', cost: 300000, status: 'planned' }
      ]
    },
    characters: {
      name: 'Персонажи',
      budget: 2000000,
      items: [
        { id: 1, name: 'Джон Смит', cost: 1000000, status: 'confirmed' },
        { id: 2, name: 'Анна Джонс', cost: 500000, status: 'confirmed' }
      ]
    },
    extras: {
      name: 'Массовка',
      budget: 300000,
      items: [
        { id: 1, name: 'Статисты для митинга', cost: 150000, status: 'planned' },
        { id: 2, name: 'Актеры для кафе', cost: 60000, status: 'confirmed' }
      ]
    },
    props: {
      name: 'Реквизит',
      budget: 400000,
      items: [
        { id: 1, name: 'Исторический реквизит', cost: 200000, status: 'confirmed' },
        { id: 2, name: 'Оружие (муляжи)', cost: 80000, status: 'planned' }
      ]
    },
    transportation: {
      name: 'Транспорт',
      budget: 350000,
      items: [
        { id: 1, name: 'Грузовик для оборудования', cost: 120000, status: 'confirmed' },
        { id: 2, name: 'Автобус для массовки', cost: 90000, status: 'planned' }
      ]
    },
    animals: {
      name: 'Животные',
      budget: 250000,
      items: [
        { id: 1, name: 'Лошади', cost: 150000, status: 'confirmed', contact: 'Конный клуб' },
        { id: 2, name: 'Собаки', cost: 50000, status: 'planned' }
      ]
    },
    stunts: {
      name: 'Трюки/Пиротехника',
      budget: 400000,
      items: [
        { id: 1, name: 'Каскадеры', cost: 250000, status: 'confirmed' },
        { id: 2, name: 'Пиротехника', cost: 100000, status: 'planned' }
      ]
    }
  }
};
