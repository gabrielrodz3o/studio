"""Align approved spelling to locally recognized speech; preserve detected time anchors."""
import json, sys, unicodedata, difflib, re
from collections import Counter

ALIGNMENT_VERSION = 2

def verify_meaning(text, segments):
    """Do not manufacture negations, numbers or product names from fuzzy matches."""
    heard = ' '.join(s['text'] for s in segments)
    critical = {'no', 'nunca', 'sin', 'tampoco', 'jamas', 'gratis', 'gratuita'}
    expected = Counter(norm(w) for w in text.split() if norm(w) in critical)
    observed = Counter(norm(w) for w in heard.split() if norm(w) in critical)
    if expected != observed:
        raise ValueError('Revisión de voz: cambió una negación o condición comercial. Escucha y corrige la locución.')
    # Ambiguous digit/word substitutions require review instead of silently passing.
    numbers = lambda s: re.findall(r'\d+(?:[.,]\d+)*', s)
    if numbers(text) != numbers(heard):
        raise ValueError('Revisión de voz: las cantidades no coinciden con el guion.')
    for name in ['comandpos', 'gcode']:
        if name in norm(text) and name not in norm(heard):
            raise ValueError('Revisión de voz: confirma la pronunciación del nombre de la marca.')

def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if c.isalnum())

def align(text, segments, duration):
    verify_meaning(text, segments)
    expected=text.split()
    target=''.join(norm(w) for w in expected)
    observed=''; times=[]
    for s in segments:
        word=norm(s['text'])
        if not word: continue
        a=s['offsets']['from']/1000; b=s['offsets']['to']/1000
        for i,c in enumerate(word):
            observed+=c;times.append((a+(b-a)*i/len(word),a+(b-a)*(i+1)/len(word)))
    match=difflib.SequenceMatcher(None,target,observed,autojunk=False)
    if not target or not observed or match.ratio()<.65:
        raise ValueError('La transcripción no coincide suficientemente con el guion; revisa la voz.')
    anchors={}
    for a,b,size in match.get_matching_blocks():
        for i in range(size):anchors[a+i]=times[b+i]
    if not anchors: raise ValueError('No se detectaron palabras alineables')
    pos=0;words=[]
    for w in expected:
        size=len(norm(w)); points=[anchors[i] for i in range(pos,pos+size) if i in anchors]
        if points:
            start=points[0][0];end=points[-1][1]
        else:
            left=max((i for i in anchors if i<pos),default=None)
            right=min((i for i in anchors if i>=pos+size),default=None)
            start=anchors[left][1] if left is not None else 0
            end=anchors[right][0] if right is not None else duration
        start=max(words[-1]['end'] if words else 0,min(duration,start))
        end=max(start,min(duration,end))
        words.append({'word':w,'start':round(start,3),'end':round(end,3)})
        pos+=size
    return {'words':words,'coincidencia':round(match.ratio(),3),'metodo':'whisper-local-con-texto-del-guion','alignment_version':ALIGNMENT_VERSION,'critical_words_checked':True}

if __name__=='__main__':
    data=json.load(open(sys.argv[1])); transcription=json.load(open(sys.argv[2]))
    print(json.dumps(align(data['texto'],transcription['transcription'],data['duracion']),ensure_ascii=False))
