// my-app/app/api/users/suggest-doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/config/OpenAiModel'; // Assuming my-app/config/OpenAiModel.ts
import { AIDoctorAgents } from '@/shared/list'; // Adjusted for my-app/shared/list.tsx
import { type DoctorAgent } from "@/config/schema"; // Adjusted for my-app/config/schema.ts

export async function POST(req: NextRequest) {
  const { notes }: { notes: string } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'qwen/qwen3-30b-a3b:free',
      messages: [
        {
          role: 'system',
          content: `You are an assistant that suggests AI doctors based on user symptoms.
            Here is a list of available AI doctors and their details. Only suggest doctors from this list by their 'id':
            ${JSON.stringify(AIDoctorAgents.map(d => ({
                id: d.id,
                specialist: d.specialist,
                description: d.description,
                agentPrompt: d.agentPrompt,
                voiceId: d.voiceId,
            })))}
            
            Based on the user's notes, suggest up to 2 most relevant doctor(s) as a JSON array.
            For each suggested doctor, **only provide their 'id'**.
            Example response: [{"id": 1}, {"id": 5}]
            Do NOT include 'specialist', 'description', 'image', 'agentPrompt', or 'voiceId' in your response JSON.
            Do NOT add any extra explanation or text outside the JSON array. Only a valid JSON array.`,
        },
        {
          role: 'user',
          content: `User Notes/Symptoms: ${notes}. Suggest the most suitable doctor(s) from the list as a JSON array of up to 2 objects, each containing only their 'id'.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const rawResp = completion.choices[0].message.content;

    const cleaned = rawResp
      ?.trim()
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    if (!cleaned) {
      throw new Error('No response from AI to parse.');
    }
    
    let aiSuggestedIds: { id: number }[] = [];
    try {
        const parsedResponse = JSON.parse(cleaned);
        if (Array.isArray(parsedResponse)) {
            aiSuggestedIds = parsedResponse.filter((item: any) => typeof item.id === 'number');
        } else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
            const potentialArrayKeys = ['suggestions', 'doctors', 'recommended_doctors'];
            for (const key of potentialArrayKeys) {
                if (Array.isArray(parsedResponse[key])) {
                    aiSuggestedIds = parsedResponse[key].filter((item: any) => typeof item.id === 'number');
                    break;
                }
            }
            if (aiSuggestedIds.length === 0 && typeof parsedResponse.id === 'number') {
                aiSuggestedIds = [{ id: parsedResponse.id }];
            }
        }
    } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", cleaned, parseError);
        throw new Error(`Invalid JSON response from AI. Raw: ${rawResp}`);
    }

    const finalSuggestedDoctors: DoctorAgent[] = [];

    for (const suggestion of aiSuggestedIds) {
      const matchedDoctor = AIDoctorAgents.find(
        (doc) => doc.id === suggestion.id
      );
      if (matchedDoctor) {
        finalSuggestedDoctors.push({
          id: matchedDoctor.id,
          specialist: matchedDoctor.specialist,
          description: matchedDoctor.description,
          image: matchedDoctor.image,
          agentPrompt: matchedDoctor.agentPrompt,
          voiceId: matchedDoctor.voiceId,
        });
      }
    }

    if (finalSuggestedDoctors.length === 0) {
        const defaultDoctor = AIDoctorAgents.find(d => d.specialist === "General Physician") || AIDoctorAgents[0];
        if (defaultDoctor) {
            finalSuggestedDoctors.push({
                id: defaultDoctor.id,
                specialist: defaultDoctor.specialist,
                description: defaultDoctor.description,
                image: defaultDoctor.image,
                agentPrompt: defaultDoctor.agentPrompt,
                voiceId: defaultDoctor.voiceId,
            });
        }
    }

    return NextResponse.json(finalSuggestedDoctors);
  } catch (e: any) {
        console.error("API error in /api/users/suggest-doctors:", e);
        return NextResponse.json({
            success: false,
            message: (e instanceof Error ? e.message : 'Something went wrong during doctor suggestion.'),
            error: e.message || String(e)
        }, { status: 500 });
    }
}