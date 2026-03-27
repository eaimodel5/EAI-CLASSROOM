import fs from 'fs';
import path from 'path';

// Parse the SSOT JSON file
const ssotPath = path.join(process.cwd(), 'ssot-16.2.json');
let ssotData: any = null;

try {
  const rawData = fs.readFileSync(ssotPath, 'utf-8');
  ssotData = JSON.parse(rawData);
  console.log('Successfully loaded SSOT 16.2 data');
} catch (error) {
  console.error('Failed to load SSOT 16.2 data:', error);
}

// Extract relevant data for the frontend
export const getSsotMetadata = () => {
  if (!ssotData) return null;

  // Extract phases from P_Procesfase rubric
  const phaseRubric = ssotData.rubrics.find((r: any) => r.rubric_id === 'P_Procesfase');
  const phases = phaseRubric ? phaseRubric.bands.map((b: any) => ({
    id: b.band_id,
    label: b.label,
    description: b.description,
    didactic_principle: b.didactic_principle
  })) : [];

  // Extract commands
  const commands = ssotData.command_library?.commands || {};

  return {
    version: ssotData.metadata.version,
    phases,
    commands
  };
};

export const getSsotContextForPrompt = (phaseId: string) => {
  if (!ssotData) return '';

  // Find the specific phase
  const phaseRubric = ssotData.rubrics.find((r: any) => r.rubric_id === 'P_Procesfase');
  const phase = phaseRubric?.bands.find((b: any) => b.band_id === phaseId || b.label.toUpperCase() === phaseId);

  if (!phase) return '';

  return `
Didactische Context (SSOT 16.2):
- Fase: ${phase.label}
- Doel van deze fase: ${phase.description}
- Didactisch principe: ${phase.didactic_principle}
- Aanbevolen docent-interventie: ${phase.fix}
  `;
};
