export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // We only care about /post/:id, /channel/:id, /profile/:id, /box/:id
    const type = pathSegments[0];
    const id = pathSegments[1];

    const supportedTypes = ['post', 'channel', 'profile', 'box'];

    // If it's not a supported route or missing ID, just proxy to GitHub Pages normally
    if (!supportedTypes.includes(type) || !id) {
      return fetchFromGithubPages(url, env);
    }

    // 1. Fetch metadata from Supabase
    const metadata = await fetchMetadataFromSupabase(type, id, env);

    // 2. Fetch the base HTML from GitHub Pages
    const response = await fetchFromGithubPages(url, env);

    // If we didn't find metadata, return the original HTML
    if (!metadata) {
      return response;
    }

    // 3. Inject the Open Graph tags into the HTML using HTMLRewriter
    return new HTMLRewriter()
      .on('head', new OGMetaInjector(metadata))
      .transform(response);
  },
};

async function fetchFromGithubPages(url, env) {
  // Construct the GitHub Pages URL
  const targetUrl = new URL(url.toString());
  const ghUrl = new URL(env.GITHUB_PAGES_URL);
  
  targetUrl.hostname = ghUrl.hostname;
  targetUrl.port = ghUrl.port;
  targetUrl.protocol = ghUrl.protocol;
  
  // If GitHub Pages is hosted in a subfolder (like /crimchart), prepend it
  if (ghUrl.pathname !== '/') {
    targetUrl.pathname = ghUrl.pathname.replace(/\/$/, '') + targetUrl.pathname;
  }

  // Fetch the actual file
  let response = await fetch(targetUrl.toString(), {
    headers: {
      'User-Agent': 'Cloudflare Worker'
    }
  });

  // If 404 (because it's an SPA route like /post/123), fetch index.html
  if (response.status === 404) {
    const indexUrl = new URL(ghUrl.toString());
    if (!indexUrl.pathname.endsWith('/')) {
      indexUrl.pathname += '/';
    }
    indexUrl.pathname += 'index.html';
    response = await fetch(indexUrl.toString());
  }

  // Return mutable response
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

async function fetchMetadataFromSupabase(type, id, env) {
  let table = '';
  let select = '';

  if (type === 'post') {
    table = 'statuses';
    select = 'content,image_url,video_url,audio_url';
  } else if (type === 'channel') {
    table = 'channels';
    select = 'name,description,profile_image_url';
  } else if (type === 'profile') {
    table = 'profiles';
    select = 'username,bio,profile_image_url';
  } else if (type === 'box') {
    table = 'boxes';
    select = 'title,description,image_url';
  }

  const endpoint = `${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=${select}`;
  
  try {
    const res = await fetch(endpoint, {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
      }
    });

    const data = await res.json();
    if (data && data.length > 0) {
      const row = data[0];
      
      // Normalize the data format depending on type
      if (type === 'post') {
        return {
          title: 'CrimChart Post',
          description: row.content || 'View this post on CrimChart',
          image: row.image_url || row.video_url || row.audio_url || 'https://crimchart.com/default_post_image.png'
        };
      } else if (type === 'channel') {
        return {
          title: row.name || 'CrimChart Channel',
          description: row.description || `Join the ${row.name} channel on CrimChart`,
          image: row.profile_image_url || 'https://crimchart.com/default_channel_image.png'
        };
      } else if (type === 'profile') {
        return {
          title: row.username || 'CrimChart User',
          description: row.bio || `Check out ${row.username}'s profile on CrimChart`,
          image: row.profile_image_url || 'https://crimchart.com/default_profile_image.png'
        };
      } else if (type === 'box') {
        return {
          title: row.title || 'CrimChart Box',
          description: row.description || `Explore ${row.title} on CrimChart`,
          image: row.image_url || 'https://crimchart.com/default_box_image.png'
        };
      }
    }
  } catch (err) {
    console.error('Supabase fetch error:', err);
  }
  
  return null;
}

class OGMetaInjector {
  constructor(metadata) {
    this.metadata = metadata;
  }

  element(element) {
    if (this.metadata.title) {
      element.append(`<meta property="og:title" content="${this.escapeHtml(this.metadata.title)}" />`, { html: true });
      element.append(`<meta name="twitter:title" content="${this.escapeHtml(this.metadata.title)}" />`, { html: true });
    }
    
    if (this.metadata.description) {
      element.append(`<meta property="og:description" content="${this.escapeHtml(this.metadata.description)}" />`, { html: true });
      element.append(`<meta name="twitter:description" content="${this.escapeHtml(this.metadata.description)}" />`, { html: true });
    }
    
    if (this.metadata.image) {
      element.append(`<meta property="og:image" content="${this.escapeHtml(this.metadata.image)}" />`, { html: true });
      element.append(`<meta name="twitter:image" content="${this.escapeHtml(this.metadata.image)}" />`, { html: true });
      element.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
    }
    
    element.append(`<meta property="og:type" content="website" />`, { html: true });
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
