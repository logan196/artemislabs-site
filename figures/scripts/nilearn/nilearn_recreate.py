# nilearn brain visualisations on real public maps (NeuroVault motor-task t-map; Harvard-Oxford atlas; fsaverage surface)
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from nilearn import datasets, plotting, surface
mot=datasets.load_sample_motor_activation_image() if hasattr(datasets,"load_sample_motor_activation_image") else datasets.fetch_neurovault_motor_task().images[0]
plotting.plot_glass_brain(mot,threshold=3,colorbar=True,plot_abs=False,display_mode="lyrz",title="Glass brain: motor task t-map").savefig("v1_glass_brain.png",dpi=150)
plotting.plot_stat_map(mot,threshold=3,display_mode="z",cut_coords=6,title="Stat map, axial cuts").savefig("v2_stat_map_cuts.png",dpi=150)
fs=datasets.load_fsaverage("fsaverage5") if hasattr(datasets,"load_fsaverage") else datasets.fetch_surf_fsaverage()
try:
    from nilearn.surface import SurfaceImage; si=SurfaceImage.from_volume(mesh=fs["pial"],volume_img=mot)
    fig=plotting.plot_surf_stat_map(stat_map=si,surf_mesh=datasets.load_fsaverage("fsaverage5")["inflated"],hemi="left",view="lateral",threshold=2,colorbar=True,title="Surface projection (left lateral)")
except Exception:
    tex=surface.vol_to_surf(mot,fs.pial_left); fig=plotting.plot_surf_stat_map(fs.infl_left,tex,hemi="left",view="lateral",threshold=2,bg_map=fs.sulc_left,colorbar=True,title="Surface projection (left lateral)")
fig.savefig("v3_surface_stat_map.png",dpi=150); plt.close("all")
ho=datasets.fetch_atlas_harvard_oxford("cort-maxprob-thr25-2mm"); plotting.plot_roi(ho.maps,title="Harvard-Oxford cortical atlas",cut_coords=(0,-20,10),draw_cross=False).savefig("v4_atlas_roi.png",dpi=150)
