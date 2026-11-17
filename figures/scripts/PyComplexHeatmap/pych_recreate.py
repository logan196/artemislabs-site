import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import numpy as np, pandas as pd, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
import matplotlib.cm
if not hasattr(matplotlib.cm,"get_cmap"): matplotlib.cm.get_cmap=matplotlib.colormaps.get_cmap  # shim: removed in matplotlib 3.9+, PyComplexHeatmap still calls it
from PyComplexHeatmap import *; from load_zeisel import load
ad=load(); mk=["Snap25","Gad1","Gad2","Pvalb","Sst","Satb2","Neurod6","Wfs1","Aqp4","Gfap","Mbp","Plp1","Cx3cr1","C1qa","Cldn5","Acta2"]
rng=np.random.default_rng(0); idx=np.concatenate([rng.choice(np.where(ad.obs.celltype==c)[0],min(60,(ad.obs.celltype==c).sum()),replace=False) for c in ad.obs.celltype.cat.categories])
X=pd.DataFrame(ad[idx,mk].X.toarray().T,index=mk,columns=ad.obs_names[idx]); meta=ad.obs.iloc[idx][["celltype","tissue"]]
col_ha=HeatmapAnnotation(celltype=anno_simple(meta.celltype,cmap="tab10",legend=True,add_text=False),tissue=anno_simple(meta.tissue,cmap="Set2"),nGene=anno_barplot(ad.obs.iloc[idx].nFeature_RNA,cmap="Greys",height=10),verbose=0,axis=1)
plt.figure(figsize=(9,5)); ClusterMapPlotter(data=X,top_annotation=col_ha,col_split=meta.celltype,col_split_gap=.8,row_cluster=True,col_cluster=False,cmap="Reds",show_rownames=True,label="log-norm",row_dendrogram=True,verbose=0,rasterized=True)
plt.savefig("v1_split_annotated.png",dpi=150,bbox_inches="tight"); plt.close("all")
df=pd.DataFrame(ad[:,mk].X.toarray(),columns=mk); df["ct"]=ad.obs.celltype.values
m=df.groupby("ct",observed=True).mean().stack().rename("mean").reset_index(); f=(df[mk]>0).groupby(df.ct,observed=True).mean().stack().rename("frac").reset_index(); d=m.merge(f); d.columns=["celltype","gene","mean","frac"]
plt.figure(figsize=(7,4)); DotClustermapPlotter(data=d,x="gene",y="celltype",value="mean",s="frac",c="mean",cmap="viridis",row_cluster=True,col_cluster=True,show_rownames=True,show_colnames=True,vmax=3,verbose=0)
plt.savefig("v2_dot_clustermap.png",dpi=150,bbox_inches="tight")
