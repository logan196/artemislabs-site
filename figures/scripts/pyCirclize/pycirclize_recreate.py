# pyCirclize chord + circos ring plots from LIANA+ results on Zeisel (run ../LIANA_plus first)
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import pandas as pd, numpy as np, matplotlib; matplotlib.use("Agg"); from pycirclize import Circos
m=pd.read_csv("../LIANA_plus/lr_counts_matrix.csv",index_col=0); idx=sorted(set(m.index)|set(m.columns)); m=m.reindex(index=idx,columns=idx,fill_value=0)
c=Circos.chord_diagram(m,space=3,cmap="tab10",label_kws=dict(size=8,r=110),link_kws=dict(ec="black",lw=.3,direction=1))
c.savefig("v1_chord_interactions.png",dpi=150)
r=pd.read_csv("../LIANA_plus/liana_rank_aggregate.csv"); top=r[r.source=="astrocytes_ependymal"].nsmallest(25,"magnitude_rank")
lig=sorted(top.ligand_complex.unique()); rec=sorted(top.receptor_complex.unique())
mat=pd.crosstab(top.ligand_complex,top.receptor_complex).reindex(index=lig,columns=rec,fill_value=0)
c=Circos.chord_diagram(mat,space=2,cmap="viridis",label_kws=dict(size=7,orientation="vertical"),link_kws=dict(direction=1,ec="grey",lw=.2))
c.savefig("v2_ligand_receptor_chord.png",dpi=150)
sectors={ct:int(n) for ct,n in r.groupby("source").size().items()}; circ=Circos(sectors,space=4)
for s in circ.sectors:
    t=s.add_track((92,100)); t.axis(fc="#ddd"); t.text(s.name,size=7)
    d=r[r.source==s.name].sort_values("magnitude_rank").reset_index(drop=True); x=np.arange(len(d))+.5
    t2=s.add_track((60,90),r_pad_ratio=.1); t2.bar(x,-np.log10(d.magnitude_rank.clip(1e-6)),width=1,color="#c51b7d")
    t3=s.add_track((35,58)); t3.scatter(x,d.specificity_rank.values,s=1,color="#2166ac")
circ.text("LIANA+ per-source tracks\n(-log10 magnitude, specificity)",size=8); circ.savefig("v3_circos_tracks.png",dpi=150)
