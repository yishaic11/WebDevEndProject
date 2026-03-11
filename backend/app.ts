import initApp from './index';
import http from 'http';
import https from 'https';
import fs from 'fs';

const NODE_ENV = process.env.NODE_ENV || 'development';

void initApp().then((app) => {
  if (NODE_ENV === 'prod') {
    const PORT = process.env.PORT || 443;

    const privateKey = fs.readFileSync('./https/private-key.pem', 'utf8');
    const certificate = fs.readFileSync('./https/client-cert.pem', 'utf8');
    
    const credentials = { 
        key: privateKey, 
        cert: certificate,
    };

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, () => {
      console.log(`Production server is running on: https://localhost:${PORT}`);
    });

  } else {
    const PORT = process.env.PORT || 80;

    const httpServer = http.createServer(app);

    httpServer.listen(PORT, () => {
      console.log(`Development server is running on: http://localhost:${PORT}`);
    });
  }
});