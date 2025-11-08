import {Injectable} from '@angular/core';

import {FilmingItem, FilmingProduction} from '../types/scena';
import {movieProduction} from '../data/data-scena';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private production: FilmingProduction = movieProduction;

  getCustomersLarge(): Promise<FilmingProduction> {
    return Promise.resolve(this.production);
  }

  addItem(categoryName: keyof FilmingProduction['categories'], item: FilmingItem): void {
    const category = this.production.categories[categoryName];
    category.items.push(item);
  }

  // Удалить элемент из категории
  removeItem(categoryName: keyof FilmingProduction['categories'], itemId: number): void {
    const category = this.production.categories[categoryName];
    category.items = category.items.filter(item => item.id !== itemId);
  }

  // Обновить элемент в категории
  updateItem(categoryName: keyof FilmingProduction['categories'], itemId: number, updates: Partial<FilmingItem>): void {
    const category = this.production.categories[categoryName];
    const item = category.items.find(item => item.id === itemId);
    if (item) {
      Object.assign(item, updates);
    }
  }

  // Обновить бюджет категории
  updateCategoryBudget(categoryName: keyof FilmingProduction['categories'], newBudget: number): void {
    this.production.categories[categoryName].budget = newBudget;
  }

  // === МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ===

  // Получить все элементы определенной категории
  getCategoryItems(categoryName: keyof FilmingProduction['categories']): FilmingItem[] {
    return this.production.categories[categoryName].items;
  }

  // Получить все локации
  getLocations(): FilmingItem[] {
    return this.getCategoryItems('locations');
  }

  // Получить всех персонажей
  getCharacters(): FilmingItem[] {
    return this.getCategoryItems('characters');
  }

  // Получить всю массовку
  getExtras(): FilmingItem[] {
    return this.getCategoryItems('extras');
  }

  // Получить весь реквизит
  getProps(): FilmingItem[] {
    return this.getCategoryItems('props');
  }

  // Получить весь транспорт
  getTransportation(): FilmingItem[] {
    return this.getCategoryItems('transportation');
  }

  // Получить всех животных
  getAnimals(): FilmingItem[] {
    return this.getCategoryItems('animals');
  }

  // Получить все трюки
  getStunts(): FilmingItem[] {
    return this.getCategoryItems('stunts');
  }

  // Получить все элементы по статусу
  getItemsByStatus(status: FilmingItem['status']): FilmingItem[] {
    const allItems: FilmingItem[] = [];
    Object.values(this.production.categories).forEach(category => {
      allItems.push(...category.items.filter(item => item.status === status));
    });
    return allItems;
  }

  // === МЕТОДЫ ДЛЯ РАСЧЕТОВ ===

  // Получить общую стоимость по категории
  getCategoryTotal(categoryName: keyof FilmingProduction['categories']): number {
    const category = this.production.categories[categoryName];
    return category.items.reduce((sum, item) => sum + item.cost, 0);
  }

  // Получить потраченную сумму по категории
  getCategorySpent(categoryName: keyof FilmingProduction['categories']): number {
    const category = this.production.categories[categoryName];
    return category.items
      .filter(item => item.status === 'confirmed' || item.status === 'completed')
      .reduce((sum, item) => sum + item.cost, 0);
  }

  // Получить оставшийся бюджет по категории
  getCategoryRemaining(categoryName: keyof FilmingProduction['categories']): number {
    const category = this.production.categories[categoryName];
    return category.budget - this.getCategorySpent(categoryName);
  }

  // Получить общую стоимость всего производства
  getTotalCost(): number {
    let total = 0;
    Object.keys(this.production.categories).forEach(categoryName => {
      total += this.getCategoryTotal(categoryName as keyof FilmingProduction['categories']);
    });
    return total;
  }

  // Получить производство (для отображения)
  getProduction(): FilmingProduction {
    return this.production;
  }
}
