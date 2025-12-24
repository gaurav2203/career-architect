import { CoverLetter } from '../types';

export const generateCoverLetterAI = async (input: CoverLetter): Promise<any> => {
    try {
        const response = await fetch('http://localhost:8003/cover-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Portfolio generation error:", error);
        return {};
    }
};