#!/bin/bash

echo "Initializing LocalStack AWS resources..."

# Create S3 bucket for uploads
awslocal s3 mb s3://content-diagnostics-uploads

# Configure CORS for the bucket
awslocal s3api put-bucket-cors --bucket content-diagnostics-uploads --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:8080"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

# Create SQS queue for async processing
awslocal sqs create-queue --queue-name content-diagnostics-queue

# Create dead letter queue
awslocal sqs create-queue --queue-name content-diagnostics-dlq

echo "LocalStack AWS resources initialized successfully!"
echo "S3 Bucket: content-diagnostics-uploads"
echo "SQS Queue: content-diagnostics-queue"
echo "SQS DLQ: content-diagnostics-dlq"
