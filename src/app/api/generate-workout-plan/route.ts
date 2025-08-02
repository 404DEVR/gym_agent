import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { goal, bodyData, daysAvailable, preferences } = await request.json()

    if (!goal || !bodyData || !daysAvailable) {
      return NextResponse.json(
        { error: 'Goal, body data, and days available are required' },
        { status: 400 }
      )
    }

    const prompt = `
You are a professional fitness trainer and exercise physiologist. Create a detailed workout plan based on the following:

Goal: ${goal}
Body Data: ${JSON.stringify(bodyData)}
Days Available: ${daysAvailable}
Preferences: ${preferences || 'None specified'}

Please provide a JSON response with the following structure:
{
  "goal": "${goal}",
  "split": ["Day 1 name", "Day 2 name", "Day 3 name"],
  "days": ${daysAvailable},
  "exercises": [
    {
      "day": "Day name (e.g., Push Day, Pull Day, Legs)",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": number,
          "reps": "rep range (e.g., 8-12, 15-20)",
          "rest": "rest time (e.g., 60-90s, 2-3min)",
          "notes": "optional form tips or modifications"
        }
      ]
    }
  ]
}

Requirements:
- Create a workout split appropriate for ${daysAvailable} days per week
- Include compound and isolation exercises
- Provide proper rep ranges and rest times for the goal
- Include form tips and modifications where helpful
- Ensure the plan is progressive and sustainable
- Consider the user's experience level from body data

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
      throw new Error('Failed to generate workout plan')
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

    const workoutPlan = JSON.parse(jsonText)

    return NextResponse.json({ workoutPlan })
  } catch (error) {
    console.error('Error generating workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    )
  }
}