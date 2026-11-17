import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import pandas as pd, numpy as np, seaborn as sns, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt; from load_zeisel import load
ad=load(); genes=["Snap25","Gad1","Pvalb","Sst","Satb2","Neurod6","Aqp4","Gfap","Mbp","Plp1","Cx3cr1","C1qa","Cldn5","Acta2"]
df=pd.DataFrame(ad[:,genes].X.toarray(),columns=genes,index=ad.obs_names); df["celltype"]=ad.obs.celltype.values
av=df.groupby("celltype",observed=True).mean()
g=sns.clustermap(av.T,z_score=0,cmap="vlag",figsize=(6,7),row_cluster=True); g.fig.suptitle("seaborn clustermap (z-scored means)",y=1.02); g.savefig("v1_clustermap.png",dpi=150)
plt.figure(figsize=(8,4)); sns.violinplot(data=df,x="celltype",y="Mbp",hue="celltype",density_norm="width",inner="quartile",legend=False); plt.xticks(rotation=40,ha="right"); plt.title("violinplot"); plt.tight_layout(); plt.savefig("v2_violin.png",dpi=150)
long=df.melt(id_vars="celltype",value_vars=["Gad1","Satb2","Mbp","Aqp4"]); g=sns.catplot(data=long,x="celltype",y="value",col="variable",kind="box",col_wrap=2,height=3,aspect=1.6,fliersize=1,hue="celltype",legend=False)
for ax in g.axes.flat: ax.tick_params(axis="x",rotation=45,labelsize=7)
g.figure.tight_layout(); g.savefig("v3_catplot_facets.png",dpi=130)
plt.figure(figsize=(5,4.5)); sns.kdeplot(data=ad.obs,x="nCount_RNA",y="nFeature_RNA",hue="celltype",levels=4,log_scale=True); plt.title("kdeplot (QC density)"); plt.tight_layout(); plt.savefig("v4_kde_qc.png",dpi=150)
