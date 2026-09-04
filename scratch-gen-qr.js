import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

async function generateQr() {
  const upiUrl = 'upi://pay?pa=8754132491@pthdfc&pn=Stick%20Scape%20Studio&cu=INR';
  const outputPath = path.resolve('./public/upi-qr.png');
  
  await QRCode.toFile(outputPath, upiUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  console.log('UPI QR successfully generated at:', outputPath);
}

generateQr().catch(console.error);
