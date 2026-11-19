export interface SpamAuditReport {
    score: number;
    status: "SAFE" | "WARNING" | "HIGH_RISK";
    flaggedKeywords: string[];
    linkCount: number;
    recommendations: string[];
    recommendation: string[];
}



const SPAM_TRIGGER_WORDS = [
    "100% free", "free trial", "guarantee", "guaranteed", "no risk",
    "act now", "limited time", "click here", "buy now", "cheap",
    "urgent", "double your", "earn money", "winner", "risk-free",
    "congratulations", "special promotion", "miracle", "unlimited",
];



// audits an outbound email against email deliveribility heruistics

export function auditEmailDeliverablity(subject: string, body: string): SpamAuditReport {
    const combined = `${subject} ${body}`.toLowerCase();
    const flaggedKeywords: string[] = [];
    const recommendation: string[] = [];
    let score = 100;


    // 1. check for spam trigger keywords
    for (const word of SPAM_TRIGGER_WORDS) {
        if (combined.includes(word)) {
            flaggedKeywords.push(word);
            score -= 15;
        }
    }

    if (flaggedKeywords.length > 0) {
        recommendation.push(`Remove high-risk spam keywords : [${flaggedKeywords.join(", ")}]`);
    }




    // 2. Check for Exclamation Mark Abuse
    const exclamationCount = (body.match(/!/g) || []).length;
    if (exclamationCount > 2) {
        score -= 10;
        recommendation.push(`Found ${exclamationCount} exclamation marks. Reduce to 0 to 1 for professional tone.`);

    }


    // 3. Check Link Count (Cold emails should have max 0 or 1 link)
    const linkMatches = body.match(/https?:\/\/[^\s]+/gi) || [];
    const linkCount = linkMatches.length;
    if (linkCount > 1) {
        score -= 20;
        recommendation.push(`Too many links (${linkCount}). Reduce to max 1 link to stay out of spam filters.`);
    }


    // 4. check for ALL-CAPS words
    const allCapsWords = body.match(/\b[A-Z]{3,}\b/g) || [];

    const dangerousCaps = allCapsWords.filter((w) => !["API", "CRM", "TCP", "DNS", "SDR", "LLM", "AWS", "GCP"].includes(w));

    if (dangerousCaps.length > 0) {
        score -= 15;
        recommendation.push(`Remove shouty ALL-CAPS words : [${dangerousCaps.join(", ")}]`);
    }


    // 5. Length Check (Optimal cold email length is 50-100 words)
    const wordCount = body.trim().split(/\s+/).length;
    if (wordCount > 130) {
        score -= 10;
        recommendation.push(`Body is ${wordCount} words. Concise emails under 100 words achieve 2x higher reply rates.`);
    }



    // Final score clamping
    score = Math.max(0, Math.min(100, score));
    const status = score >= 85 ? "SAFE" : (score >= 60 ? "WARNING" : "HIGH_RISK");



    const recList = recommendation.length > 0 ? recommendation : ["Email is clean, concise, and deliverability-safe"];

    return {
        score,
        status,
        flaggedKeywords,
        linkCount,
        recommendation: recList,
        recommendations: recList,
    }



}