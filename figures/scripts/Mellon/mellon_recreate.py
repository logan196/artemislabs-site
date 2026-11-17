# Mellon cell-state density (via palantir.utils.run_density) on dentate gyrus
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, palantir, scanpy as sc, numpy as np; from prep_dentategyrus import load
a=load(); palantir.utils.run_diffusion_maps(a,n_components=10); palantir.utils.run_density(a)
fig,ax=plt.subplots(1,2,figsize=(11,4.5))
s=ax[0].scatter(*a.obsm["X_umap"].T,c=a.obs["mellon_log_density"],s=6,cmap="magma"); ax[0].set_title("Mellon log-density"); plt.colorbar(s,ax=ax[0]); ax[0].axis("off")
s=ax[1].scatter(*a.obsm["X_umap"].T,c=a.obs["mellon_log_density_clipped"],s=6,cmap="Spectral_r"); ax[1].set_title("clipped density (low = transitional)"); plt.colorbar(s,ax=ax[1]); ax[1].axis("off")
fig.tight_layout(); fig.savefig("v1_density_umap.png",dpi=140)
fig,ax=plt.subplots(figsize=(7,4)); o=a.obs.groupby("clusters",observed=True)["mellon_log_density"].median().sort_values().index
import seaborn as sns; sns.boxplot(data=a.obs,x="clusters",y="mellon_log_density",order=o,ax=ax,fliersize=1,hue="clusters",legend=False); ax.tick_params(axis="x",rotation=60); ax.set_title("Cell-state density per cluster"); fig.tight_layout(); fig.savefig("v2_density_by_cluster.png",dpi=140)
from mpl_toolkits.mplot3d import Axes3D  # noqa
fig=plt.figure(figsize=(7,6)); ax=fig.add_subplot(projection="3d"); u=a.obsm["X_umap"]; ax.scatter(u[:,0],u[:,1],a.obs["mellon_log_density"],c=a.obs["mellon_log_density"],cmap="magma",s=3); ax.set_title("Density landscape"); ax.view_init(35,-60); fig.savefig("v3_density_landscape_3d.png",dpi=140)
