# scTour (VAE + neural ODE) on La Manno 2018 dentate gyrus: learned pseudotime, latent-space vector field streamlines,
# and pseudotime distribution per cell type.
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, scanpy as sc, sctour as sct, torch
torch.manual_seed(0); torch.set_num_threads(4)
a=sc.read_h5ad("../_data/py/dentategyrus.h5ad"); a.X=a.layers["spliced"].copy()
a.obs["n_genes_by_counts"]=np.asarray((a.X>0).sum(1)).ravel()
sc.pp.highly_variable_genes(a,flavor="seurat_v3",n_top_genes=1500,subset=True); a=a.copy(); a.X=a.X.toarray().astype(np.float32)  # scTour uses the removed scipy .A on sparse views
tnode=sct.train.Trainer(a,loss_mode="nb",alpha_recon_lec=.5,alpha_recon_lode=.5,nepoch=120)
tnode.train()
a.obs["ptime"]=tnode.get_time(); mix,zs,pred=tnode.get_latentsp(alpha_z=.5,alpha_predz=.5); a.obsm["X_TNODE"]=mix
a.obs["ptime"]=sct.train.reverse_time(a.obs["ptime"].values) if np.corrcoef(a.obs.ptime,(a.obs.clusters=="Granule mature"))[0,1]<0 else a.obs["ptime"]
a.obsm["X_VF"]=tnode.get_vector_field(a.obs["ptime"].values,a.obsm["X_TNODE"])
sc.pp.neighbors(a,use_rep="X_TNODE",n_neighbors=15); sc.tl.umap(a,min_dist=.3)
fig,axs=plt.subplots(1,2,figsize=(13,5.5))
sc.pl.umap(a,color="clusters",ax=axs[0],show=False,legend_loc="on data",legend_fontsize=7,frameon=False,title="scTour latent UMAP")
sc.pl.umap(a,color="ptime",ax=axs[1],show=False,cmap="Spectral_r",frameon=False,title="scTour pseudotime")
fig.tight_layout(); fig.savefig("v1_pseudotime_umap.png",dpi=140)
fig,ax=plt.subplots(figsize=(8,6.5))
sct.vf.plot_vector_field(a,zs_key="X_TNODE",vf_key="X_VF",use_rep_neigh="X_TNODE",color="clusters",show=False,ax=ax,legend_loc="right margin",frameon=False,size=60,alpha=.25,title="scTour vector field (latent ODE)")
fig.savefig("v2_vector_field.png",dpi=140,bbox_inches="tight")
import seaborn as sns
o=a.obs.groupby("clusters",observed=True).ptime.median().sort_values().index
fig,ax=plt.subplots(figsize=(8,5)); sns.violinplot(data=a.obs,y="clusters",x="ptime",order=o,hue="clusters",legend=False,inner=None,cut=0,ax=ax,density_norm="width",palette=dict(zip(a.obs.clusters.cat.categories,a.uns["clusters_colors"])))
ax.set_title("scTour pseudotime by cell type"); fig.tight_layout(); fig.savefig("v3_ptime_by_celltype.png",dpi=140)
