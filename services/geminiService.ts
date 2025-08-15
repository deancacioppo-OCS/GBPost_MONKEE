
import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { RESEARCHER_SYSTEM_INSTRUCTION, PLANNER_SYSTEM_INSTRUCTION } from '../constants';
import type { ResearchSnapshot, PostPlan } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateImage(prompt: string | null): Promise<string | null> {
    if (!prompt) {
        return null;
    }
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        // Do not throw, just return null so the main flow can continue.
        return null;
    }
}


export async function generateResearchSnapshot(homepageUrl: string, gbpHint: string, locationId: string, selectedGbpAccountId: string): Promise<{ snapshot: ResearchSnapshot; groundingChunks: GroundingChunk[] | undefined; generatedImageUrl: string | null; }> {
  try {
    const userPrompt = `
      Analyze the following client details:
      homepage_url: ${homepageUrl}
      gbp_hint: "${gbpHint}"
      locationId: "${locationId}"
      selectedGbpAccountId: "${selectedGbpAccountId}"
    `;

    // Step 1: Generate the text-based snapshot
    const textResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: RESEARCHER_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = textResponse.text.trim();
    // Clean up potential code fences
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const snapshot = JSON.parse(jsonString) as ResearchSnapshot;
    
    const groundingChunks = textResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if(groundingChunks) {
        snapshot.citations = groundingChunks.map(chunk => ({
            uri: chunk.web?.uri ?? '',
            title: chunk.web?.title ?? 'Untitled'
        }));
    }

    // Step 2: Generate the image based on the prompt in the snapshot
    const generatedImageUrl = await generateImage(snapshot.generated_hero_image_prompt);

    return { snapshot, groundingChunks, generatedImageUrl };

  } catch (error) {
    console.error("Error generating research snapshot:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the AI's response as JSON. Please try again.");
    }
    throw new Error("An unexpected error occurred while generating the research snapshot.");
  }
}

async function generatePostPlanTextOnly(snapshot: ResearchSnapshot): Promise<PostPlan> {
    try {
        const userPrompt = `
            Here is the ResearchSnapshot:
            ${JSON.stringify(snapshot, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: PLANNER_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
            },
        });
        
        const text = response.text.trim();
        const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const postPlan = JSON.parse(jsonString) as PostPlan;
        return postPlan;

    } catch (error) {
        console.error("Error generating post plan text:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the AI's response for the post plan as JSON. Please try again.");
        }
        throw new Error("An unexpected error occurred while generating the post plan text.");
    }
}

export async function generatePostPlan(snapshot: ResearchSnapshot): Promise<PostPlan> {
    // Step 1: Generate the base plan with text and image prompts
    const plan = await generatePostPlanTextOnly(snapshot);

    // Step 2: Identify posts that need an image generated
    const postsToGenerate = plan.posts
        .map((post, index) => ({ post, index }))
        .filter(({ post }) => post.image.source === 'generated' && post.image.prompt);

    if (postsToGenerate.length === 0) {
        return plan; // No images to generate
    }

    // Step 3: Generate images concurrently
    const imagePromises = postsToGenerate.map(({ post }) => generateImage(post.image.prompt));
    
    try {
        const generatedImages = await Promise.all(imagePromises);

        // Step 4: Map generated images back to the plan
        const updatedPosts = [...plan.posts];
        postsToGenerate.forEach(({ index }, i) => {
            const imageUrl = generatedImages[i];
            if (imageUrl) {
                updatedPosts[index].image.url = imageUrl;
            }
        });

        return { ...plan, posts: updatedPosts };

    } catch (error) {
        console.error("Error during batch image generation:", error);
        // Return the plan without images if generation fails, so user still gets the text
        return plan;
    }
}
