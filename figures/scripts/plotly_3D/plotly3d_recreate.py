# Interactive 3D UMAP (HTML) + static PNG export (kaleido) on Zeisel; 3D MERFISH stack of hypothalamic slices
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import scanpy as sc, plotly.express as px, numpy as np; from load_zeisel import load
ad=load(); sc.pp.highly_variable_genes(ad,n_top_genes=2000); sc.pp.pca(ad); sc.pp.neighbors(ad); sc.tl.umap(ad,n_components=3)
u=ad.obsm["X_umap"]; f=px.scatter_3d(x=u[:,0],y=u[:,1],z=u[:,2],color=ad.obs.celltype.astype(str),opacity=.8,title="3D UMAP, Zeisel cortex/hippocampus")
f.update_traces(marker_size=2); f.update_layout(scene=dict(xaxis_title="UMAP1",yaxis_title="UMAP2",zaxis_title="UMAP3"),legend_itemsizing="constant",width=900,height=700)
f.write_html("v1_umap3d.html"); f.write_image("v1_umap3d.png",scale=1.5)
m=sc.read_h5ad("../_data/py/merfish.h5ad"); m=m[m.obs.Animal_ID==m.obs.Animal_ID.iloc[0]]; s=m.obsm["spatial3d"] if "spatial3d" in m.obsm else np.c_[m.obsm["spatial"],m.obs.Bregma]
f=px.scatter_3d(x=s[:,0],y=s[:,1],z=s[:,2],color=m.obs.Cell_class.astype(str),opacity=.6,title="MERFISH hypothalamus: stacked Bregma slices (3D)")
f.update_traces(marker_size=1.3); f.update_layout(width=900,height=750,legend_itemsizing="constant",scene_camera=dict(eye=dict(x=1.6,y=1.2,z=.9)))
f.write_html("v2_merfish3d.html"); f.write_image("v2_merfish3d.png",scale=1.5)
