import { env } from './config/env';
import ConnectDB from './config/db';
import app from './app';

ConnectDB();

app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
})
