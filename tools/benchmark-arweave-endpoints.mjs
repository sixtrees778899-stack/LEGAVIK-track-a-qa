import {benchmarkCompatibleEndpoints} from'../src/ui/upload-performance.js';

const archiveBytes=Number(process.argv[2]??82776339),endpoints=(process.argv.slice(3).length?process.argv.slice(3):['https://arweave.net','https://ar-io.net','https://g8way.io','https://ardrive.net']);
const results=await benchmarkCompatibleEndpoints({endpoints,archiveBytes,rounds:5,timeoutMs:8000});
console.log(JSON.stringify({mode:'READ_ONLY_NO_TRANSACTION',archive_bytes:archiveBytes,results},null,2));
