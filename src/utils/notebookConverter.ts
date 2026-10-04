/**
 * Jupyter Notebook (.ipynb / .ipyb) to Markdown Converter.
 * Parses JSON notebook structure (v3, v4+) into clean, publication-ready Markdown
 * with code cells, execution outputs, images, tables, and frontmatter.
 */

export interface ConvertedNotebook {
  title: string;
  markdown: string;
  frontmatter: Record<string, any>;
  language: string;
  kernelName: string;
}

function joinSource(source: string | string[] | undefined): string {
  if (!source) return '';
  if (Array.isArray(source)) {
    return source.join('');
  }
  return String(source);
}

/**
 * Strips terminal ANSI escape codes from error tracebacks & stdout
 */
function stripAnsi(text: string): string {
  return text
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\[\d+;\d+m/g, '')
    .replace(/\[\d+m/g, '');
}

export function convertNotebookToMarkdown(rawJson: string, filename: string): ConvertedNotebook {
  let nb: any;
  try {
    nb = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  } catch (err) {
    console.warn(`Failed to parse notebook JSON for ${filename}:`, err);
    return {
      title: filename.replace(/\.(ipynb|ipyb)$/i, ''),
      markdown: `> [!warning] Failed to parse notebook file\n> The file is corrupted or not valid JSON.`,
      frontmatter: { title: filename },
      language: 'python',
      kernelName: 'Python 3',
    };
  }

  // Detect kernel / programming language
  const language = 
    nb.metadata?.language_info?.name ||
    nb.metadata?.kernelspec?.language ||
    'python';

  const kernelName = 
    nb.metadata?.kernelspec?.display_name || 
    nb.metadata?.kernelspec?.name || 
    'Python 3';

  // Fallback title from filename
  const cleanFilename = filename
    .split('/')
    .pop()
    ?.replace(/\.(ipynb|ipyb)$/i, '') || 'Notebook';
  
  const defaultTitle = cleanFilename
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let extractedTitle: string | null = nb.metadata?.title || null;
  const frontmatter: Record<string, any> = {
    title: extractedTitle || defaultTitle,
    tags: ['notebook', 'jupyter', language],
    date: new Date().toISOString().split('T')[0],
    kernel: kernelName,
    language: language,
    description: `Jupyter Notebook converted to Markdown blog (${kernelName}).`,
  };

  const cells: any[] = Array.isArray(nb.cells) 
    ? nb.cells 
    : Array.isArray(nb.worksheets?.[0]?.cells) 
    ? nb.worksheets[0].cells 
    : [];

  const markdownParts: string[] = [];
  let foundFirstMarkdownCell = false;

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const cellType = cell.cell_type;
    const source = joinSource(cell.source).trim();

    if (!source && (!cell.outputs || cell.outputs.length === 0)) {
      continue;
    }

    if (cellType === 'markdown') {
      let cellText = source;

      // If this is the first markdown cell, check for title extraction
      if (!foundFirstMarkdownCell) {
        foundFirstMarkdownCell = true;
        
        // Check for YAML frontmatter block inside first markdown cell
        const fmMatch = cellText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
        if (fmMatch) {
          try {
            // Frontmatter found inside first cell
            cellText = fmMatch[2].trim();
          } catch {
            // ignore
          }
        }

        // Check for leading # Title
        const h1Match = cellText.match(/^\s*#\s+([^\n\r]+)(?:\r?\n|$)/);
        if (h1Match) {
          extractedTitle = h1Match[1].trim();
          frontmatter.title = extractedTitle;
          // Strip the H1 from body to respect the single-title rule
          cellText = cellText.replace(/^\s*#\s+[^\n\r]+(?:\r?\n|$)/, '').trim();
        }
      }

      if (cellText) {
        markdownParts.push(cellText);
      }
    } else if (cellType === 'code') {
      const execCount = cell.execution_count != null ? ` [${cell.execution_count}]` : '';
      const codeBlock = `\`\`\`${language}\n${source}\n\`\`\``;

      const cellParts: string[] = [codeBlock];

      // Handle Code Outputs
      const outputs = cell.outputs || [];
      for (const output of outputs) {
        const outputType = output.output_type;

        if (outputType === 'stream') {
          // Standard stdout or stderr
          const streamText = stripAnsi(joinSource(output.text)).trim();
          if (streamText) {
            cellParts.push(`\`\`\`text\n${streamText}\n\`\`\``);
          }
        } else if (outputType === 'execute_result' || outputType === 'display_data') {
          const data = output.data || {};

          // 1. Render Images (PNG, JPEG, GIF, SVG)
          if (data['image/png']) {
            const b64 = String(data['image/png']).replace(/\s+/g, '');
            cellParts.push(`\n![Output](data:image/png;base64,${b64})\n`);
          } else if (data['image/jpeg']) {
            const b64 = String(data['image/jpeg']).replace(/\s+/g, '');
            cellParts.push(`\n![Output](data:image/jpeg;base64,${b64})\n`);
          } else if (data['image/svg+xml']) {
            const svgContent = joinSource(data['image/svg+xml']);
            cellParts.push(`\n${svgContent}\n`);
          } else if (data['text/html']) {
            // 2. Render HTML (e.g. Pandas DataFrames, Interactive widgets)
            const htmlContent = joinSource(data['text/html']).trim();
            cellParts.push(`\n<div class="notebook-html-output my-3 overflow-x-auto">\n${htmlContent}\n</div>\n`);
          } else if (data['text/plain']) {
            // 3. Fallback to Plain text
            const plainText = stripAnsi(joinSource(data['text/plain'])).trim();
            if (plainText) {
              cellParts.push(`\`\`\`text\n${plainText}\n\`\`\``);
            }
          }
        } else if (outputType === 'error') {
          const ename = output.ename || 'ExecutionError';
          const evalue = stripAnsi(output.evalue || '');
          const traceback = Array.isArray(output.traceback) 
            ? stripAnsi(output.traceback.join('\n')).trim()
            : '';

          cellParts.push(
            `> [!warning] **${ename}**: ${evalue}\n>\n> \`\`\`text\n${traceback || evalue}\n> \`\`\``
          );
        }
      }

      markdownParts.push(cellParts.join('\n\n'));
    } else if (cellType === 'raw') {
      markdownParts.push(source);
    }
  }

  // Combine into complete Markdown document
  const finalMarkdown = markdownParts.join('\n\n---\n\n');

  return {
    title: frontmatter.title,
    markdown: finalMarkdown,
    frontmatter,
    language,
    kernelName,
  };
}
