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

  let phaseDescription = '';
  switch (phaseId) {
    case 'START':
      phaseDescription = 'De les is net begonnen. Leerlingen komen binnen en oriënteren zich op het doel.';
      break;
    case 'INSTRUCTIE':
      phaseDescription = 'De docent is bezig met instructie of uitleg. Leerlingen geven aan of ze het snappen of vragen om woordverklaringen.';
      break;
    case 'CHECK':
      phaseDescription = 'De docent checkt of de klas het begrepen heeft. Leerlingen geven aan of ze door kunnen of nog twijfelen.';
      break;
    case 'VERWERKEN':
      phaseDescription = 'Leerlingen werken zelfstandig of in groepjes aan opdrachten. Ze kunnen vastlopen of aangeven dat ze klaar zijn.';
      break;
    case 'AFSLUITING':
      phaseDescription = 'De les wordt afgesloten. Leerlingen reflecteren op wat ze geleerd hebben.';
      break;
  }

  return `
Didactische Context:
- Fase: ${phaseId}
- Doel van deze fase: ${phaseDescription}
  `;
};
