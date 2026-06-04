$url = "libsql://aluminego-testpehuenia.aws-ap-south-1.turso.io"
$token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA1MjI2NjcsImlkIjoiMDE5ZThmNjItM2EwMS03YTIzLTlhMmMtNTdkZTE5OTIwZWRiIiwicmlkIjoiODIwOTk0NTItYjNjZS00M2I0LWJiNzQtYmQyMjlmNTBkNjkxIn0.pbIGQmAkMJ2R-6qyBqcT2lvv04ugQT-XSp4oMFy-OMUSRreZI9bGWy3Xq6GA9ZpSpnvWOQuN9CxVxCNM7i5qDA"

npx vercel env add TURSO_DATABASE_URL production --value "$url" --yes
npx vercel env add TURSO_DATABASE_URL preview --value "$url" --yes
npx vercel env add TURSO_DATABASE_URL development --value "$url" --yes

npx vercel env add TURSO_AUTH_TOKEN production --value "$token" --yes
npx vercel env add TURSO_AUTH_TOKEN preview --value "$token" --yes
npx vercel env add TURSO_AUTH_TOKEN development --value "$token" --yes
