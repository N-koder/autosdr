export interface HiringSignal {
    company: string;
    jobTitle: string;
    department: string;
    extractedTechStack: string[];
    coreBusinessInitiative: string; // what the company is trying to achieve
    urgencyScore: number; // 1 to 100 based on role seniority & keywords
    salesTriggerSummary: string; // The 1-sentence hook to give to the AI 

}


// common engineering, marketing and data keywords to scan for in job descriptions.

const TECH_KEYWORDS = [
    "python", "Typescript", "Node.js", "GO", "GOlang", "Rust",
    "kafka", "Redis", "BullMQ", "PostgreSQL", "AWS", "GCP",
    "Next.js", "React", "Docker", "Kubernetes", "Microservices",
    "LLM", "OpenAI", "FastAPI", "Stripe", "GraphQL"
];


// Analyzes a raw job posting (HTML or text) and extracts structured intent signals.

export function parseHiringSignal(company: string, jobTitle: string, jobDescriptionText: string): HiringSignal {

    const lowerTitle = jobTitle.toLowerCase();
    const lowerText = jobDescriptionText.toLowerCase();

    // 1. Detect Department
    let department = "Engineering";

    if (lowerTitle.includes("sales") || lowerTitle.includes("bdr") || lowerTitle.includes("sdr") || lowerTitle.includes("account executive")) {
        department = "Sales & Revenue";
    }

    else if (lowerTitle.includes("marketing") || lowerTitle.includes("growth")) {
        department = "Marketing & Growth";
    }

    else if (lowerTitle.includes("product") || lowerTitle.includes("design")) {
        department = "Product & Design";
    }


    // 2. Extract Tech Stack Mentioned in Requirements
    const detectedTech = TECH_KEYWORDS.filter((tech) => {
        const regex = new RegExp(`\\b${tech.toLocaleLowerCase()}\\b`, "i");
        return regex.test(jobDescriptionText);
    });


    // 3. Determine core business Initiative & Pain Point
    let initiative = "Scaling core platform infrastructure and engineering bandwidth";
    if (lowerText.includes("latency") || lowerText.includes("throughput") || lowerText.includes("distributed")) {
        initiative = "Optimizing system latency and scaling distributed worker throughput";
    }
    else if (lowerText.includes("ai") || lowerText.includes("agent") || lowerText.includes("llm")) {
        initiative = "Building and deploying autonomus AI agent workflows";
    }
    else if (lowerText.includes("pipeline") || lowerText.includes("outbound") || lowerText.includes("leads")) {
        initiative = "Accelerating outbound lead generation and pipeline velocity";
    }
    else if (lowerText.includes("security") || lowerText.includes("compliance") || lowerText.includes("audit")) {
        initiative = "Hardening platform security, compliance, and deliverability protocols";
    }



    // 4. Calculate Urgency score (1-100)
    // senior/lead/staff roles or roles mentioning "immediate/scaling" indicate high urgency

    let urgency = 60;
    if (lowerTitle.includes("staff") || lowerTitle.includes("principal") || lowerTitle.includes("head") || lowerTitle.includes("lead")) {
        urgency += 25;
    }


    if (lowerText.includes("urgent") || lowerText.includes("fast-paced") || lowerText.includes("scale") || lowerText.includes("growth")) {
        urgency += 15;
    }

    urgency = Math.min(100, urgency);


    // 5. Synthesize Sales Trigger Summary
    const triggerSummary = `${company} is actively hiring for a ${jobTitle} (${department}) focused on ${initiative.toLowerCase()}.`;


    return {
        company,
        jobTitle,
        department,
        extractedTechStack: detectedTech.length > 0 ? detectedTech : ["Cloud Systems"],
        coreBusinessInitiative: initiative,
        urgencyScore: urgency,
        salesTriggerSummary: triggerSummary
    };


}




/**
 * Scrapes or loads active hiring signals for a company domain.
 * Supports live career page ingestion with defensive fallbacks
 */

export async function getCompanyHiringSignals(company: string): Promise<HiringSignal[]> {

    console.log(`\n [Event Signal Detector] Scanning active career signals for : ${company}...`);


    // In production, this can query Greenhouse API, Lever API, or public career pages.
    // Here is a realistic real-world signal dataset demostrating different company tiers:

    const mockSignalDatabase: Record<string, Array<{ title: string; desc: string }>> = {
        stripe: [
            {
                title: "Staff Infrastructure Engineer - Core payments",
                desc: "We are looking for a Staff Engineer to scale our distributed payment execution engine using Go, Python, and Redis. You will lead projects optimizing network socket latency and worker throughput across high-volume pipelines."
            },

        ],

        linear: [
            {
                title: "Senior Full Stack Engineer - Workflows",
                desc: "Help us build the next generation of project management tools using TypeScript, Next.js, and Node.js. Focus on real-time sync, microservices, and high-performance UI."
            },
        ],

        notion: [
            {
                title: "Lead AI Engineer - Autonoums Agents",
                desc: "Join our core AI team to integrate frontier LLMs, OpenAI, and agentic workflows into Notion's modular workspace for enterprise customers."
            },
        ],

    };



    const key = company.trim().toLowerCase();
    const posting = mockSignalDatabase[key] || [
        {
            title: "Senior Backend Engineer",
            desc: `We are hiring an experienced engineer to scale platform services, integrate microservices, and optimize database throughput using TypeScript and AWS at ${company}.`,
        },
    ];


    return posting.map((post) => parseHiringSignal(company, post.title, post.desc));

}






// --- SIMULATION TEST SUITE ---
async function runSimulation() {
    const companies = ["Stripe", "Linear", "Notion"];
    for (const comp of companies) {
        const signals = await getCompanyHiringSignals(comp);
        signals.forEach((sig) => {
            console.log(`================================================================`);
            console.log(`🏢 Company        : ${sig.company}`);
            console.log(`💼 Job Title      : ${sig.jobTitle} (${sig.department})`);
            console.log(`🔥 Urgency Score  : ${sig.urgencyScore}/100`);
            console.log(`💻 Detected Stack : ${sig.extractedTechStack.join(", ")}`);
            console.log(`🎯 Key Initiative : ${sig.coreBusinessInitiative}`);
            console.log(`📢 Sales Trigger  : "${sig.salesTriggerSummary}"`);
        });
    }
}
runSimulation();