import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (fileName.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' }, { status: 400 });
    }

    // Generate a simple smart summary of the extracted text
    const cleanText = extractedText.replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');
    const previewText = words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');

    // Attempt to guess title from file name
    const titleGuess = file.name
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[-_]+/g, ' ') // replace hyphens/underscores with space
      .replace(/\b\w/g, c => c.toUpperCase()); // capitalize

    return NextResponse.json({
      title: titleGuess,
      extractedText: cleanText,
      summary: `Automated extraction summary: ${previewText || 'Empty document.'}`,
      year: new Date().getFullYear(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
