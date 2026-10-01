import {mkdirSync,writeFileSync} from 'node:fs'
import {join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=dirname(fileURLToPath(import.meta.url)),cache=join(root,'.studio-state','fontconfig');mkdirSync(cache,{recursive:true});const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');const file=join(cache,'fonts.conf');writeFileSync(file,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${xml(join(root,'assets'))}</dir><dir>${xml(join(root,'feed/brand'))}</dir><cachedir>${xml(cache)}</cachedir></fontconfig>`);process.env.FONTCONFIG_FILE=file
