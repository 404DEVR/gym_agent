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
    exercises: {
      name: string
      sets: number
      reps: string
      rest: string
      notes?: string
    }[]
  }[]
  created_at?: string
  [key: string]: unknown
} 