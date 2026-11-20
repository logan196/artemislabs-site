# Tangram: map Zeisel 2015 cortex/hippocampus single cells onto the 10x Visium mouse-brain H&E section (squidpy),
# then project cell-type probabilities onto the tissue; plus training-gene score diagnostics.
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, scanpy as sc, squidpy as sq, tangram as tg, torch
torch.manual_seed(0); torch.set_num_threads(4)
from load_zeisel import load
ad_sc=load(); ad_sp=sc.read_h5ad("../_data/py/visium_hne.h5ad")
sc.tl.rank_genes_groups(ad_sc,groupby="celltype",method="wilcoxon",use_raw=False)
markers=list(np.unique(sc.get.rank_genes_groups_df(ad_sc,None).groupby("group",observed=True).head(60)["names"]))
tg.pp_adatas(ad_sc,ad_sp,genes=markers)
m=tg.map_cells_to_space(ad_sc,ad_sp,mode="clusters",cluster_label="celltype",device="cpu",num_epochs=500,density_prior="rna_count_based",verbose=False)
tg.project_cell_annotations(m,ad_sp,annotation="celltype")
ct=list(ad_sp.obsm["tangram_ct_pred"].columns)
P=ad_sp.obsm["tangram_ct_pred"]; P=(P-P.min())/(P.max()-P.min())
for c in ct: ad_sp.obs[f"tg_{c}"]=P[c].values
sq.pl.spatial_scatter(ad_sp,color=[f"tg_{c}" for c in ct],ncols=4,cmap="magma",size=1.4,img_alpha=.5,figsize=(4,4),save=None)
plt.gcf().suptitle("Tangram: Zeisel cell types mapped onto Visium mouse brain",y=1.02); plt.savefig("v1_celltype_projection.png",dpi=120,bbox_inches="tight"); plt.close("all")
ad_sp.obs["tangram_argmax"]=P.idxmax(1).astype("category").values
sq.pl.spatial_scatter(ad_sp,color=["cluster","tangram_argmax"],size=1.4,img_alpha=.6,figsize=(6,6),wspace=.4)
plt.savefig("v2_argmax_vs_clusters.png",dpi=120,bbox_inches="tight"); plt.close("all")
tg.plot_training_scores(m,bins=20,alpha=.6); plt.gcf().suptitle("Tangram training-gene diagnostics"); plt.savefig("v3_training_scores.png",dpi=130,bbox_inches="tight"); plt.close("all")
