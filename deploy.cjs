let AWS = require('aws-sdk');
let fs = require('fs');
const zlib = require('zlib');
const path = require('path');

console.log(`🚀 数独游戏部署开始 [${process.env.NODE_ENV || 'production'}]`);

const deploy = {
  path: 'sudoku',
};

const awsConfig = {
  region: 'us-east-1',
  apiVersion: '2006-03-01',
  // bucketName:'vsa-test-all',
  bucketName: 'vsa-bucket-public-new',
  basePath: `miniapps/${deploy.path}/`,
  ContentType: 'valid content type',
};

const distPath = './dist/';

// 检查 dist 目录是否存在
if (!fs.existsSync(distPath)) {
  console.error('❌ 错误: dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

function travelPath(dir, callback, extensions = ['html','js', 'css', 'png', 'jpg', 'jpeg', 'map', 'gif', 'ttf', 'otf', 'webp', 'ico', 'json', 'hbc']) {
  fs.readdirSync(dir).forEach((file)=>{
    let pathname = path.join(dir, file);
    if (fs.statSync(pathname).isDirectory()) {
      travelPath(pathname, callback);
    } else {
      const pathSplits = pathname.split('.');
      if (pathSplits.length > 1 && extensions.includes(pathSplits[pathSplits.length - 1])) {
        callback(pathname);
      }
    }
  });
}
AWS.config.update({ region: awsConfig.region });

let s3 = new AWS.S3({ apiVersion: awsConfig.apiVersion });

const uploadFile = (file)=>{
  let uploadParams = { Bucket: awsConfig.bucketName, Key: '', Body: '' };
  let fileStream = fs.createReadStream(file);
  let gzipStream = zlib.createGzip();
  fileStream.on('error', (err) => {
    console.error('❌ 文件读取错误:', err);
  });
  uploadParams.Body = fileStream.pipe(gzipStream);
  uploadParams.Key = `${awsConfig.basePath}${file.replace(distPath, '')}`;
  const fileType = file.split('.').pop();
  // 设置文件内容类型
  const contentTypeMap = {
    'js': 'text/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'map': 'application/json'
  };
  
  if (contentTypeMap[fileType]) {
    uploadParams.ContentType = contentTypeMap[fileType];
  }

  

  uploadParams.ContentEncoding = 'gzip';

  console.log(`📤 正在上传: ${uploadParams.Key}`);
  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error('❌ Upload Error:', err);
    } else if (data) {
      console.log('✅ Upload Success:', data.Location);
    }
  });
};

console.log('📁 开始扫描 dist 目录...');
let fileCount = 0;
travelPath(distPath, (pathname)=>{
  fileCount++;
  uploadFile(`./${pathname}`);
});
console.log(`📊 找到 ${fileCount} 个文件待上传`);

console.log(`🎉 数独游戏部署完成 [${process.env.NODE_ENV || 'production'}]`);
