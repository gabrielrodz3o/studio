import {spawn} from 'node:child_process'
const child=spawn(new URL('node_modules/node/bin/node',import.meta.url).pathname,['node_modules/promptfoo/dist/src/entrypoint.js','eval','-c','promptfooconfig.yaml','--no-cache','-o','results.json'],{cwd:new URL('.',import.meta.url),env:{...process.env,PROMPTFOO_DISABLE_TELEMETRY:'1',PROMPTFOO_DISABLE_UPDATE:'1',PROMPTFOO_CONFIG_DIR:new URL('.promptfoo',import.meta.url).pathname},stdio:'inherit'})
child.on('exit',code=>process.exitCode=code??1)
