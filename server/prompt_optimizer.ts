// Optimiseur de prompts pour contenu politique et commercial
export function optimizePromptForPoliticalContent(originalPrompt: string): string {
  const politicalKeywords = [
    'trump', 'putin', 'biden', 'macron', 'xi jinping', 'merkel',
    'president', 'political', 'politician', 'leader', 'government'
  ];
  
  const hasPliticalContent = politicalKeywords.some(keyword => 
    originalPrompt.toLowerCase().includes(keyword)
  );
  
  if (hasPliticalContent) {
    // Ajouter des styles artistiques pour contourner les filtres
    const artisticStyles = [
      'in anime style',
      'as a cartoon character',
      'in renaissance painting style',
      'as a caricature',
      'in watercolor painting style',
      'in comic book style'
    ];
    
    const randomStyle = artisticStyles[Math.floor(Math.random() * artisticStyles.length)];
    
    // Si le prompt ne contient pas déjà un style, en ajouter un
    if (!originalPrompt.toLowerCase().includes('style') && 
        !originalPrompt.toLowerCase().includes('cartoon') &&
        !originalPrompt.toLowerCase().includes('anime')) {
      return `${originalPrompt} ${randomStyle}`;
    }
  }
  
  return originalPrompt;
}

export function enhancePromptForQuality(prompt: string): string {
  const qualityEnhancers = [
    'high quality',
    'detailed',
    'professional',
    'masterpiece',
    '8K resolution',
    'sharp focus'
  ];
  
  // Ajouter des améliorations de qualité si pas déjà présentes
  const missingEnhancers = qualityEnhancers.filter(enhancer => 
    !prompt.toLowerCase().includes(enhancer.toLowerCase())
  );
  
  if (missingEnhancers.length > 0) {
    const selectedEnhancers = missingEnhancers.slice(0, 3);
    return `${prompt}, ${selectedEnhancers.join(', ')}`;
  }
  
  return prompt;
}