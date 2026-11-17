# Squidpy: 10x Visium mouse coronal brain (H&E) + Moffitt 2018 MERFISH hypothalamus
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, squidpy as sq, scanpy as sc
v=sc.read_h5ad("../_data/py/visium_hne.h5ad")
sq.pl.spatial_scatter(v,color="cluster",size=1.3,title="Visium mouse brain: annotated clusters on H&E"); plt.savefig("v1_clusters_on_HE.png",dpi=140,bbox_inches="tight"); plt.close("all")
sq.pl.spatial_scatter(v,color=["Olfm1","Plp1","Itpka","Ttr"],ncols=2,cmap="magma",size=1.3); plt.savefig("v2_genes_on_HE.png",dpi=120,bbox_inches="tight"); plt.close("all")
sq.gr.spatial_neighbors(v); sq.gr.nhood_enrichment(v,cluster_key="cluster",seed=0)
sq.pl.nhood_enrichment(v,cluster_key="cluster",method="ward",cmap="inferno",vmin=-50,vmax=100,figsize=(6,6)); plt.savefig("v3_nhood_enrichment.png",dpi=140,bbox_inches="tight"); plt.close("all")
m=sc.read_h5ad("../_data/py/merfish.h5ad"); s=m[m.obs.Bregma==m.obs.Bregma.unique()[3]].copy()
sq.pl.spatial_scatter(s,shape=None,color="Cell_class",size=2,title="MERFISH hypothalamus (one Bregma slice)"); plt.savefig("v4_merfish_cell_classes.png",dpi=140,bbox_inches="tight"); plt.close("all")
sq.gr.co_occurrence(s,cluster_key="Cell_class"); sq.pl.co_occurrence(s,cluster_key="Cell_class",clusters=["Inhibitory","Excitatory"],figsize=(10,4)); plt.savefig("v5_co_occurrence.png",dpi=130,bbox_inches="tight"); plt.close("all")
sq.gr.ripley(s,cluster_key="Cell_class",mode="L"); sq.pl.ripley(s,cluster_key="Cell_class",mode="L"); plt.savefig("v6_ripley_L.png",dpi=130,bbox_inches="tight")
