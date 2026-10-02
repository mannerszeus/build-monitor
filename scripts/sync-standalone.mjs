import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile(new URL('../public/dashboard.html',import.meta.url),'utf8');
await writeFile(new URL('../index.html',import.meta.url),html.replaceAll('src="dashboard','src="public/dashboard'));
