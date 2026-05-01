const analyzeImageWithAI = async (imageUrl) => {
  try {
    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: { mime_type: mimeType, data: base64 }
              },
              {
                text: `Analyze this image and determine if it shows road damage (pothole, crack, flooding, broken barrier, landslide, or similar infrastructure damage on a road or street).
                
Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "isValidDamage": true or false,
  "confidence": number between 0 and 100,
  "detectedType": one of: pothole, crack, flooding, broken_barrier, landslide, other, not_road_damage,
  "reasoning": "one sentence explanation"
}

Be strict - only return isValidDamage: true if the image clearly shows road or street infrastructure damage.`
              }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 256 }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('AI analysis error:', err);
    return {
      isValidDamage: true,
      confidence: 50,
      detectedType: 'other',
      reasoning: 'AI analysis unavailable, report accepted for manual review.'
    };
  }
};

const getBadgesForPoints = (totalPoints, existingBadges = []) => {
  const badgeThresholds = [
    { points: 10, name: 'Road Watcher', icon: '👀' },
    { points: 50, name: 'Responsible Citizen', icon: '🏆' },
    { points: 100, name: 'Community Hero', icon: '🦸' },
    { points: 250, name: 'Road Guardian', icon: '🛡️' },
    { points: 500, name: 'City Champion', icon: '🌟' },
  ];
  const existingNames = existingBadges.map(b => b.name);
  return badgeThresholds
    .filter(b => totalPoints >= b.points && !existingNames.includes(b.name))
    .map(b => ({ name: b.name, icon: b.icon }));
};

const calculatePoints = (severity) => {
  const points = { low: 10, medium: 15, high: 20, critical: 25 };
  return points[severity] || 10;
};

module.exports = { analyzeImageWithAI, getBadgesForPoints, calculatePoints };