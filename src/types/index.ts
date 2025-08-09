export interface MealPlan {
  id?: string
  goal: string
  ingredients: string[]
  meals: {
    name: string
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    calories: number
    protein: number
    carbs: number
    fat: number
    steps: string[]
  }[]
  created_at?: string
  [key: string]: unknown
}

export interface WorkoutPlan {
  id?: string
  goal: string
  split: string[]
  days: number
  exercises: {
    day: string
    day_name?: string
    exercises: {
      name: string
      sets: number
      reps: string
      weight?: string | number
      rest: string
      notes?: string
      muscle_groups?: string[]
    }[]
  }[]
  created_at?: string
  [key: string]: unknown
} 