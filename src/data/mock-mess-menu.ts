// ==========================================
// HomeVerse - Mock Mess Menu Data
// ==========================================

import type { DayMenu } from '@/types';

export const weeklyMenu: DayMenu[] = [
  {
    day: 'Monday',
    date: '2026-06-30',
    meals: [
      { type: 'breakfast', time: '7:30 AM - 9:30 AM', items: [
        { name: 'Aloo Paratha', isVeg: true, calories: 300 },
        { name: 'Curd', isVeg: true, calories: 60 },
        { name: 'Pickle', isVeg: true, calories: 20 },
        { name: 'Tea / Coffee', isVeg: true, calories: 50 },
        { name: 'Bread & Butter', isVeg: true, calories: 180 },
      ], rating: 4.2, crowdLevel: 'moderate' },
      { type: 'lunch', time: '12:30 PM - 2:30 PM', items: [
        { name: 'Dal Tadka', isVeg: true, calories: 200 },
        { name: 'Jeera Rice', isVeg: true, calories: 250 },
        { name: 'Paneer Butter Masala', isVeg: true, calories: 350 },
        { name: 'Roti', isVeg: true, calories: 120 },
        { name: 'Salad', isVeg: true, calories: 40 },
        { name: 'Buttermilk', isVeg: true, calories: 45 },
      ], rating: 4.5, crowdLevel: 'high' },
      { type: 'snacks', time: '4:30 PM - 6:00 PM', items: [
        { name: 'Samosa', isVeg: true, calories: 260 },
        { name: 'Chai', isVeg: true, calories: 50 },
      ], rating: 4.0, crowdLevel: 'low' },
      { type: 'dinner', time: '7:30 PM - 9:30 PM', items: [
        { name: 'Chole', isVeg: true, calories: 280 },
        { name: 'Bhature', isVeg: true, calories: 300 },
        { name: 'Rice', isVeg: true, calories: 200 },
        { name: 'Raita', isVeg: true, calories: 80 },
        { name: 'Gulab Jamun', isVeg: true, calories: 150 },
      ], rating: 4.6, crowdLevel: 'high' },
    ],
  },
  {
    day: 'Tuesday',
    date: '2026-07-01',
    meals: [
      { type: 'breakfast', time: '7:30 AM - 9:30 AM', items: [
        { name: 'Poha', isVeg: true, calories: 250 },
        { name: 'Boiled Eggs', isVeg: false, calories: 140 },
        { name: 'Upma', isVeg: true, calories: 200 },
        { name: 'Tea / Coffee', isVeg: true, calories: 50 },
        { name: 'Fruits', isVeg: true, calories: 80 },
      ], rating: 4.1, crowdLevel: 'moderate' },
      { type: 'lunch', time: '12:30 PM - 2:30 PM', items: [
        { name: 'Rajma', isVeg: true, calories: 280 },
        { name: 'Steamed Rice', isVeg: true, calories: 240 },
        { name: 'Mixed Veg', isVeg: true, calories: 180 },
        { name: 'Roti', isVeg: true, calories: 120 },
        { name: 'Papad', isVeg: true, calories: 40 },
        { name: 'Lassi', isVeg: true, calories: 120 },
      ], rating: 4.3, crowdLevel: 'high' },
      { type: 'snacks', time: '4:30 PM - 6:00 PM', items: [
        { name: 'Bread Pakora', isVeg: true, calories: 280 },
        { name: 'Green Tea', isVeg: true, calories: 5 },
      ], rating: 3.8, crowdLevel: 'low' },
      { type: 'dinner', time: '7:30 PM - 9:30 PM', items: [
        { name: 'Butter Chicken', isVeg: false, calories: 400 },
        { name: 'Dal Makhani', isVeg: true, calories: 300 },
        { name: 'Naan', isVeg: true, calories: 260 },
        { name: 'Rice', isVeg: true, calories: 200 },
        { name: 'Ice Cream', isVeg: true, calories: 200 },
      ], rating: 4.8, crowdLevel: 'very-high' },
    ],
  },
  {
    day: 'Wednesday',
    date: '2026-07-02',
    meals: [
      { type: 'breakfast', time: '7:30 AM - 9:30 AM', items: [
        { name: 'Idli Sambhar', isVeg: true, calories: 220 },
        { name: 'Coconut Chutney', isVeg: true, calories: 50 },
        { name: 'Omelette', isVeg: false, calories: 160 },
        { name: 'Tea / Coffee', isVeg: true, calories: 50 },
        { name: 'Banana', isVeg: true, calories: 90 },
      ], rating: 4.4, crowdLevel: 'moderate' },
      { type: 'lunch', time: '12:30 PM - 2:30 PM', items: [
        { name: 'Kadhi Pakora', isVeg: true, calories: 280 },
        { name: 'Pulao', isVeg: true, calories: 280 },
        { name: 'Aloo Gobi', isVeg: true, calories: 200 },
        { name: 'Roti', isVeg: true, calories: 120 },
        { name: 'Salad', isVeg: true, calories: 40 },
        { name: 'Chaas', isVeg: true, calories: 40 },
      ], rating: 4.2, crowdLevel: 'moderate' },
      { type: 'snacks', time: '4:30 PM - 6:00 PM', items: [
        { name: 'Vada Pav', isVeg: true, calories: 290 },
        { name: 'Tea', isVeg: true, calories: 50 },
      ], rating: 4.5, crowdLevel: 'moderate' },
      { type: 'dinner', time: '7:30 PM - 9:30 PM', items: [
        { name: 'Palak Paneer', isVeg: true, calories: 320 },
        { name: 'Egg Curry', isVeg: false, calories: 280 },
        { name: 'Roti', isVeg: true, calories: 120 },
        { name: 'Rice', isVeg: true, calories: 200 },
        { name: 'Kheer', isVeg: true, calories: 180 },
      ], rating: 4.3, crowdLevel: 'high' },
    ],
  },
];

export const crowdPredictions = [
  { time: '7:30 AM', crowd: 20, label: 'Low' },
  { time: '8:00 AM', crowd: 45, label: 'Moderate' },
  { time: '8:30 AM', crowd: 70, label: 'High' },
  { time: '9:00 AM', crowd: 40, label: 'Moderate' },
  { time: '12:30 PM', crowd: 50, label: 'Moderate' },
  { time: '1:00 PM', crowd: 85, label: 'Very High' },
  { time: '1:30 PM', crowd: 75, label: 'High' },
  { time: '2:00 PM', crowd: 35, label: 'Moderate' },
  { time: '4:30 PM', crowd: 25, label: 'Low' },
  { time: '5:00 PM', crowd: 30, label: 'Low' },
  { time: '7:30 PM', crowd: 60, label: 'High' },
  { time: '8:00 PM', crowd: 90, label: 'Very High' },
  { time: '8:30 PM', crowd: 80, label: 'High' },
  { time: '9:00 PM', crowd: 45, label: 'Moderate' },
];
