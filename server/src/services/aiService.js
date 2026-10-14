import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * AI Provider Abstraction
 * Handles Gemini if API key is provided, otherwise provides safe, high-fidelity mock responses.
 */

export const generateEncounterSummary = async ({
  chiefComplaint = '',
  symptoms = [],
  soapNotes = {},
  diagnoses = [],
  vitals = {},
  followUpPlan = {},
}) => {
  // If Gemini API Key exists, we can call Gemini endpoint, else fallback to safe clinical extraction
  if (ENV.GEMINI_API_KEY) {
    try {
      const prompt = `You are a medical assistant helping summarize a clinical visit for a physician's review.
RULES:
1. ONLY use the provided information. NEVER hallucinate or invent new symptoms, findings, or diagnoses.
2. Format as a clear, concise structured clinical visit summary.
3. State clearly that this is an AI-generated draft requiring physician approval.

Data:
Chief Complaint: ${chiefComplaint}
Symptoms: ${symptoms.join(', ')}
Vitals: BP ${vitals.bloodPressureSys || '?'}/${vitals.bloodPressureDia || '?'}, HR ${vitals.heartRate || '?'}, SpO2 ${vitals.oxygenSaturation || '?'}%
SOAP:
- Subjective: ${soapNotes.subjective || 'None'}
- Objective: ${soapNotes.objective || 'None'}
- Assessment: ${soapNotes.assessment || 'None'}
- Plan: ${soapNotes.plan || 'None'}
Diagnoses: ${diagnoses.map((d) => `${d.code} (${d.description})`).join(', ')}
Follow-up: ${followUpPlan.instructions || 'Standard follow-up'}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            summary: text.trim(),
            provider: 'gemini',
            status: 'unapproved_draft',
          };
        }
      }
    } catch (err) {
      logger.warn('Gemini API call failed, using safe fallback provider', err.message);
    }
  }

  // Safe Mock Provider (Deterministic Clinical Synthesis)
  const primaryDiag = diagnoses.find((d) => d.type === 'primary') || diagnoses[0];
  const diagSummary = primaryDiag
    ? `Primary Diagnosis: ${primaryDiag.description} (${primaryDiag.code})`
    : 'No confirmed primary diagnosis recorded';

  const vitalsSummary = vitals.bloodPressureSys
    ? `Vitals recorded: BP ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg, HR ${vitals.heartRate || '--'} bpm, SpO2 ${vitals.oxygenSaturation || '--'}%.`
    : 'Vital signs deferred or not recorded.';

  const summary = `[CLINICAL ENCOUNTER SUMMARY - AI DRAFT FOR REVIEW]
Presenting Concern: ${chiefComplaint || 'Routine medical evaluation'}
Reported Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None documented'}

Clinical Findings:
${soapNotes.objective ? soapNotes.objective : vitalsSummary}

Assessment:
${soapNotes.assessment ? soapNotes.assessment : diagSummary}

Care Plan & Recommendations:
${soapNotes.plan || 'Maintain current regimen as advised.'}
${followUpPlan.instructions ? `Follow-up instructions: ${followUpPlan.instructions}` : ''}

Note: Generated on ${new Date().toLocaleDateString()} from physician's recorded visit notes. Pending clinician signature and approval.`;

  return {
    summary,
    provider: 'local_clinical_synthesizer',
    status: 'unapproved_draft',
  };
};

export const explainPrescriptionInstructions = async ({
  medications = [],
  generalInstructions = '',
  dietaryAdvice = '',
}) => {
  if (ENV.GEMINI_API_KEY) {
    try {
      const prompt = `You are a patient health educator. Explain these doctor-prescribed medications in simple, reassuring, plain language for the patient.
RULES:
1. Preserve every medication name, dosage, frequency, and duration EXACTLY.
2. Do not change or invent dosages.
3. Include instructions on when to take (with food, morning, night).
4. Direct patient to emergency services if severe allergic reactions occur.

Medications:
${medications.map((m) => `- ${m.name}: ${m.dosage}, ${m.frequency}, for ${m.duration} (${m.instructions || ''})`).join('\n')}

General Advice: ${generalInstructions}
Dietary: ${dietaryAdvice}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            explanation: text.trim(),
            provider: 'gemini',
          };
        }
      }
    } catch (err) {
      logger.warn('Gemini API call failed for patient explanation, using safe fallback', err.message);
    }
  }

  // Safe Mock Explainer
  const medBreakdown = medications
    .map((m, idx) => {
      return `${idx + 1}. **${m.name}** (${m.dosage})
   - **How to take**: ${m.frequency}
   - **Course duration**: Continue for ${m.duration} as prescribed.
   - **Special advice**: ${m.instructions || 'Take with water as directed by your doctor.'}`;
    })
    .join('\n\n');

  const explanation = `### Plain-Language Guide to Your Prescribed Medicines

Here is a simple summary of what each medicine does and how you should take it:

${medBreakdown}

${generalInstructions ? `\n**Doctor's Care Advice:**\n${generalInstructions}` : ''}
${dietaryAdvice ? `\n**Diet & Lifestyle Tips:**\n${dietaryAdvice}` : ''}

---
⚠️ **Important Safety Notice**:
- Finish the full course even if you feel better, unless your doctor tells you to stop.
- Never share your prescribed medicines with anyone else.
- If you experience severe side effects (such as rash, swelling, or difficulty breathing), seek urgent medical care immediately.
- Contact your clinic pharmacist or doctor if you have questions about missed doses.`;

  return {
    explanation,
    provider: 'local_patient_educator',
  };
};
