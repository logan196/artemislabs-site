# Datashader: all 73,655 MERFISH cells rasterised without overplotting
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import pandas as pd, scanpy as sc, datashader as ds, datashader.transfer_functions as tf, colorcet as cc
m=sc.read_h5ad("../_data/py/merfish.h5ad"); df=pd.DataFrame(m.obsm["spatial"],columns=["x","y"]); df["cls"]=m.obs.Cell_class.astype("category").values; df["b"]=m.obs.Bregma.values
s=df[df.b==df.b.unique()[3]]
cv=ds.Canvas(plot_width=900,plot_height=900)
tf.set_background(tf.shade(cv.points(s,"x","y",ds.count()),cmap=cc.fire,how="eq_hist"),"black").to_pil().save("v1_density_fire.png")
cmap=dict(zip(df.cls.cat.categories,cc.glasbey_light)); tf.set_background(tf.spread(tf.shade(cv.points(s,"x","y",ds.count_cat("cls")),color_key=cmap),px=1),"black").to_pil().save("v2_categorical_shading.png")
cv=ds.Canvas(plot_width=1400,plot_height=500); df["xb"]=df.x+(df.b.rank(method="dense")*1500)
tf.set_background(tf.shade(cv.points(df,"xb","y",ds.count_cat("cls")),color_key=cmap),"black").to_pil().save("v3_all_slices_strip.png")
