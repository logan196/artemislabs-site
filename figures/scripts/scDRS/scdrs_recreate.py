# scDRS disease-relevance scores on Zeisel 2015 mouse cortex/hippocampus, using the scDRS data-release MAGMA gene
# sets (top-1000 genes, z-score weights; figshare 19312583, gs_file.zip, 0.9 MB, fetched once into _data/scdrs):
# schizophrenia, bipolar, MDD, Alzheimer's, and height as a non-brain control. Human->mouse by symbol case mapping
# (approximation; 1:1 orthologue tables were not used to keep this offline).
import numpy as _np; _np.float_ = _np.float64  # scDRS 1.0.2 uses np.float_ (removed in NumPy 2)
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, pandas as pd, scanpy as sc, scdrs, seaborn as sns
from load_zeisel import load
a=load(); a.obs["n_genes"]=np.asarray((a.layers["counts"]>0).sum(1)).ravel()
GS="../_data/scdrs/gs_file/magma_10kb_top1000_zscore.74_traits.rv1.gs"
if not os.path.exists(GS):
    import urllib.request, zipfile; os.makedirs("../_data/scdrs",exist_ok=True); urllib.request.urlretrieve("https://ndownloader.figshare.com/files/34300898","../_data/scdrs/gs_file.zip"); zipfile.ZipFile("../_data/scdrs/gs_file.zip").extractall("../_data/scdrs")
T={"SCZ":"PASS_Schizophrenia_Pardinas2018","BIP":"PASS_BIP_Mullins2021","MDD":"PASS_MDD_Howard2019","AD":"PASS_Alzheimers_Jansen2019","Height":"UKB_460K.body_HEIGHTz"}
raw=scdrs.util.load_gs(GS); gs={k:([g.capitalize() for g in raw[v][0]],raw[v][1]) for k,v in T.items() if v in raw}
scdrs.preprocess(a,cov=pd.DataFrame({"const":1,"n_genes":a.obs.n_genes},index=a.obs_names),n_mean_bin=20,n_var_bin=20,copy=False)
res={}
for t,(genes,w) in gs.items():
    keep=[i for i,g in enumerate(genes) if g in a.var_names]
    res[t]=scdrs.score_cell(a,[genes[i] for i in keep],gene_weight=[w[i] for i in keep],ctrl_match_key="mean_var",n_ctrl=200,weight_opt="vs",return_ctrl_raw_score=False,return_ctrl_norm_score=True,verbose=False)
    a.obs[f"{t}_norm_score"]=res[t]["norm_score"]; print(t,len(keep),"genes; cells p<0.01:",(res[t]["pval"]<0.01).sum())
fig,axs=plt.subplots(2,3,figsize=(16,10)); axs=axs.ravel()
sc.pl.umap(a,color="celltype",ax=axs[0],show=False,frameon=False,legend_loc="on data",legend_fontsize=7,title="Zeisel cell types")
for ax,t in zip(axs[1:],gs):
    sc.pl.umap(a,color=f"{t}_norm_score",ax=ax,show=False,frameon=False,cmap="RdBu_r",vcenter=0,vmax=4,vmin=-4,title=f"scDRS score: {t}")
fig.tight_layout(); fig.savefig("v1_umap_scores.png",dpi=130)
sc.pp.pca(a,n_comps=30); sc.pp.neighbors(a,n_neighbors=15)
rows=[]
for t in gs:
    df=scdrs.method.downstream_group_analysis(a,df_full_score=res[t],group_cols=["celltype"])["celltype"]
    df["trait"]=t; rows.append(df)
G=pd.concat(rows); G.to_csv("scdrs_group_analysis.csv")
G.index.name="celltype"; Gr=G.reset_index()
P=Gr.pivot(index="celltype",columns="trait",values="assoc_mcz")[list(gs)]; H=Gr.pivot(index="celltype",columns="trait",values="hetero_mcz")[list(gs)]
fig,ax=plt.subplots(figsize=(7,5)); sns.heatmap(P,cmap="Reds",annot=H.astype(float),fmt=".1f",annot_kws={"size":8},cbar_kws={"label":"association MC-z"},ax=ax,linewidths=.5)
ax.set_title("scDRS group association (colour) / heterogeneity z (text)"); fig.tight_layout(); fig.savefig("v2_group_assoc_heatmap.png",dpi=140)
long=pd.concat([pd.DataFrame({"celltype":a.obs.celltype.values,"score":a.obs[f"{t}_norm_score"].values,"trait":t}) for t in gs])
fig,ax=plt.subplots(figsize=(10,4.5)); sns.boxplot(data=long,x="celltype",y="score",hue="trait",fliersize=0,ax=ax,palette="Set1")
ax.axhline(0,c="grey",lw=.8,ls="--"); ax.tick_params(axis="x",rotation=30); ax.set_title("scDRS per-cell normalised disease scores by cell type"); fig.tight_layout(); fig.savefig("v3_score_boxplots.png",dpi=140)
