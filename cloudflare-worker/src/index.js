export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Sitemap route
    if (url.pathname === '/sitemap.xml') {
      return generateSitemap(request, env, url);
    }
    
    // Google Site Verification route
    if (url.pathname === '/google05710c3c0f66b8d7.html') {
      return new Response('google-site-verification: google05710c3c0f66b8d7.html', {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Google Play Console - Static compliance pages with instant redirect to SPA
    if (url.pathname === '/privacy.html') {
      const html = `<!DOCTYPE html><html><head><title>Privacy Policy</title></head><body><h1>Privacy Policy</h1><p>Our Privacy Policy ensures your data is safe.</p><script>window.location.replace("/privacy");</script></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
    if (url.pathname === '/delete-account.html') {
      const html = `<!DOCTYPE html><html><head><title>Account Deletion</title></head><body><h1>Delete Account</h1><p>You can request to delete your account data here.</p><script>window.location.replace("/delete-account");</script></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
    
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // We only care about /post/:id, /channel/:id, /profile/:id, /box/:id
    const type = pathSegments[0];
    const id = pathSegments[1];

    const supportedTypes = ['post', 'channel', 'profile', 'box'];

    // If it's not a supported route or missing ID, proxy normally
    if (!supportedTypes.includes(type) || !id) {
      return fetchFromGithubPages(request, env, url);
    }

    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
    const isBot = /twitterbot|facebookexternalhit|whatsapp|telegrambot|linkedinbot|slackbot|discordbot|vkshare|skypeuripreview|applebot|googlebot|bingbot/.test(userAgent);

    if (isBot) {
      // 1. Fetch metadata from Supabase
      const metadata = await fetchMetadataFromSupabase(type, id, env);

      if (metadata) {
        // Return a perfectly crafted HTML response just for the bot
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(metadata.title)}</title>
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:image" content="${escapeHtml(metadata.image)}">
  <meta name="twitter:image" content="${escapeHtml(metadata.image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(url.toString())}">
</head>
<body>
  <p>View this content on the app.</p>
</body>
</html>`;
        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
    }

    // If it's a real user or we failed to get metadata, just fetch normally
    return fetchFromGithubPages(request, env, url);
  },
};

async function fetchFromGithubPages(request, env, url) {
  // Let the request pass through to the origin (GitHub Pages)
  let response = await fetch(request);

  if (response.status === 404) {
    const rootUrl = new URL(url.toString());
    rootUrl.pathname = '/';
    // Use a clean fetch to avoid "body stream already read" exceptions on Cloudflare
    response = await fetch(rootUrl.toString(), {
      method: request.method,
      headers: request.headers
    });
  }

  return new Response(response.body, {
    status: response.status === 404 ? 200 : response.status,
    statusText: response.status === 404 ? 'OK' : response.statusText,
    headers: response.headers
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchMetadataFromSupabase(type, id, env) {
  const headers = {
    'apikey': env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
  };

  try {
    if (type === 'post') {
      const tables = ['statuses', 'posts', 'channel_posts'];

      for (const table of tables) {
        const endpoint = `${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*,author:profiles!author_id(display_name)`;
        const res = await fetch(endpoint, { headers });
        if (!res.ok) continue;

        const data = await res.json();
        if (data && data.length > 0) {
          const row = data[0];
          let image = 'https://crimchart.com/default_post_image.png';

          if (row.image_urls && row.image_urls.length > 0) image = row.image_urls[0];
          else if (row.image_url) image = row.image_url;
          else if (row.thumbnail_url) image = row.thumbnail_url;
          else if (row.thumbnail_urls && row.thumbnail_urls.length > 0) image = row.thumbnail_urls[0];
          
          let authorName = 'User';
          if (row.author && row.author.display_name) {
            authorName = row.author.display_name;
          } else if (row.author_username) {
            authorName = row.author_username;
          }

          return {
            title: `${authorName}'s Post | Crimchart`,
            description: row.caption || row.content || `View this post by ${authorName} on Crimchart`,
            image: image
          };
        }
      }
      return null;
    }

    let table = '';
    if (type === 'channel') table = 'channels';
    else if (type === 'profile') table = 'profiles';
    else if (type === 'box') table = 'boxes';

    if (!table) return null;

    const endpoint = `${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*`;
    const res = await fetch(endpoint, { headers });
    if (!res.ok) return null;

    const data = await res.json();
    if (data && data.length > 0) {
      const row = data[0];

      if (type === 'channel') {
        return {
          title: row.name || 'CrimChart Channel',
          description: row.description || `Join the ${row.name || 'channel'} on CrimChart`,
          image: row.avatar_url || row.profile_image_url || 'https://crimchart.com/default_channel_image.png'
        };
      } else if (type === 'profile') {
        return {
          title: row.display_name || row.username || 'CrimChart User',
          description: row.bio || `Check out ${row.display_name || row.username || 'this user'}'s profile on CrimChart`,
          image: row.profile_image_url || row.avatar_url || 'https://crimchart.com/default_profile_image.png'
        };
      } else if (type === 'box') {
        return {
          title: row.title || row.name || 'CrimChart Box',
          description: row.description || `Explore this Box on CrimChart`,
          image: (row.metadata && row.metadata.coverImageUrl) || row.image_url || 'https://crimchart.com/default_box_image.png'
        };
      }
    }
  } catch (err) {
    console.error('Supabase fetch error:', err);
  }

  return null;
}

async function generateSitemap(request, env, url) {
  const headers = {
    'apikey': env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
  };
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  xml += `
  <url>
    <loc>${url.origin}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  try {
    const postRes = await fetch(`${env.SUPABASE_URL}/rest/v1/posts?is_public=eq.true&order=created_at.desc&limit=1000`, { headers });
    if (postRes.ok) {
      const posts = await postRes.json();
      for (const p of posts) {
        xml += `
  <url>
    <loc>${url.origin}/post/${p.id}</loc>
    <lastmod>${(p.updated_at || p.created_at).split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`;
      }
    }
    
    const channelRes = await fetch(`${env.SUPABASE_URL}/rest/v1/channels?order=created_at.desc&limit=1000`, { headers });
    if (channelRes.ok) {
      const channels = await channelRes.json();
      for (const c of channels) {
        xml += `
  <url>
    <loc>${url.origin}/channel/${c.id}</loc>
    <lastmod>${(c.updated_at || c.created_at).split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`;
      }
    }
    
    const assetsRes = await fetch(`${env.SUPABASE_URL}/rest/v1/public_assets?order=created_at.desc&limit=1000`, { headers });
    if (assetsRes.ok) {
      const assets = await assetsRes.json();
      for (const a of assets) {
        xml += `
  <url>
    <loc>${a.url}</loc>
    <lastmod>${a.created_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`;
      }
    }
  } catch (err) {
    console.error('Sitemap generation error:', err);
  }
  
  xml += `\n</urlset>`;
  
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml;charset=UTF-8' }
  });
}
