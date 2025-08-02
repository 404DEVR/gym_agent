import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// Calculate TDEE based on activity level
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  }
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2)
}

// Calculate target calories based on fitness goal
function calculateTargetCalories(tdee: number, goal: string): number {
  switch (goal.toLowerCase()) {
    case 'lose weight':
    case 'weight loss':
    case 'cut':
      return tdee - 500 // 500 calorie deficit
    case 'gain weight':
    case 'weight gain':
    case 'bulk':
      return tdee + 500 // 500 calorie surplus
    case 'build muscle':
    case 'muscle gain':
      return tdee + 300 // Moderate surplus
    case 'maintain weight':
    case 'maintenance':
    default:
      return tdee
  }
}

// Calculate macros (protein, carbs, fat)
function calculateMacros(targetCalories: number, goal: string) {
  let proteinRatio, carbRatio, fatRatio

  switch (goal.toLowerCase()) {
    case 'lose weight':
    case 'weight loss':
    case 'cut':
      proteinRatio = 0.35 // Higher protein for muscle preservation
      fatRatio = 0.25
      carbRatio = 0.40
      break
    case 'build muscle':
    case 'muscle gain':
    case 'bulk':
      proteinRatio = 0.30
      fatRatio = 0.25
      carbRatio = 0.45 // Higher carbs for energy
      break
    default:
      proteinRatio = 0.30
      fatRatio = 0.30
      carbRatio = 0.40
  }

  return {
    protein: (targetCalories * proteinRatio) / 4, // 4 calories per gram
    carbs: (targetCalories * carbRatio) / 4, // 4 calories per gram
    fat: (targetCalories * fatRatio) / 9 // 9 calories per gram
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Create a supabase client with the user's access token for RLS
    const token = authHeader.replace('Bearer ', '')
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabaseWithAuth
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: profile || null })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Create a new supabase client with the user's session
    const token = authHeader.replace('Bearer ', '')
    
    // Create a supabase client with the user's access token for RLS
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      age,
      weight,
      height,
      gender,
      activity_level,
      fitness_goal,
      dietary_restrictions = [],
      medical_conditions = [],
      experience_level = 'beginner',
      preferred_workout_days = 3,
      gym_access = true,
      equipment_available = []
    } = body

    // Validate required fields
    if (!age || !weight || !height || !gender || !activity_level || !fitness_goal) {
      return NextResponse.json(
        { error: 'Missing required fields: age, weight, height, gender, activity_level, fitness_goal' },
        { status: 400 }
      )
    }

    // Calculate macros
    const bmr = calculateBMR(weight, height, age, gender)
    const tdee = calculateTDEE(bmr, activity_level)
    const targetCalories = calculateTargetCalories(tdee, fitness_goal)
    const macros = calculateMacros(targetCalories, fitness_goal)



    const profileData = {
      user_id: user.id,
      age,
      weight,
      height,
      gender,
      activity_level,
      fitness_goal,
      dietary_restrictions,
      medical_conditions,
      experience_level,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target_calories: Math.round(targetCalories),
      target_protein: Math.round(macros.protein),
      target_carbs: Math.round(macros.carbs),
      target_fat: Math.round(macros.fat),
      preferred_workout_days,
      gym_access,
      equipment_available,
      updated_at: new Date().toISOString()
    }

    // Try to update existing profile first
    const { data: existingProfile } = await supabaseWithAuth
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
    if (existingProfile) {
      result = await supabaseWithAuth
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      result = await supabaseWithAuth
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single()
    }

    if (result.error) {
      console.error('Supabase error:', result.error)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    return NextResponse.json({
      profile: result.data,
      message: 'Profile saved successfully'
    })
  } catch (error) {
    console.error('Error saving user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Same as POST for now - handles both create and update
  return POST(request)
}