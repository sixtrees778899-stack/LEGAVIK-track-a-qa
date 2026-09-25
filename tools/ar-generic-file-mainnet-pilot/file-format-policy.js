const formats={
  pdf:{label:'PDF',category:'DOCUMENT',extensions:['.pdf'],mimes:['application/pdf']},
  docx:{label:'DOCX',category:'DOCUMENT',extensions:['.docx'],mimes:['application/vnd.openxmlformats-officedocument.wordprocessingml.document']},
  txt:{label:'TXT',category:'DOCUMENT',extensions:['.txt'],mimes:['text/plain']},
  png:{label:'PNG',category:'IMAGE',extensions:['.png'],mimes:['image/png']},
  jpeg:{label:'JPG/JPEG',category:'IMAGE',extensions:['.jpg','.jpeg'],mimes:['image/jpeg','image/jpg']},
  heic:{label:'HEIC/HEIF',category:'IMAGE',extensions:['.heic','.heif'],mimes:['image/heic','image/heif','image/heic-sequence','image/heif-sequence']},
  mp3:{label:'MP3',category:'AUDIO',extensions:['.mp3'],mimes:['audio/mpeg','audio/mp3']},
  m4a:{label:'M4A',category:'AUDIO',extensions:['.m4a'],mimes:['audio/mp4','audio/x-m4a','audio/m4a']},
  wav:{label:'WAV',category:'AUDIO',extensions:['.wav'],mimes:['audio/wav','audio/x-wav','audio/wave','audio/vnd.wave']},
  mp4:{label:'MP4',category:'VIDEO',extensions:['.mp4'],mimes:['video/mp4']},
  mov:{label:'MOV',category:'VIDEO',extensions:['.mov'],mimes:['video/quicktime','video/mov','video/x-quicktime']}
};

export const FILE_FORMAT_POLICY=Object.freeze(Object.fromEntries(Object.entries(formats).map(([key,value])=>[key,Object.freeze({...value,extensions:Object.freeze(value.extensions),mimes:Object.freeze(value.mimes)})])));
export const FILE_FORMAT_LABELS=Object.freeze(Object.values(FILE_FORMAT_POLICY).map(rule=>rule.label));
export const FILE_INPUT_ACCEPT=Object.freeze([...new Set(Object.values(FILE_FORMAT_POLICY).flatMap(rule=>[...rule.extensions,...rule.mimes]))]).join(',');

export function resolveFileIdentity(filename,mimeType=''){
  const lower=String(filename??'').toLowerCase(),reported=String(mimeType??'').toLowerCase();
  for(const [fileType,rule] of Object.entries(FILE_FORMAT_POLICY)){
    if(!rule.extensions.some(extension=>lower.endsWith(extension)))continue;
    if(reported&&!rule.mimes.includes(reported))return null;
    return{fileType,mimeType:reported||rule.mimes[0],rule};
  }
  return null;
}
