export const ATTACHMENT_FRIENDLY_TYPES=Object.freeze(['文档','图片','语音','视频','其他']);

const extension=name=>String(name??'').split('.').pop().toLowerCase();

export function attachmentFriendlyType(file={}){
  const mime=String(file.mime_type??file.media_type??file.mimeType??file.type??'').toLowerCase();
  const ext=extension(file.file_name??file.display_name??file.filename??file.name);
  if(mime.startsWith('image/')||['jpg','jpeg','png','heic','heif','gif','webp'].includes(ext))return'图片';
  if(mime.startsWith('audio/')||['mp3','m4a','wav','aac','flac','ogg'].includes(ext))return'语音';
  if(mime.startsWith('video/')||['mp4','mov','m4v','webm'].includes(ext))return'视频';
  if(mime.startsWith('text/')||mime.includes('pdf')||mime.includes('document')||mime.includes('word')||mime.includes('sheet')||mime.includes('excel')||mime.includes('json')||['pdf','doc','docx','txt','json','rtf','csv','xls','xlsx'].includes(ext))return'文档';
  return'其他';
}
