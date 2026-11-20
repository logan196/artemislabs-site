# CytoTRACE 2 (interpretable deep model of developmental potency) on La Manno 2018 dentate gyrus:
# potency score on the UMAP, potency category composition per cell type, and score-vs-cell-type ranking.
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, pandas as pd, scanpy as sc, seaborn as sns
from cytotrace2_py.cytotrace2_py import cytotrace2
a=sc.read_h5ad("../_data/py/dentategyrus.h5ad"); X=a.layers["spliced"]; X=X.toarray() if hasattr(X,"toarray") else X
keep=np.asarray((X>0).sum(0)).ravel()>=3
inp="ct2_input.tsv"; ann="ct2_annot.tsv"
pd.DataFrame(X[:,keep].T.astype(np.int32),index=a.var_names[keep],columns=a.obs_names).to_csv(inp,sep="\t")
a.obs[["clusters"]].to_csv(ann,sep="\t",header=False)
r=cytotrace2(inp,annotation_path=ann,species="mouse",max_cores=4,output_dir="ct2_out",disable_plotting=True,seed=14)
os.remove(inp)
r=r.reindex(a.obs_names); a.obs["CytoTRACE2_Score"]=r["CytoTRACE2_Score"].values; a.obs["Potency"]=pd.Categorical(r["CytoTRACE2_Potency"].values,["Differentiated","Unipotent","Oligopotent","Multipotent","Pluripotent","Totipotent"])
pot_cmap=matplotlib.colors.LinearSegmentedColormap.from_list("ct2",["#000004","#3B0F70","#8C2981","#DE4968","#FE9F6D","#FCFDBF"][::-1][::-1])
fig,axs=plt.subplots(1,2,figsize=(13,5.5))
sc.pl.umap(a,color="clusters",ax=axs[0],show=False,frameon=False,legend_loc="on data",legend_fontsize=7,title="Dentate gyrus cell types")
o=np.argsort(a.obs.CytoTRACE2_Score.values); xy=a.obsm["X_umap"]
s=axs[1].scatter(xy[o,0],xy[o,1],c=a.obs.CytoTRACE2_Score.values[o],cmap="Spectral_r",s=6,vmin=0,vmax=max(.35,np.quantile(a.obs.CytoTRACE2_Score,.995))); axs[1].set_axis_off(); axs[1].set_title("CytoTRACE 2 potency score (colour range clipped to data)"); fig.colorbar(s,ax=axs[1],shrink=.6)
fig.tight_layout(); fig.savefig("v1_potency_umap.png",dpi=140)
ct=pd.crosstab(a.obs.clusters,a.obs.Potency,normalize="index")
ct=ct.loc[a.obs.groupby("clusters",observed=True).CytoTRACE2_Score.median().sort_values(ascending=False).index]
pal=dict(zip(ct.columns,["#5E4FA2","#3288BD","#66C2A5","#FEE08B","#F46D43","#9E0142"]))
fig,ax=plt.subplots(figsize=(9,5)); ct.plot.bar(stacked=True,ax=ax,color=[pal[c] for c in ct.columns],width=.85,edgecolor="white")
ax.set_ylabel("fraction of cells"); ax.set_title("CytoTRACE 2 potency categories per cell type"); ax.legend(bbox_to_anchor=(1,1),frameon=False); fig.tight_layout(); fig.savefig("v2_potency_composition.png",dpi=140)
fig,ax=plt.subplots(figsize=(9,5)); order=ct.index
sns.boxplot(data=a.obs,x="clusters",y="CytoTRACE2_Score",order=order,hue="clusters",legend=False,palette=dict(zip(a.obs.clusters.cat.categories,a.uns["clusters_colors"])),fliersize=0,ax=ax)
sns.stripplot(data=a.obs,x="clusters",y="CytoTRACE2_Score",order=order,color="k",size=1,alpha=.3,ax=ax)
for y,l in zip([0,1/6,2/6],["Differentiated","Unipotent","Oligopotent"]): ax.axhline(y,c="grey",lw=.4,ls=":"); ax.text(len(order)-.4,y+.04,l,fontsize=7,color="grey")
ax.tick_params(axis="x",rotation=60); ax.set_ylim(0,.55); ax.set_title("CytoTRACE 2 potency score ranking (high -> low)"); fig.tight_layout(); fig.savefig("v3_score_ranking.png",dpi=140)
