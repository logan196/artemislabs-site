# CellRank 2 on dentate gyrus: macrostates, fate probabilities, circular projection, driver-gene trends
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, cellrank as cr, scanpy as sc, scvelo as scv; from prep_dentategyrus import load
a=load(); vk=cr.kernels.VelocityKernel(a).compute_transition_matrix(); ck=cr.kernels.ConnectivityKernel(a).compute_transition_matrix(); k=0.8*vk+0.2*ck
g=cr.estimators.GPCCA(k); g.fit(cluster_key="clusters",n_states=[4,10]); 
g.plot_macrostates(which="all",basis="umap",legend_loc="right",s=60,show=False); plt.gcf().savefig("v1_macrostates.png",dpi=150,bbox_inches="tight"); plt.close("all")
term=[s for s in g.macrostates.cat.categories if any(x in s for x in ("Granule mature","Astrocytes","OL","Microglia","Endothelial","Cajal"))][:4] or list(g.macrostates.cat.categories)[:3]
g.set_terminal_states(states=term); g.compute_fate_probabilities()
g.plot_fate_probabilities(same_plot=False,basis="umap",ncols=2,show=False); plt.gcf().savefig("v2_fate_probabilities.png",dpi=130,bbox_inches="tight"); plt.close("all")
cr.pl.circular_projection(a,keys=["clusters","latent_time"],legend_loc="right",title=""); plt.gcf().savefig("v3_circular_projection.png",dpi=130,bbox_inches="tight"); plt.close("all")
d=g.compute_lineage_drivers(cluster_key="clusters"); lin=g.fate_probabilities.names[0]; genes=d.sort_values(f"{lin}_corr",ascending=False).index[:4].tolist()
g.plot_lineage_drivers(lin,n_genes=4,basis="umap",ncols=2); plt.gcf().savefig("v4_lineage_drivers.png",dpi=130,bbox_inches="tight")  # GAM gene-trend models fail with current pygam/scipy
