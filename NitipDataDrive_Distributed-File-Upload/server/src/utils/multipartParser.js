'use strict';

/**
 * parseMultipart: Memecah body multipart/form-data menjadi bagian file.
 *
 * Input:
 *   bodyBuffer  - Buffer penuh yang diterima dari request
 *   contentType - Header Content-Type, misalnya "multipart/form-data; boundary=..."
 *
 * Output:
 *   { fieldName, fileName, mimeType, fileData }
 */
function parseMultipart(bodyBuffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
  if (!boundaryMatch) throw new Error('Boundary tidak ditemukan dalam Content-Type.');

  const boundary = boundaryMatch[1];
  const firstDelim = Buffer.from('--' + boundary + '\r\n');
  let startPos = bodyBuffer.indexOf(firstDelim);
  if (startPos === -1) throw new Error('Format multipart tidak valid.');
  startPos += firstDelim.length;

  const endPos = bodyBuffer.indexOf(Buffer.from('\r\n--' + boundary + '--'));
  if (endPos === -1) throw new Error('Penutup multipart tidak ditemukan.');

  const partBuffer = bodyBuffer.slice(startPos, endPos);
  const headerEndPos = partBuffer.indexOf(Buffer.from('\r\n\r\n'));
  if (headerEndPos === -1) throw new Error('Header part tidak valid.');

  const headerStr = partBuffer.slice(0, headerEndPos).toString('utf8');
  const fileBuffer = partBuffer.slice(headerEndPos + 4);

  const dispositionMatch = headerStr.match(/Content-Disposition:.*?name="([^"]+)"(?:.*?filename="([^"]+)")?/i);
  const mimeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

  const fieldName = dispositionMatch ? dispositionMatch[1] : null;
  const fileName = dispositionMatch ? dispositionMatch[2] : null;
  const mimeType = mimeMatch ? mimeMatch[1].trim() : 'application/octet-stream';

  return { fieldName, fileName, mimeType, fileData: fileBuffer };
}

module.exports = { parseMultipart };