const { execSync } = require('child_process');
const { createClient } = require('@libsql/client');

(async () => {
  try {
    console.log('Generating migration...');
    const sql = execSync('npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script', { encoding: 'utf8' });
    
    console.log('Connecting to Turso...');
    const client = createClient({
      url: 'libsql://aluminego-testpehuenia.aws-ap-south-1.turso.io',
      authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA1MjI2NjcsImlkIjoiMDE5ZThmNjItM2EwMS03YTIzLTlhMmMtNTdkZTE5OTIwZWRiIiwicmlkIjoiODIwOTk0NTItYjNjZS00M2I0LWJiNzQtYmQyMjlmNTBkNjkxIn0.pbIGQmAkMJ2R-6qyBqcT2lvv04ugQT-XSp4oMFy-OMUSRreZI9bGWy3Xq6GA9ZpSpnvWOQuN9CxVxCNM7i5qDA',
    });
    
    console.log('Executing multiple statements...');
    await client.executeMultiple(sql);
    console.log('Success!');
  } catch(e) {
    console.error(e);
  }
})();
