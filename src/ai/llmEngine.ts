import { getCompanyHiringSignals, type HiringSignal } from "../signals/jobScraper.js";
import { auditEmailDeliverablity, type SpamAuditReport } from "./spamScore.js";



export interface GeneratedOutboundPitch {
    company: string;
    recipientName: string;
    subject: string;
    body: string;
    deliverabilityAudit: SpamAuditReport;
    deliverablityAudit: SpamAuditReport;
}

/**
 * The AI Pitch Generator;
 * create personalized, non-salsey emails referencing active hiring triggers
 */

export function generateSignalPitch(signal: HiringSignal, recipientName: string = "Alex"): GeneratedOutboundPitch {

    const techHighlight = signal.extractedTechStack.slice(0, 2).join(" & ");

    // subject line referencing their active role
    const subject = `Question re : ${signal.company}'s ${signal.jobTitle.split("-")[0]?.trim() || "team"}`;

    // 3- sentence high converting value pitch
    // sentence 1 : Observation of active hiring trigger (proves you did research)
    // sentence 2 : Value proposition matching their core tech
    // sentence 3 : Low-friction call to action

    const body =
        `
    Hi ${recipientName},

    Saw that ${signal.company} is hiring for a ${signal.jobTitle} to scale 
    ${signal.coreBusinessInitiative.toLowerCase()}.

    We engineered a lightweight outbound infrastructure with ${techHighlight} that reduces socket
    latency and automates two-way CRM sync without domain reputation risks.
    
    Open to seeing a 2-minute interactive demo this week?

    Best,
    Dev
    `;


    // Run Deliverability  Audit on the generated draft
    const audit = auditEmailDeliverablity(subject, body);

    return {
        company: signal.company,
        recipientName,
        subject,
        body,
        deliverabilityAudit: audit,
        deliverablityAudit: audit
    };


}






//  SIMULATE TEST SUITE
async function runSimulation() {
    console.log("\n TESTING SIGNAL-TO-PITCH GENERATOR & DELIVERABILITY AUDITOR \n");

    const companies = ["Stripe", "Notion"];

    for (const comp of companies) {
        const signals = await getCompanyHiringSignals(comp);
        const signal = signals[0];

        if (!signal) continue;

        const pitch = generateSignalPitch(signal, "Alex");
        console.log(`================================================================`);
        console.log(`🏢 TARGET: ${pitch.company} (Urgency: ${signal.urgencyScore}/100)`);
        console.log(`📧 SUBJECT: "${pitch.subject}"`);
        console.log(`📝 DRAFTED BODY:\n${pitch.body}\n`);
        console.log(`🛡️ DELIVERABILITY AUDIT:`);
        console.log(`   Score : ${pitch.deliverablityAudit.score}/100 (${pitch.deliverablityAudit.status})`);
        console.log(`   Links : ${pitch.deliverablityAudit.linkCount}`);
        console.log(`   Status: ${pitch.deliverablityAudit.recommendation.join(" | ")}`);
    }
}
runSimulation();