#!/usr/bin/env python3
'''Build the Notes archive, plain JSON feed and Atom together from an approved draft. Does not post or access the network.''' 
from argparse import ArgumentParser
from datetime import date
from html import escape
from pathlib import Path
import json,re
from xml.dom.minidom import parseString
ROOT='https://artemislabs.bio'; NAME='Notes from the team.'; AN='Essays on bioinformatics, multi-omics, and the software biology deserves. New pieces land here automatically as we publish.'
def emit(p,s):
 p.parent.mkdir(exist_ok=True,parents=True); tmp=p.with_name(p.name+'.tmp');tmp.write_text(s+'\n', encoding='utf-8');tmp.replace(p)
def doc(title,main,headline=NAME):
 e=escape
 return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/notes/notes.v1.css"><link rel="stylesheet" href="/brand/brand.v1.css"><link rel="icon" type="image/png" href="/brand/artemis-icon-32.v1.png"><meta property="og:image" content="https://artemislabs.bio/brand/artemis-social.v1.png"><link rel="alternate" type="application/atom+xml" title="{NAME}" href="/notes/atom.xml"><title>{e(title)} · Artemis BioLabs</title></head><body><div class="page"><nav aria-label="Notes navigation"><a href="/" class="a-lock-link"><img class="a-lock a-lock-page" src="/brand/artemis-lockup.v1.png" width="514" height="191" alt="Artemis BioLabs"></a><a href="/notes/atom.xml">Atom feed</a></nav><main>{main}</main><footer><a href="/notes/">{e(headline)}</a> · <a href="/about/">About Artemis</a></footer></div></body></html>'
def text(j,k,maxlen):
 v=j[k]; assert isinstance(v,str) and v.strip()==v and 0<len(v)<=maxlen and not set('\r\x00').intersection(v),k;return v

def entry(raw):
 slug=text(raw,'slug',80); title=text(raw,'title',130); d=text(raw,'date',10); desc=text(raw,'summary',240)
 assert re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',slug),slug
 assert date.fromisoformat(d).isoformat()==d,d
 return {'slug':slug,'title':title,'date':d,'summary':desc}

a=ArgumentParser(description=__doc__);a.add_argument('site',type=Path);a.add_argument('--approved-draft',type=Path);o=a.parse_args();base=o.site/'notes'; f=base/'feed.json'; e=escape
existing=json.loads(f.read_text())['entries'] if f.exists() else []; byslug={q['slug']:entry(q) for q in existing}
if o.approved_draft:
 x=json.loads(o.approved_draft.read_text()); ent=entry(x); body=x['paragraphs']; assert isinstance(body,list) and 1<=len(body)<=100 and all(isinstance(p,str) and p.strip() and len(p)<15000 for p in body)
 assert ent['date']<=date.today().isoformat(), 'future-dated draft is not ready'
 title=ent['title'];stamp=f'<p class="stamp"><time datetime="{ent["date"]}">{ent["date"]}</time></p>'; s=f'<h1>{e(title)}</h1>{stamp}<div class="essay">'+''.join(f'<p>{e(t)}</p>' for t in body)+'</div>'
 emit(base/ent['slug']/'index.html',doc(title,s));byslug[ent['slug']]=ent
rows=sorted(byslug.values(),key=lambda r:(r['date'],r['slug']),reverse=True)
archive=''.join(f'<article><time datetime="{i["date"]}">{i["date"]}</time><h2><a href="/notes/{i["slug"]}/">{e(i["title"])}</a></h2><p>{e(i["summary"])}</p></article>' for i in rows) or '<p class="empty">No notes published yet.</p>'
s=f'<h1>{NAME}</h1><p class="lead">{AN}</p>'+archive
stamp=(rows[0]['date'] if rows else '2026-11-19')+'T00:00:00Z'
atom=f'<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>{ROOT}/notes/</id><title>{NAME}</title><link href="{ROOT}/notes/"/><link rel="self" href="{ROOT}/notes/atom.xml"/><updated>{stamp}</updated><author><name>Artemis BioLabs</name></author>'+''.join(f'<entry><id>{ROOT}/notes/{i["slug"]}/</id><title>{e(i["title"])}</title><link href="{ROOT}/notes/{i["slug"]}/"/><updated>{i["date"]}T00:00:00Z</updated><summary>{e(i["summary"])}</summary></entry>' for i in rows)+'</feed>'
parseString(atom);emit(base/'index.html',doc('Notes',s));emit(base/'feed.json',json.dumps({'schema':1,'entries':rows},ensure_ascii=False,indent=2));emit(base/'atom.xml',atom);print(len(rows),'published notes in staged archive; publish the site tree as one update')
