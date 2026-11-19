import express, { type Request, type Response } from "express";
import { getCompanyHiringSignals } from "./signals/jobScraper.js";
import { generateSignalPitch } from "./ai/llmEngine.js";
import { processAutoBooking } from "./calender/bookingAgent.js";


const app = express();
app.use(express.json());
app.use(express.static("public"));


const PORT = 5000;

console.log(`\n Initializing AutoSDR Mission Control Engine...`);


// ENDPOINT 1 :scan signal -> Generate Pitch -> Audit Deliverability

app.post("/api/signals/scan-and-pitch", async (req: Request, res: Response) => {
    const { company, recipientName } = req.body;

    if (!company) return res.status(400).json({ error: "'company' is required!" });


    try {
        // 1. scan active hiring triggers
        const signals = await getCompanyHiringSignals(company);
        const topsignals = signals[0];


        if (!topsignals) return res.status(404).json({ error: `No active signals detected for ${company}` });


        // 2. Draft personalized pitch & audit deliverability
        const pitch = generateSignalPitch(topsignals, recipientName || "Alex");

        return res.status(200).json({ signal: topsignals, pitch });


    } catch (err: any) {
        return res.status(500).json({ error: "Failed to process signal : " + err.message });
    }

});




// ENDPOINT 2 : Auto meeting booking closer

app.post("/api/calendar/auto-book", (req: Request, res: Response) => {

    const { prospectName, replyText } = req.body;

    if (!replyText) return res.status(400).json({ error: "'replyText' is required." });


    try {
        // process auto calendar negotiation 
        const confirmation = processAutoBooking(prospectName || "there", replyText);
        return res.status(200).json({ confirmation });
    }
    catch (err: any) {
        return res.status(500).json({ error: "Booking negotiation failed: " + err.message });
    }


});


app.listen(PORT, () => {
    console.log(`\n AutoSDR Platform running at http://localhost:${PORT}\n`);

})