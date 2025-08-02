import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { goal, ingredients, dietary_restrictions, target_calories } = await request.json()

    if (!goal || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Goal and ingredients array are required' },
        { status: 400 }
      )
    }

    // First try to use the RAG agent if available
    const ragApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    try {
      const ragResponse = await fetch(`${ragApiUrl}/meal-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          ingredients,
          dietary_restrictions: dietary_restrictions || [],
          target_calories
        })
      })

      if (ragResponse.ok) {
        const ragData = await ragResponse.json()
        console.log('Using RAG agent for meal plan generation')
        return NextResponse.json(ragData)
      }
    } catch (ragError) {
      console.log('RAG agent not available, falling back to Gemini API:', ragError)
    }

    // Fallback to direct Gemini API call
    const prompt = `
You are a professional nutritionist and chef with access to a comprehensive food database. Create a detailed daily meal plan based on the following:

Goal: ${goal}
Available Ingredients: ${ingredients.join(', ')}
${dietary_restrictions && dietary_restrictions.length > 0 ? `Dietary Restrictions: ${dietary_restrictions.join(', ')}` : ''}
${target_calories ? `Target Daily Calories: ${target_calories}` : ''}

Please provide a JSON response with the following structure:
{
  "goal": "${goal}",
  "ingredients": ${JSON.stringify(ingredients)},
  "meals": [
    {
      "name": "Meal name",
      "type": "breakfast|lunch|dinner|snack",
      "calories": number,
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
      "fiber": number (in grams),
      "ingredients_used": ["ingredient1", "ingredient2"],
      "steps": ["Step 1", "Step 2", "Step 3"],
      "prep_time": number (in minutes),
      "cook_time": number (in minutes),
      "tips": "Optional cooking tips or modifications"
    }
  ]
}

Requirements:
- Create 3-4 meals (breakfast, lunch, dinner, and optionally a snack)
- Use primarily the provided ingredients
- Ensure meals align with the fitness goal
- Respect dietary restrictions if provided
- Provide realistic macro calculations based on actual food nutrition data
- Include detailed cooking steps for each meal
- Add prep and cook times for meal planning
- Include helpful cooking tips where relevant
- Make sure total daily calories match target if provided, otherwise appropriate for the goal

Respond ONLY with valid JSON, no additional text.
    `

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate meal plan')
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // Clean up the response to extract JSON
    let jsonText = generatedText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    const mealPlan = JSON.parse(jsonText)

    return NextResponse.json({ mealPlan })
  } catch (error) {
    console.error('Error generating meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}