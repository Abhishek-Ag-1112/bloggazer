import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env loader to get Firebase Project ID
const envPaths = ['.env', '.env.local', '.env.production', '.env.development'];
let projectId = '';
let siteUrl = 'https://bloggazers.in'; // Default production URL

for (const envFile of envPaths) {
  const fullPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Parse Project ID
    const projectMatch = content.match(/VITE_FIREBASE_PROJECT_ID\s*=\s*([^\r\n]*)/);
    if (projectMatch && projectMatch[1]) {
      projectId = projectMatch[1].trim().replace(/['"]/g, '');
    }

    // Parse Site URL if defined in env
    const urlMatch = content.match(/VITE_SITE_URL\s*=\s*([^\r\n]*)/);
    if (urlMatch && urlMatch[1]) {
      siteUrl = urlMatch[1].trim().replace(/['"]/g, '');
    }
  }
}

// Fallback project ID
if (!projectId) {
  projectId = 'bloggazers-prod'; // Fallback
}

console.log(`Generating sitemap for project: ${projectId} on site: ${siteUrl}`);

async function generateSitemap() {
  try {
    // Fetch published blogs from Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogs?pageSize=300`;
    const response = await fetch(url);
    
    let blogs = [];
    if (response.ok) {
      const data = await response.json();
      if (data.documents) {
        blogs = data.documents
          .map(doc => {
            const fields = doc.fields;
            if (!fields) return null;
            
            const published = fields.published?.booleanValue ?? false;
            const slug = fields.slug?.stringValue;
            const updatedAt = fields.updated_at?.timestampValue ?? doc.updateTime;
            
            if (published && slug) {
              return { slug, updatedAt };
            }
            return null;
          })
          .filter(Boolean);
      }
    } else {
      console.warn(`Firestore REST API returned status ${response.status}. Creating sitemap with static pages only.`);
    }

    // Create Sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;

    // Add Dynamic Blog Pages
    blogs.forEach(blog => {
      xml += `
  <url>
    <loc>${siteUrl}/blog/${blog.slug}</loc>
    <lastmod>${blog.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const destDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(path.join(destDir, 'sitemap.xml'), xml, 'utf8');
    console.log(`Successfully generated sitemap.xml with ${blogs.length} blog entries.`);
  } catch (error) {
    console.error("Error generating sitemap.xml:", error);
  }
}

generateSitemap();
