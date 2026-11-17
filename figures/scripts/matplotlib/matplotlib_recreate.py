# pure matplotlib versions of the most common omics panels
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import pandas as pd, numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
res=pd.read_csv("../_data/airway_deseq2_results.csv",index_col=0).dropna(subset=["padj"]); obs=pd.read_csv("../_data/zeisel_obs.csv",index_col=0)
up=(res.padj<.05)&(res.log2FoldChange>1); dn=(res.padj<.05)&(res.log2FoldChange<-1)
# V1 volcano
fig,ax=plt.subplots(figsize=(5.5,5)); y=-np.log10(res.padj.clip(lower=1e-300))
ax.scatter(res.log2FoldChange[~(up|dn)],y[~(up|dn)],s=3,c="lightgrey",rasterized=True); ax.scatter(res.log2FoldChange[up],y[up],s=4,c="#d7301f"); ax.scatter(res.log2FoldChange[dn],y[dn],s=4,c="#2b8cbe")
for g,r in res[up|dn].nsmallest(10,"padj").iterrows(): ax.annotate(r.symbol,(r.log2FoldChange,-np.log10(r.padj)),fontsize=7)
ax.axvline(-1,ls="--",c="k",lw=.6); ax.axvline(1,ls="--",c="k",lw=.6); ax.set(xlabel="log2 fold change",ylabel="-log10 padj",title="Volcano (matplotlib)"); [ax.spines[s].set_visible(False) for s in ("top","right")]
fig.tight_layout(); fig.savefig("v1_volcano.png",dpi=150)
# V2 MA
fig,ax=plt.subplots(figsize=(5.5,4)); ax.scatter(np.log10(res.baseMean+1),res.log2FoldChange,s=2,c=np.where(up|dn,"#d62728","#999999"),rasterized=True); ax.axhline(0,c="k",lw=.6); ax.set(xlabel="log10 mean expression",ylabel="log2FC",title="MA plot"); fig.tight_layout(); fig.savefig("v2_MA.png",dpi=150)
# V3 UMAP with categorical legend
fig,ax=plt.subplots(figsize=(6.5,5)); cats=obs.celltype.astype("category"); cmap=plt.get_cmap("tab10")
for i,c in enumerate(cats.cat.categories):
    m=cats==c; ax.scatter(obs.UMAP_1[m],obs.UMAP_2[m],s=3,color=cmap(i),label=c)
    ax.text(obs.UMAP_1[m].median(),obs.UMAP_2[m].median(),c,fontsize=7,weight="bold",ha="center")
ax.legend(markerscale=4,frameon=False,fontsize=7,bbox_to_anchor=(1,1)); ax.set_axis_off(); ax.set_title("UMAP (matplotlib)"); fig.tight_layout(); fig.savefig("v3_umap.png",dpi=150)
# V4 multi-panel figure with GridSpec and panel letters
fig=plt.figure(figsize=(9,5)); gs=fig.add_gridspec(2,3)
a=fig.add_subplot(gs[:,0:2]); a.scatter(obs.UMAP_1,obs.UMAP_2,c=obs.nFeature_RNA,s=2,cmap="magma"); a.set_axis_off(); a.set_title("genes / cell")
b=fig.add_subplot(gs[0,2]); obs.celltype.value_counts().plot.barh(ax=b,color="#4c72b0"); b.set_title("cells per type",fontsize=9); b.tick_params(labelsize=6)
c=fig.add_subplot(gs[1,2]); c.hist(obs.nCount_RNA,bins=50,color="#55a868"); c.set_title("UMIs / cell",fontsize=9)
for ax_,L in zip([a,b,c],"ABC"): ax_.text(-.08,1.05,L,transform=ax_.transAxes,fontsize=14,weight="bold")
fig.tight_layout(); fig.savefig("v4_multipanel_gridspec.png",dpi=150)
