import { rmdir } from 'fs/promises';
import { join } from 'path';

await rmdir(join(process.cwd(), './dist'), {
  force: true,
  recursive: true,
}).catch(() => null);
