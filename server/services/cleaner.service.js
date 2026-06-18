const clean = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  const normalized = rawData
    .filter((item) => item?.fields && typeof item.fields === 'object')
    .map((item) => {
      const cleanedFields = Object.fromEntries(
        Object.entries(item.fields).map(([k, v]) => [
          k,
          typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v
        ])
      );

      return {
        tag: 'row',
        text: JSON.stringify(cleanedFields),
        href: item.href || cleanedFields.link || cleanedFields.url || null,
        fields: cleanedFields
      };
    });

  const seen = new Set();
  return normalized.filter((item) => {
    const key = JSON.stringify(item.fields);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

module.exports = { clean };