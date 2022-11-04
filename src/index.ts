import { config } from 'dotenv';

config();

import streams from './streams';
import './schedule';

streams();
