const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  },
  forcePathStyle: true,
})

const BUCKET = process.env.MINIO_BUCKET || 'academy-uploads'

async function uploadFile(buffer, originalName, mimetype) {
  const ext = path.extname(originalName)
  const filename = `${uuidv4()}${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: mimetype,
  }))

  return `/uploads/${filename}`
}

async function deleteFile(url) {
  if (!url) return
  const filename = url.replace('/uploads/', '')
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: filename }))
  } catch (e) {
    console.error('Erro ao deletar arquivo:', e.message)
  }
}

module.exports = { uploadFile, deleteFile }
