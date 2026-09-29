import { normalizeState, normalizeTodo } from '../services/normalize'
import type { Todo } from '../types/todo'
import { getDueStatus, getLocalDateString, getSevenDayRange, isOverdue, parseLocalDate } from './date'
import { getTodoOccurrencesForDate } from './occurrences'
import {
  dueLabel,
  formatRecurrence,
  getWeekday,
  isTodoCompletedForDate,
  isTodoScheduledForDate,
  toggleTodoCompletionForDate,
} from './recurrence'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function todo(partial: Partial<Todo> & Pick<Todo, 'text'>): Todo {
  return {
    id: partial.id ?? partial.text,
    text: partial.text,
    startDate: partial.startDate ?? '2026-09-01',
    startTime: partial.startTime,
    endTime: partial.endTime,
    completed: partial.completed ?? false,
    createdAt: partial.createdAt ?? '2026-09-01T00:00:00.000Z',
    important: partial.important ?? false,
    urgent: partial.urgent ?? false,
    dueDate: partial.dueDate,
    recurrence: partial.recurrence ?? { type: 'none' },
    completedDates: partial.completedDates ?? [],
    listId: partial.listId,
  }
}

export function runSelfCheck() {
  const monday = '2026-09-28'
  const tuesday = '2026-09-29'
  const wednesday = '2026-09-30'
  const saturday = '2026-10-03'
  const sunday = '2026-10-04'
  const nextMonday = '2026-10-05'

  assert(getWeekday(tuesday) === 'tuesday', 'Sep 29 2026 is Tuesday')
  assert(getWeekday(nextMonday) === 'monday', 'Oct 5 2026 is Monday')
  const range = getSevenDayRange(tuesday)
  assert(range[0] === tuesday && range[6] === nextMonday, 'seven days start today and end six days later')
  assert(range.map(getWeekday).join() === 'tuesday,wednesday,thursday,friday,saturday,sunday,monday', 'range is not Monday-first')

  const octoberFifth = parseLocalDate('2026-10-05')
  assert(octoberFifth?.getDate() === 5 && octoberFifth.getMonth() === 9, 'due date stays Oct 5 locally')
  assert(getLocalDateString(octoberFifth!) === '2026-10-05', 'local date string round trip')
  assert(isOverdue('2026-10-04', false, '2026-10-05'), 'past due date is overdue')
  assert(!isOverdue('2026-10-04', true, '2026-10-05'), 'completed todo is not overdue')

  const groceries = todo({ text: 'Buy groceries', startDate: tuesday })
  assert(isTodoScheduledForDate(groceries, tuesday), 'one-off appears on its start date')
  assert(!isTodoScheduledForDate(groceries, wednesday), 'one-off does not appear the next day')

  const dentist = todo({ text: 'Dentist', startDate: '2026-10-02', startTime: '14:30' })
  assert(isTodoScheduledForDate(dentist, '2026-10-02'), 'future todo appears on Friday')
  assert(!isTodoScheduledForDate(dentist, tuesday), 'future todo is not today')

  const vitamins = todo({ id: 'vitamins', text: 'Take vitamins', startDate: tuesday, recurrence: { type: 'daily' } })
  assert(!isTodoScheduledForDate(vitamins, monday), 'daily does not appear before its start date')
  assert(range.every((date) => isTodoScheduledForDate(vitamins, date)), 'daily appears on every displayed day')
  toggleTodoCompletionForDate(vitamins, tuesday)
  assert(isTodoCompletedForDate(vitamins, tuesday), 'daily is complete on Tuesday')
  assert(!isTodoCompletedForDate(vitamins, wednesday), 'daily is incomplete on Wednesday')
  assert(vitamins.completed === false, 'daily completion does not set the permanent flag')
  assert(vitamins.completedDates.length === 1, 'one completion date is stored')

  const football = todo({
    text: 'Football',
    startDate: tuesday,
    startTime: '18:00',
    recurrence: { type: 'weekdays', days: ['tuesday'] },
  })
  assert(isTodoScheduledForDate(football, tuesday), 'weekly Tuesday includes the start date')
  assert(!isTodoScheduledForDate(football, wednesday), 'weekly Tuesday skips Wednesday')
  assert(formatRecurrence(football.recurrence) === 'Weekly', 'one weekday is labeled Weekly')

  const trash = todo({
    text: 'Put out trash',
    startDate: tuesday,
    recurrence: { type: 'weekdays', days: ['monday'] },
  })
  assert(!isTodoScheduledForDate(trash, monday), 'Monday todo does not appear before the start date')
  assert(isTodoScheduledForDate(trash, nextMonday), 'Monday todo appears on the upcoming Monday')
  assert(!range.slice(0, 6).some((date) => isTodoScheduledForDate(trash, date)), 'Monday todo is absent until Monday')

  const family = todo({
    text: 'Family activity',
    startDate: tuesday,
    recurrence: { type: 'weekdays', days: ['sunday', 'saturday'] },
  })
  assert(formatRecurrence(family.recurrence) === 'Weekend', 'weekend label')
  assert(isTodoScheduledForDate(family, saturday) && isTodoScheduledForDate(family, sunday), 'weekend days')
  assert(!isTodoScheduledForDate(family, tuesday), 'weekend is not Tuesday')

  const presentation = todo({
    text: 'Prepare presentation',
    startDate: '2026-10-01',
    dueDate: '2026-10-02',
  })
  assert(isTodoScheduledForDate(presentation, '2026-10-01'), 'presentation appears on its start date')
  assert(isTodoScheduledForDate(presentation, '2026-10-02'), 'unfinished todo stays visible through its due date')
  assert(!isTodoScheduledForDate(presentation, '2026-10-03'), 'todo does not appear after its due date')
  assert(
    !isTodoScheduledForDate({ ...presentation, completed: true }, '2026-10-02'),
    'finished todo leaves the days after its start date',
  )
  assert(isTodoScheduledForDate({ ...presentation, completed: true }, '2026-10-01'), 'finished todo stays on its start date')
  assert(dueLabel(presentation.dueDate, false, presentation.startDate) === 'Due tomorrow', 'due the next day reads as tomorrow')

  const names = new Map([['activity', 'Activity']])
  const timed = todo({ id: 'timed', text: 'Football', startDate: tuesday, startTime: '18:00', createdAt: '2026-09-29T10:00:00.000Z' })
  const untimed = todo({ id: 'untimed', text: 'Buy groceries', startDate: tuesday, createdAt: '2026-09-29T09:00:00.000Z', listId: 'activity' })
  const later = todo({ id: 'later', text: 'Call', startDate: tuesday, startTime: '09:00', createdAt: '2026-09-29T11:00:00.000Z' })
  const day = getTodoOccurrencesForDate([untimed, timed, later], tuesday, names)
  assert(day.map((item) => item.todo.id).join() === 'later,timed,untimed', 'timed todos sort by time, then untimed')
  assert(day[2]?.listName === 'Activity', 'category name is attached to the occurrence')
  assert(new Set([timed.id, untimed.id, later.id]).size === 3, 'occurrences do not clone todos')

  const carried = todo({ id: 'old', text: 'Old open todo', startDate: monday, completed: false })
  const todayItems = getTodoOccurrencesForDate([carried, groceries], tuesday, names, tuesday)
  assert(todayItems.some((item) => item.todo.id === 'old' && item.carriedOver), 'incomplete past one-off still appears today')
  assert(!getTodoOccurrencesForDate([carried], wednesday, names, tuesday).some((item) => item.todo.id === 'old'), 'carried todo is only on today')

  const createdAt = '2026-01-01T12:00:00.000Z'
  const legacy = normalizeTodo({
    id: 'legacy-1',
    text: 'Old todo',
    completed: true,
    createdAt,
  })
  assert(legacy?.completed === true, 'legacy completed flag is kept')
  assert(legacy?.important === false && legacy.urgent === false, 'legacy priority defaults to false')
  assert(legacy?.recurrence.type === 'none', 'legacy recurrence defaults to none')
  assert(legacy?.startDate === getLocalDateString(new Date(createdAt)), 'legacy start date falls back to the created day')
  assert(legacy?.completedDates.length === 0, 'legacy completed dates default to empty')

  const fromDue = normalizeTodo({
    id: 'legacy-due',
    text: 'Submit report',
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    dueDate: tuesday,
  })
  assert(fromDue?.startDate === tuesday && fromDue.dueDate === tuesday, 'missing start date uses the due date')

  const state = normalizeState({
    lists: [
      {
        id: 'list-1',
        name: 'Personal',
        important: true,
        todos: [
          {
            id: 'legacy-1',
            text: 'Take vitamins',
            completed: false,
            createdAt: '2026-09-28T12:00:00.000Z',
            important: true,
            recurrence: { type: 'daily' },
            completedDates: [monday],
          },
        ],
      },
    ],
    selectedListId: 'list-1',
    view: 'today',
  })
  assert(state.lists.length === 1 && state.lists[0].important === true, 'legacy list is kept')
  assert(!('todos' in state.lists[0]), 'categories no longer nest todos')
  assert(state.todos.length === 1 && state.todos[0].listId === 'list-1', 'legacy todo keeps its category')
  assert(state.todos[0].completedDates[0] === monday, 'legacy completion dates are kept')
  assert(state.todos[0].recurrence.type === 'daily', 'legacy recurrence is kept')
  assert(state.selectedListId === null, 'old list selection opens the full week')
}

runSelfCheck()
