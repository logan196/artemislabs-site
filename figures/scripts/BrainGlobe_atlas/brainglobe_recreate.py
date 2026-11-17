# Allen Mouse CCFv3 (BrainGlobe atlas API, allen_mouse_25um): coronal annotation overlay, region outlines, 3D region point cloud
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from brainglobe_atlasapi import BrainGlobeAtlas
a=BrainGlobeAtlas("allen_mouse_25um",check_latest=False); ref=a.reference; ann=a.annotation; z=ann.shape[0]//2+20
cols=np.zeros(ann.shape[1:]+(3,)); sl=ann[z]
for rid in np.unique(sl):
    if rid==0: continue
    try: cols[sl==rid]=np.array(a.structures[rid]["rgb_triplet"])/255
    except KeyError: pass
fig,ax=plt.subplots(1,2,figsize=(12,4.8)); ax[0].imshow(ref[z],cmap="gray"); ax[0].set_title("CCFv3 template, coronal slice"); ax[1].imshow(ref[z],cmap="gray"); ax[1].imshow(cols,alpha=.6); ax[1].set_title("Allen annotation overlay (official colours)")
[x.axis("off") for x in ax]; fig.tight_layout(); fig.savefig("v1_coronal_overlay.png",dpi=140)
fig,ax=plt.subplots(figsize=(7,5)); ax.imshow(ref[z],cmap="gray")
for acr,c in [("HIP","#1f77b4"),("Isocortex","#2ca02c"),("TH","#d62728"),("HY","#9467bd"),("STR","#ff7f0e"),("fiber tracts","#e5e5e5")]:
    m=a.get_structure_mask(acr)[z]>0 if hasattr(a,"get_structure_mask") else np.isin(sl,a.get_structure_descendants(acr)+[a.structures[acr]["id"]])
    ax.contour(m,levels=[.5],colors=[c],linewidths=1.4); ax.plot([],[],c=c,label=acr)
ax.legend(fontsize=7,loc="lower right"); ax.axis("off"); ax.set_title("Region outlines (CCF overlay style)"); fig.tight_layout(); fig.savefig("v2_region_outlines.png",dpi=140)
from mpl_toolkits.mplot3d import Axes3D  # noqa
fig=plt.figure(figsize=(8,6)); ax=fig.add_subplot(projection="3d")
for acr,c in [("HIP","#1f77b4"),("TH","#d62728"),("STR","#ff7f0e"),("CB","#8c564b")]:
    ids=[a.structures[acr]["id"]]+[a.structures[d]["id"] for d in a.get_structure_descendants(acr)]
    p=np.argwhere(np.isin(ann[::4,::4,::4],ids)); ax.scatter(p[:,0],p[:,2],-p[:,1],s=1,c=c,alpha=.15,label=acr)
ax.legend(markerscale=10); ax.set_axis_off(); ax.set_title("3D CCF regions (voxel cloud)"); ax.view_init(20,-60); fig.savefig("v3_ccf_3d_regions.png",dpi=140)
