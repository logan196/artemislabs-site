# Palantir on dentate gyrus (diffusion maps -> pseudotime, entropy, branch probabilities, gene trends)
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, palantir, scanpy as sc, numpy as np; from prep_dentategyrus import load
a=load()  # .X is already library-size normalised + log1p (scVelo prep)
palantir.utils.run_diffusion_maps(a,n_components=10); palantir.utils.determine_multiscale_space(a)
cl=a.obs.clusters.astype(str); um=a.obsm["X_umap"]
start=a.obs_names[np.where(cl=="nIPC")[0][np.argmin(um[cl=="nIPC",0])]] if (cl=="nIPC").any() else a.obs_names[0]
term={}
for c in ["Granule mature","Astrocytes","OL"]:
    if (cl==c).any(): idx=np.where(cl==c)[0]; term[a.obs_names[idx[np.argmax(np.linalg.norm(um[idx]-um[idx].mean(0),axis=1))]]]=c
term=pd_term=__import__("pandas").Series(term)
palantir.core.run_palantir(a,start,terminal_states=term,num_waypoints=500)
palantir.plot.plot_palantir_results(a,s=3); plt.savefig("v1_palantir_results.png",dpi=130,bbox_inches="tight"); plt.close("all")
palantir.presults.select_branch_cells(a)
palantir.plot.plot_branch_selection(a); plt.savefig("v2_branch_selection.png",dpi=120,bbox_inches="tight"); plt.close("all")
palantir.presults.compute_gene_trends(a,expression_key=None)
gt=[g for g in ["Prox1","Neurod1","Calb1","Aqp4","Sox11","Dcx","Plp1","Slc1a3","Ntrk2","Tmsb10","Ppp3ca"] if g in a.var_names][:4]
palantir.plot.plot_gene_trends(a,gt); plt.savefig("v3_gene_trends.png",dpi=120,bbox_inches="tight"); plt.close("all")
palantir.plot.plot_trajectory(a,list(term.values)[0],cell_color="palantir_pseudotime",n_arrows=8,color="red",scanpy_kwargs=dict(cmap="viridis")); plt.savefig("v4_trajectory_arrows.png",dpi=130,bbox_inches="tight")
