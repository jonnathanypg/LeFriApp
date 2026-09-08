import { Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/**
 * Parses markdown inline formatting (**bold**, *italic*) into docx TextRun array.
 */
export function parseMarkdownRuns(text: string, defaultOptions: { font?: string; size?: number; color?: string; bold?: boolean } = {}): TextRun[] {
  const font = defaultOptions.font || 'Times New Roman';
  const size = defaultOptions.size || 24; // 12pt (half-points in docx)
  const baseBold = defaultOptions.bold || false;

  // Match bold (**text**) and italic (*text*)
  // Split tokens while preserving delimiters
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  const runs: TextRun[] = [];

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      const inner = token.slice(2, -2);
      runs.push(new TextRun({
        text: inner,
        bold: true,
        font,
        size,
        color: defaultOptions.color
      }));
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      const inner = token.slice(1, -1);
      runs.push(new TextRun({
        text: inner,
        italics: true,
        bold: baseBold,
        font,
        size,
        color: defaultOptions.color
      }));
    } else {
      runs.push(new TextRun({
        text: token,
        bold: baseBold,
        font,
        size,
        color: defaultOptions.color
      }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: '', font, size })];
}

/**
 * Strips raw markdown syntax into clean, elegant legal plain text.
 */
export function stripMarkdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^```[a-zA-Z]*\n/gm, '')
    .replace(/^```$/gm, '')
    .replace(/^#+\s+/gm, '') // Remove heading hashes
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italics
    .replace(/^[-*•]\s+/gm, '• ') // Normalize bullets
    .trim();
}

/**
 * Converts Markdown content into clean, semantic Legal HTML for Google Docs/Drive import.
 */
export function markdownToLegalHtml(title: string, markdown: string): string {
  const cleaned = (markdown || '')
    .replace(/^```[a-zA-Z]*\n/gm, '')
    .replace(/^```$/gm, '')
    .trim();

  const lines = cleaned.split('\n');
  const bodyHtml: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const closeListIfOpen = () => {
    if (inList) {
      bodyHtml.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
    }
  };

  const formatInline = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      closeListIfOpen();
      continue;
    }

    // Heading 1: # Title
    if (line.startsWith('# ')) {
      closeListIfOpen();
      const content = formatInline(line.replace(/^#\s+/, ''));
      bodyHtml.push(`<h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-top: 18pt; margin-bottom: 12pt; text-transform: uppercase;">${content}</h1>`);
      continue;
    }

    // Heading 2: ## Section
    if (line.startsWith('## ')) {
      closeListIfOpen();
      const content = formatInline(line.replace(/^##\s+/, ''));
      bodyHtml.push(`<h2 style="font-size: 13pt; font-weight: bold; margin-top: 14pt; margin-bottom: 8pt; text-transform: uppercase; color: #1a1a1a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4pt;">${content}</h2>`);
      continue;
    }

    // Heading 3: ### Subsection
    if (line.startsWith('### ')) {
      closeListIfOpen();
      const content = formatInline(line.replace(/^###\s+/, ''));
      bodyHtml.push(`<h3 style="font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 6pt; color: #2d3748;">${content}</h3>`);
      continue;
    }

    // Horizontal divider: --- or ***
    if (line === '---' || line === '***' || line === '___') {
      closeListIfOpen();
      bodyHtml.push('<hr style="border: none; border-top: 1px solid #cbd5e1; margin: 16pt 0;" />');
      continue;
    }

    // Numbered list: 1. item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (!inList || listType !== 'ol') {
        closeListIfOpen();
        bodyHtml.push('<ol style="margin-top: 4pt; margin-bottom: 8pt; padding-left: 24pt; line-height: 1.6;">');
        inList = true;
        listType = 'ol';
      }
      bodyHtml.push(`<li style="margin-bottom: 4pt; text-align: justify;">${formatInline(numberedMatch[2])}</li>`);
      continue;
    }

    // Bullet list: - item or * item
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeListIfOpen();
        bodyHtml.push('<ul style="margin-top: 4pt; margin-bottom: 8pt; padding-left: 24pt; line-height: 1.6;">');
        inList = true;
        listType = 'ul';
      }
      bodyHtml.push(`<li style="margin-bottom: 4pt; text-align: justify;">${formatInline(bulletMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    closeListIfOpen();
    // Check if line looks like signature or centered note
    if (line.startsWith('[Firma') || line === 'Atentamente,') {
      bodyHtml.push(`<p style="margin-top: 18pt; margin-bottom: 6pt; font-size: 12pt; line-height: 1.5;">${formatInline(line)}</p>`);
    } else {
      bodyHtml.push(`<p style="margin-top: 0; margin-bottom: 8pt; font-size: 12pt; line-height: 1.6; text-align: justify;">${formatInline(line)}</p>`);
    }
  }

  closeListIfOpen();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${formatInline(title)}</title>
  <style>
    @page { margin: 2.5cm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #111111;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  ${bodyHtml.join('\n  ')}
</body>
</html>`;
}

/**
 * Converts Markdown content into an array of docx Paragraph objects with true rich typography.
 */
export function markdownToDocxParagraphs(title: string, markdown: string): Paragraph[] {
  const cleaned = (markdown || '')
    .replace(/^```[a-zA-Z]*\n/gm, '')
    .replace(/^```$/gm, '')
    .trim();

  const paragraphs: Paragraph[] = [];
  const lines = cleaned.split('\n');

  // Check if first line is already the title
  const firstLine = lines[0]?.trim() || '';
  const firstLineIsTitle = firstLine.startsWith('# ') && firstLine.toUpperCase().includes(title.toUpperCase().slice(0, 10));

  if (!firstLineIsTitle && title) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            font: 'Times New Roman',
            size: 28 // 14pt
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 260 }
      })
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      continue;
    }

    // Heading 1: # Title
    if (line.startsWith('# ')) {
      const headingText = line.replace(/^#\s+/, '');
      paragraphs.push(
        new Paragraph({
          children: parseMarkdownRuns(headingText, { font: 'Times New Roman', size: 28, bold: true }),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 140 }
        })
      );
      continue;
    }

    // Heading 2: ## Section
    if (line.startsWith('## ')) {
      const headingText = line.replace(/^##\s+/, '');
      paragraphs.push(
        new Paragraph({
          children: parseMarkdownRuns(headingText, { font: 'Times New Roman', size: 26, bold: true }),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );
      continue;
    }

    // Heading 3: ### Subsection
    if (line.startsWith('### ')) {
      const headingText = line.replace(/^###\s+/, '');
      paragraphs.push(
        new Paragraph({
          children: parseMarkdownRuns(headingText, { font: 'Times New Roman', size: 24, bold: true }),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 }
        })
      );
      continue;
    }

    // Horizontal Divider
    if (line === '---' || line === '***' || line === '___') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "______________________________________________________________________",
              font: 'Times New Roman',
              size: 20,
              color: "A0AEC0"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 140 }
        })
      );
      continue;
    }

    // Numbered list item: 1. Item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const numPrefix = `${numberedMatch[1]}.  `;
      const itemContent = numberedMatch[2];
      const runs = [
        new TextRun({ text: numPrefix, bold: true, font: 'Times New Roman', size: 24 }),
        ...parseMarkdownRuns(itemContent, { font: 'Times New Roman', size: 24 })
      ];
      paragraphs.push(
        new Paragraph({
          children: runs,
          indent: { left: 400 },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 100 }
        })
      );
      continue;
    }

    // Bullet list item: - Item or * Item
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      const itemContent = bulletMatch[1];
      const runs = [
        new TextRun({ text: "•   ", bold: true, font: 'Times New Roman', size: 24 }),
        ...parseMarkdownRuns(itemContent, { font: 'Times New Roman', size: 24 })
      ];
      paragraphs.push(
        new Paragraph({
          children: runs,
          indent: { left: 400 },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 100 }
        })
      );
      continue;
    }

    // Regular Paragraph
    const runs = parseMarkdownRuns(line, { font: 'Times New Roman', size: 24 });
    const isSignatures = line.startsWith('[Firma') || line === 'Atentamente,';

    paragraphs.push(
      new Paragraph({
        children: runs,
        alignment: isSignatures ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
        spacing: { after: 120, line: 360 } // 1.5 line spacing
      })
    );
  }

  // Legal footer
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Documento legal redactado y preparado con LeFriApp",
          italics: true,
          font: 'Times New Roman',
          size: 18,
          color: "718096"
        })
      ],
      spacing: { before: 400 },
      alignment: AlignmentType.CENTER
    })
  );

  return paragraphs;
}
