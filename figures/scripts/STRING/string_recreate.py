# STRING: (V1) the canonical STRING network image via the official API; (V2) the same PPI edges redrawn with networkx, coloured by log2FC
import os, requests, io; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import pandas as pd, networkx as nx, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
res=pd.read_csv("../_data/airway_deseq2_results.csv",index_col=0).dropna(subset=["padj","symbol"])
top=res[(res.padj<1e-6)&(res.log2FoldChange.abs()>1.5)].nsmallest(60,"padj")
ids="%0d".join(top.symbol); API="https://string-db.org/api"
r=requests.post(f"{API}/image/network",data=dict(identifiers=ids,species=9606,network_flavor="confidence",required_score=400,caller_identity="artemis_fig_catalog"),timeout=120); r.raise_for_status(); open("v1_string_api_network.png","wb").write(r.content)
r=requests.post(f"{API}/tsv/network",data=dict(identifiers=ids,species=9606,required_score=400,caller_identity="artemis_fig_catalog"),timeout=120); e=pd.read_csv(io.StringIO(r.text),sep="\t")
G=nx.from_pandas_edgelist(e,"preferredName_A","preferredName_B","score"); fc=top.set_index("symbol").log2FoldChange
fig,ax=plt.subplots(figsize=(8,8)); pos=nx.spring_layout(G,seed=3,k=.5)
nx.draw_networkx_edges(G,pos,width=[3*d["score"]**2 for *_,d in G.edges(data=True)],alpha=.4,ax=ax)
nc=[fc.get(n,0) for n in G]; nodes=nx.draw_networkx_nodes(G,pos,node_color=nc,cmap="RdBu_r",vmin=-4,vmax=4,node_size=[200+60*G.degree(n) for n in G],edgecolors="k",linewidths=.5,ax=ax)
nx.draw_networkx_labels(G,pos,font_size=7,ax=ax); plt.colorbar(nodes,ax=ax,shrink=.5,label="log2FC (dex)"); ax.set_axis_off(); ax.set_title("STRING PPI (score>=0.4) redrawn, node size = degree")
fig.tight_layout(); fig.savefig("v2_networkx_fc.png",dpi=150); e.to_csv("string_edges.tsv",sep="\t",index=False)
