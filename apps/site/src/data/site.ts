export const REPO = 'https://github.com/charlitomecarez/my-app';
export const CONTRIBUTING = `${REPO}/blob/main/CONTRIBUTING.md`;
export const LICENSE = `${REPO}/blob/main/LICENSE`;

export type Fact = {
  id: string;
  chip: string;
  say: string;
  row: string;
  badge: string;
  tone: 'watch' | 'plain';
};

// The hero hook: chips the visitor taps to build their own Home sentence.
export const facts: Fact[] = [
  { id: 'meralco', chip: 'I pay Meralco', say: 'Pay Meralco by Friday.', row: 'Meralco bill', badge: 'Due soon', tone: 'watch' },
  { id: 'vehicle', chip: 'I drive or ride', say: 'Your vehicle is 120 km from an oil change.', row: 'Oil change', badge: '120 km', tone: 'watch' },
  { id: 'gcash', chip: 'I use GCash', say: 'GCash has ₱3,410 left for the week.', row: 'GCash', badge: '₱3,410', tone: 'plain' },
  { id: 'gym', chip: 'I go to the gym', say: 'Leg day is at 6:00 PM.', row: 'Leg day', badge: '6:00 PM', tone: 'plain' },
];

export const demoLines = {
  first: 'Pay Meralco by Friday. Your vehicle is 120 km from an oil change.',
  second: 'Meralco is paid. Only the oil change needs you now.',
};

export type Dish = { id: number; name: string; price: number };

export const dishes: Dish[] = [
  { id: 0, name: 'Adobong sitaw', price: 85 },
  { id: 1, name: 'Ginisang monggo', price: 60 },
  { id: 2, name: 'Pinakbet', price: 75 },
  { id: 3, name: 'Tortang talong', price: 55 },
  { id: 4, name: 'Sinigang na isda', price: 95 },
  { id: 5, name: 'Ginataang kalabasa', price: 70 },
  { id: 6, name: "Tokwa't baboy", price: 90 },
  { id: 7, name: 'Lumpiang gulay', price: 65 },
  { id: 8, name: 'Chopsuey', price: 89 },
  { id: 9, name: 'Paksiw na bangus', price: 98 },
  { id: 10, name: 'Laing', price: 80 },
  { id: 11, name: 'Bistek tagalog', price: 99 },
  { id: 12, name: 'Ginisang upo', price: 50 },
  { id: 13, name: 'Misua with patola', price: 45 },
];

export const limits = [60, 80, 99];

export type Group = {
  title: string;
  field: 'daily' | 'people' | 'home' | 'records';
  modules: { name: string; key?: boolean }[];
};

// Grouped the way the app's More tab groups them. `key` marks a module that needs a free key.
export const groups: Group[] = [
  {
    title: 'Daily life',
    field: 'daily',
    modules: [
      { name: 'Habits' }, { name: 'Gym' }, { name: 'Journal' }, { name: 'Health' }, { name: 'Alarms' },
      { name: 'Ulam', key: true }, { name: 'Sports', key: true }, { name: 'Weather' }, { name: 'News' },
    ],
  },
  { title: 'People', field: 'people', modules: [{ name: 'People' }, { name: 'Debts' }, { name: 'Inbox', key: true }] },
  { title: 'Home and plans', field: 'home', modules: [{ name: 'Inventory' }, { name: 'Shopping' }, { name: 'Travel' }] },
  {
    title: 'Records and work',
    field: 'records',
    modules: [{ name: 'Find a work', key: true }, { name: 'Documents' }, { name: 'Vault' }, { name: 'Content' }],
  },
];
