# Space Ranger / Loupe Browser look-alike from the same Visium mouse-brain run: tissue + spot overlay, gene with opacity, side-by-side UMAP
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import numpy as np, scanpy as sc, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
v=sc.read_h5ad("../_data/py/visium_hne.h5ad"); lib=list(v.uns["spatial"])[0]; img=v.uns["spatial"][lib]["images"]["hires"]; sf=v.uns["spatial"][lib]["scalefactors"]
xy=v.obsm["spatial"]*sf["tissue_hires_scalef"]; r=sf["spot_diameter_fullres"]*sf["tissue_hires_scalef"]/2
LOUPE=["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf","#393b79","#637939","#8c6d31","#843c39","#7b4173"]
cl=v.obs.cluster.astype("category"); col=np.array(LOUPE*3)[cl.cat.codes]
def spots(ax,c,alpha=1):
    from matplotlib.collections import PatchCollection; from matplotlib.patches import Circle
    pc=PatchCollection([Circle(p,r) for p in xy],facecolor=c,edgecolor="none",alpha=alpha); ax.add_collection(pc); return pc
fig,ax=plt.subplots(1,2,figsize=(13,6.2),facecolor="#f4f4f4")
ax[0].imshow(img); spots(ax[0],col,.85); ax[0].set_title("Clusters (graph-based)",loc="left",fontsize=11); ax[0].axis("off")
u=v.obsm["X_umap"]; ax[1].scatter(*u.T,c=col,s=8); ax[1].set_title("UMAP",loc="left"); ax[1].axis("off")
for i,c in enumerate(cl.cat.categories): ax[1].scatter([],[],c=LOUPE[i%15],label=c)
ax[1].legend(fontsize=7,frameon=False,loc="center left",bbox_to_anchor=(1,.5)); fig.suptitle("Loupe-style linked tissue / UMAP view",x=.02,ha="left",weight="bold"); fig.tight_layout(); fig.savefig("v1_tissue_clusters_umap.png",dpi=130)
g="Ttr"; e=np.asarray(v[:,g].X.todense()).ravel() if hasattr(v.X,"todense") else v[:,g].X.ravel(); nrm=(e-e.min())/(np.ptp(e)+1e-9)
fig,ax=plt.subplots(figsize=(7,6.5)); ax.imshow(img); cm=plt.get_cmap("YlOrRd")(nrm); cm[:,3]=.15+.85*nrm; pc=spots(ax,cm); ax.axis("off"); ax.set_title(f"{g} (opacity scaled to expression), Loupe feature view",loc="left")
sm=plt.cm.ScalarMappable(cmap="YlOrRd"); sm.set_clim(e.min(),e.max()); plt.colorbar(sm,ax=ax,shrink=.6,label="log-norm"); fig.tight_layout(); fig.savefig("v2_feature_opacity.png",dpi=130)
fig,ax=plt.subplots(figsize=(7,6.5)); ax.imshow(img); spots(ax,np.where(v.obs.total_counts.values[:,None]>0,plt.get_cmap("viridis")(v.obs.total_counts.rank(pct=True).values),0),.9); ax.axis("off"); ax.set_title("UMIs per spot (Space Ranger web_summary style)",loc="left"); fig.tight_layout(); fig.savefig("v3_umi_per_spot.png",dpi=130)
