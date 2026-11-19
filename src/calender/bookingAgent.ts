export interface TimeSlot {
    id: string;
    dayName: string;
    startTime: string;
    timeOfDay: "MORNING" | "AFTERNOON";
}


export interface BookingIntent {
    requestedDay: string | null;
    requestedTimeOfDay: "MORNING" | "AFTERNOON" | "ANY";
    rawSnippet: string;
}

export interface BookingConfirmation {
    confirmedSlot: TimeSlot;
    alternativeSlot: TimeSlot | null;
    generatedReplyText: string;
}


/**
 * Natural language Temporal Intent Parser:
 * Extracts requested days and time of day preferences from  prospect reply emails
 */


export function extractSchedulingIntent(emailReplyText: string): BookingIntent {
    const text = emailReplyText.toLowerCase();

    // 1. Detect the week
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "tomorrow"];
    let matchedDay: string | null = null;
    for (const d of days) {
        if (text.includes(d)) {
            matchedDay = d;
            break;
        }
    }



    // 2.Detect Time of Day Preference
    let timeOfDay: "MORNING" | "AFTERNOON" | "ANY" = "ANY";
    if (text.includes("morning") || text.includes("am") || text.includes("10:") || text.includes("11:")) {
        timeOfDay = "MORNING";
    } else if (text.includes("afternoon") || text.includes("pm") || text.includes("2:") || text.includes("3:") || text.includes("4:")) {
        timeOfDay = "AFTERNOON";
    }


    return {
        requestedDay: matchedDay,
        requestedTimeOfDay: timeOfDay,
        rawSnippet: emailReplyText.trim()
    }
}



/**
 * Available Calender Slots Pool (simulating Google Calender/Cal.com availablity).

 */

export function getCalenderAvailability(): TimeSlot[] {
    return [
        { id: "slot-1", dayName: "Tuesday", startTime: "10:00 AM EST", timeOfDay: "MORNING" },
        { id: "slot-2", dayName: "Tuesday", startTime: "2:30 PM EST", timeOfDay: "AFTERNOON" },
        { id: "slot-3", dayName: "Thursday", startTime: "2:00 PM EST", timeOfDay: "AFTERNOON" },
        { id: "slot-4", dayName: "Thursday", startTime: "3:30 PM EST", timeOfDay: "AFTERNOON" },
        { id: "slot-5", dayName: "Friday", startTime: "11:00 AM EST", timeOfDay: "MORNING" },
    ];
}



/**
 * The Auto Booking agent:
 * Matching prospect intent with open calendar slots and crafts an intant confirmation.
 */


export function processAutoBooking(prospectName: string, emailReplyText: string): BookingConfirmation {
    console.log(`\n [Calendar Agent] Parsing prospect reply: "${emailReplyText}"...`);


    const intent = extractSchedulingIntent(emailReplyText);
    const openSlots = getCalenderAvailability();


    // 1. Filter matching slots
    let matchingslots = openSlots.filter((slot) => {
        const daymatches = intent.requestedDay ? slot.dayName.toLowerCase() === intent.requestedDay : true;
        const timeMatches = intent.requestedTimeOfDay !== "ANY" ? slot.timeOfDay === intent.requestedTimeOfDay : true;
        return daymatches && timeMatches;
    });


    // fallback to any slot on the requested day, or any upcoming slot if no exact  match
    if (matchingslots.length === 0 && intent.requestedDay) {
        matchingslots = openSlots;
    }

    const confirmedSlot = matchingslots[0] || openSlots[0]!;
    const alternativeSlot = matchingslots[1] || (openSlots.find((s) => s.id != confirmedSlot.id) || null);



    // 2. Drafts auto confirmation email
    const altText = alternativeSlot ? `(or ${alternativeSlot.dayName} at ${alternativeSlot.startTime} if you prefer)` : " ";

    const replyText =
        `
    Hi ${prospectName},
    
    Awesome! I just reserved ${confirmedSlot.dayName} at ${confirmedSlot.startTime} on our calender ${altText}.
    
    I've sent an invite directly to your inbox with the Google Meet link. Looking forward to our conversation!

    Best,
    Dev
    `;


    return {
        confirmedSlot,
        alternativeSlot,
        generatedReplyText: replyText,
    };
}











// --- SIMULATION TEST SUITE ---
function runSimulation() {
    console.log("\n🚀 TESTING AUTONOMOUS CALENDAR BOOKING AGENT\n");

    const inboundReplies = [
        {
            name: "Alex (Stripe)",
            text: "Sounds interesting! Are you available Thursday afternoon?",
        },
        {
            name: "Sarah (Notion)",
            text: "Yes, let's do a demo. How does Tuesday morning look?",
        },
        {
            name: "David (Linear)",
            text: "Send over a time that works for you.",
        },
    ];

    for (const reply of inboundReplies) {
        const result = processAutoBooking(reply.name.split(" ")[0] || "there", reply.text);
        console.log(`================================================================`);
        console.log(`📩 PROSPECT REPLY : "${reply.text}"`);
        console.log(`🎯 MATCHED SLOT   : ${result.confirmedSlot.dayName} at ${result.confirmedSlot.startTime}`);
        console.log(`💬 AUTONOMOUS RESPONSE:\n${result.generatedReplyText}\n`);
    }
}

runSimulation();
