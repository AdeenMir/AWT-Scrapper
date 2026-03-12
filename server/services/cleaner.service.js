const clean = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .filter(item => {
      const text = item.text || '';
      // Remove empty, whitespace-only, or very short items
      if (text.trim().length < 2) return false;
      // Remove script/style leftovers
      if (/^[\s\t\n\r]+$/.test(text)) return false;
      // Remove items that are just special characters
      if (/^[^a-zA-Z0-9]+$/.test(text)) return false;
      return true;
    })
    .map(item => ({
      tag: item.tag || 'unknown',
      text: item.text
        .replace(/\s+/g, ' ')       // normalize whitespace
        .replace(/\n+/g, ' ')       // remove newlines
        .trim(),
      href: item.href || null
    }))
    // Remove duplicates
    .filter((item, index, self) =>
      index === self.findIndex(i => i.text === item.text)
    );
};

module.exports = { clean };