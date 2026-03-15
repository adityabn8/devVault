const ogs = require('open-graph-scraper');

const detectType = (url) => {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('github.com')) return 'repo';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'video';
    if (hostname.startsWith('docs.') || hostname.startsWith('developer.')) return 'docs';
    if (['udemy.com', 'coursera.org', 'frontendmasters.com'].some((h) => hostname.includes(h))) return 'course';
    return 'article';
  } catch {
    return 'article';
  }
};

const extractMetadata = async (url) => {
  try {
    const { result } = await ogs({ url, timeout: 10000 });
    return {
      title: result.ogTitle || result.twitterTitle || result.dcTitle || url,
      description: result.ogDescription || result.twitterDescription || '',
      siteName: result.ogSiteName || '',
      favicon: result.favicon
        ? result.favicon.startsWith('http')
          ? result.favicon
          : `${new URL(url).origin}${result.favicon}`
        : '',
      thumbnail: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || '',
      suggestedType: detectType(url),
    };
  } catch {
    return {
      title: url,
      description: '',
      siteName: '',
      favicon: '',
      thumbnail: '',
      suggestedType: detectType(url),
    };
  }
};

module.exports = { extractMetadata, detectType };
