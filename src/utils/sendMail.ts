import { renderFile } from "ejs";
import path from "path";

function renderTemplate(filename: string, data: Record<string, any>): Promise<string> {
  return new Promise((resolve, reject) => {
    renderFile(filename, data, (err, str) => {
      if (err !== null) reject(err);
      else resolve(str);
    });
  });
}

export default async function ejsTemplate(ejsPath: string, details: Record<string, any>): Promise<string> {
  const content = await renderTemplate(path.join(path.resolve("./"), ejsPath), { ...details });
  return await renderTemplate(path.join(path.resolve("./"), "/src/views/layout/layout.ejs"), {
    title: details.title,
    body: content,
  });
}
