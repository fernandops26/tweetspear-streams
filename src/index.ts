import { config } from 'dotenv';

config();

import streams from './streams';
import './ruleSchedule';
import './recentTweetsSchedule';

streams();
