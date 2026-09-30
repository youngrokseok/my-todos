import type { Weekday } from '../types/todo'

export type Locale = 'en' | 'de'

export type Messages = {
  locale: Locale
  /** BCP 47 tag used for month and weekday dates. */
  dateLocale: string
  languageName: string
  appName: string
  plannerSubtitle: string
  planner: string
  language: string
  openPlanner: string
  closePlanner: string
  days: string
  calendar: string
  previousMonth: string
  nextMonth: string
  today: string
  tomorrow: string
  categories: string
  showAll: string
  todoCount: (count: number) => string
  rename: string
  renameCategory: string
  save: string
  cancel: string
  delete: string
  remove: string
  important: string
  urgent: string
  markImportant: string
  markUrgent: string
  removeImportant: (name: string) => string
  markAsImportant: (name: string) => string
  removeUrgent: (name: string) => string
  markAsUrgent: (name: string) => string
  edit: string
  editTodo: string
  editNamed: (text: string) => string
  deleteNamed: (text: string) => string
  renameNamed: (name: string) => string
  removeNamed: (name: string) => string
  addTodo: string
  whatNeedsToBeDone: string
  noTodosToday: string
  noTodosDay: string
  startTime: string
  endTime: string
  none: string
  due: string
  noDueDate: string
  clear: string
  chooseDate: string
  repeat: string
  repeatDays: string
  doesNotRepeat: string
  daily: string
  weekend: string
  customDays: string
  everyDay: string
  saturdayAndSunday: string
  selectAtLeastOneDay: string
  category: string
  weekdayShort: Record<Weekday, string>
  weekdayLong: Record<Weekday, string>
  endsAt: (time: string) => string
  startedOn: (date: string) => string
  weekly: string
  dueToday: string
  dueTomorrow: string
  dueOn: (date: string) => string
  overdueOn: (date: string) => string
  deleteTodoTitle: string
  deleteTodo: string
  deleteTodoMessage: (text: string) => string
  deleteRecurringMessage: (text: string) => string
  removeCategoryTitle: string
  removeCategory: string
  removeCategoryMessage: (name: string) => string
  dismissDialog: string
  markComplete: (text: string) => string
  markCompleteOn: (text: string, date: string) => string
}
