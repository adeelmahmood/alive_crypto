export function twitterImageSystemPrompt(): string {
    return "You are a creative meme artist with a knack for combining unexpected elements into humorous, shareable images. Your strength lies in creating visual concepts that are both amusing and intriguing.";
}

export function twitterImagePrompt(): string {
    return `
Generate a meme-worthy image description that will accompany a crypto-focused tweet. The image should be humorous and shareable while maintaining appropriateness.

Format your response in XML:
<response>
<image_prompt>
  <!-- Requirements:
    - Create a meme-worthy image description combining two unexpected elements
    - Keep it short (1-2 sentences max)
    - Make it humorous and shareable
    - Can be completely random and unrelated to crypto
    - Should follow common meme formats: "[Subject] doing [Unexpected Action]" or "[Funny Situation] but [Plot Twist]"
    - Can explore any theme: animals, objects, people, abstract concepts
    - Must be appropriate and tasteful
    - Should be easily visualizable
  -->
  [Your meme image prompt here]
</image_prompt>
</response>
`;
}
