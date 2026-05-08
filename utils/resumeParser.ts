
export interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string;
}

export const parseResume = (text: string): ParsedResume => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})/g;

    const skillKeywords = [
        'React', 'Node', 'TypeScript', 'JavaScript', 'Python', 'Java', 'SQL',
        'Supabase', 'PostgreSQL', 'Vite', 'CSS', 'HTML', 'AWS', 'Docker',
        'Machine Learning', 'AI', 'Full Stack', 'Backend', 'Frontend'
    ];

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];

    const foundSkills = skillKeywords.filter(skill =>
        new RegExp(`\\b${skill}\\b`, 'i').test(text)
    );

    // Simple heuristic for Name (usually near the top)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const name = lines[0] || 'Unknown';

    return {
        name,
        email: emails[0] || 'Not found',
        phone: phones[0] || 'Not found',
        skills: foundSkills,
        experience: "Detected automatically from content" // Placeholder for more complex logic
    };
};
