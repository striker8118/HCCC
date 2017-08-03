import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

export interface Recipe {
  id: string;
  name: string;
  description: string;
}

export interface WeeklyMenuItem {
  id: string;
  date: Date;
  recipe: Recipe;
  displayDate: string;
  dayOfTheWeek: string;
}

@Injectable()
export class RecipeDataProvider {
  weeklyMenuItems: Observable<WeeklyMenuItem[]>
  private _weeklyMenuItems: BehaviorSubject<WeeklyMenuItem[]>;
  private dataStore: {
    weeklyMenuItems: WeeklyMenuItem[]
  };

  constructor(private http: Http) {
    this.dataStore = { weeklyMenuItems: [] };
    this._weeklyMenuItems = <BehaviorSubject<WeeklyMenuItem[]>>new BehaviorSubject([]);
    this.weeklyMenuItems = this._weeklyMenuItems.asObservable();
  }
  
  loadWeeklyMenuItems(date: Date) {

    var formattedToday = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();

    this.http.get('http://localhost:9000/weekly-menus/' + formattedToday).map(res => res.json()).subscribe(data => {

      this.dataStore.weeklyMenuItems = data;
      this.dataStore.weeklyMenuItems.forEach((wmi) => this.formatWeeklyMenuItem(wmi));

      this._weeklyMenuItems.next(Object.assign({}, this.dataStore).weeklyMenuItems);

    }, error => console.log('Could not load weekly menu items.'));
  }

  createWeeklyMenuItem(wmi: WeeklyMenuItem) {

    console.log('Adding recipe to weekly menu:');
    console.log(wmi);

    let postData = {
      date: (wmi.date.getMonth() + 1) + '-' + wmi.date.getDate() + '-' + wmi.date.getFullYear(),
      _recipe: wmi.recipe.id
    }

    this.http.post('http://localhost:9000/weekly-menus/', postData).map(res => res.json()).subscribe(data => {
      
      this.formatWeeklyMenuItem(wmi);
      this.dataStore.weeklyMenuItems.push(wmi);
      this._weeklyMenuItems.next(Object.assign({}, this.dataStore).weeklyMenuItems);

    }, error => console.log('Could not create weekly menu item.'));
  }

  removeWeeklyMenuItem(wmiId: string) {
    this.http.delete(`http://localhost:9000/weekly-menus/${wmiId}`).subscribe(response => {
      
      this.dataStore.weeklyMenuItems.forEach((t, i) => {
        if (t.id === wmiId) { this.dataStore.weeklyMenuItems.splice(i, 1); }
      });

      this._weeklyMenuItems.next(Object.assign({}, this.dataStore).weeklyMenuItems);

    }, error => console.log('Could not delete todo.'));
  }

  private formatWeeklyMenuItem(wmi: WeeklyMenuItem) {

    wmi.date = new Date(wmi.date);

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    console.log('WMI:');
    console.log(wmi);

    let day = wmi.date.getDay();
    if (day >= 7) day = day - 7;

    wmi.dayOfTheWeek = days[day];
    wmi.displayDate = (wmi.date.getMonth() + 1) + '/' + (wmi.date.getDate());
  }
}

export interface ShoppingListItem {
  id: string;
  description: string;
}

@Injectable()
export class ShoppingListDataProvider {
  shoppingListItems: Observable<ShoppingListItem[]>
  private _shoppingListItems: BehaviorSubject<ShoppingListItem[]>;
  private dataStore: {
    shoppingListItems: ShoppingListItem[]
  };

  constructor(private http: Http) {
    this.dataStore = { shoppingListItems: [] };
    this._shoppingListItems = <BehaviorSubject<ShoppingListItem[]>>new BehaviorSubject([]);
    this.shoppingListItems = this._shoppingListItems.asObservable();
  }
  
  load() {

    this.http.get('http://localhost:9000/shopping-list-items/').map(res => res.json()).subscribe(data => {

      this.dataStore.shoppingListItems = data;

      this._shoppingListItems.next(Object.assign({}, this.dataStore).shoppingListItems);

    }, error => console.log('Could not load shopping list items.'));
  }

  create(sli: ShoppingListItem) {

    console.log('Adding shopping list item:');
    console.log(sli);

    this.http.post('http://localhost:9000/shopping-list-items/', sli).map(res => res.json()).subscribe(data => {
      
      this.dataStore.shoppingListItems.push(sli);

      this._shoppingListItems.next(Object.assign({}, this.dataStore).shoppingListItems);

    }, error => console.log('Could not create weekly menu item.'));
  }

  createFromList(items: ShoppingListItem[]) {

    this.http.post('http://localhost:9000/shopping-list-items/', items).map(res => res.json()).subscribe(data => {
      
      this.dataStore.shoppingListItems.push(data);

      this._shoppingListItems.next(Object.assign({}, this.dataStore).shoppingListItems);

    }, error => console.log('Could not create weekly menu item.'));
  }

  remove(sliId: string) {
    this.http.delete(`http://localhost:9000/shopping-list-items/${sliId}`).subscribe(response => {
      
      this.dataStore.shoppingListItems.forEach((t, i) => {
        if (t.id === sliId) { this.dataStore.shoppingListItems.splice(i, 1); }
      });

      this._shoppingListItems.next(Object.assign({}, this.dataStore).shoppingListItems);

    }, error => console.log('Could not delete todo.'));
  }
}