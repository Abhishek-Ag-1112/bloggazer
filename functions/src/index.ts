import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sitemap = onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("blogs")
      .where("published", "==", true)
      .orderBy("created_at", "desc")
      .get();

    const blogs = snapshot.docs.map(doc => {
      const data = doc.data();
      const slug = data.slug;
      
      let updatedAtStr = new Date().toISOString();
      if (data.updated_at) {
        if (typeof data.updated_at.toDate === 'function') {
          updatedAtStr = data.updated_at.toDate().toISOString();
        } else if (data.updated_at.seconds) {
          updatedAtStr = new Date(data.updated_at.seconds * 1000).toISOString();
        }
      }
      
      return { slug, updatedAt: updatedAtStr };
    });

    const baseUrl = "https://bloggazers.in"; // Change to your production domain

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;

    blogs.forEach(blog => {
      if (blog.slug) {
        xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${blog.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    xml += `
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Internal Server Error");
  }
});
