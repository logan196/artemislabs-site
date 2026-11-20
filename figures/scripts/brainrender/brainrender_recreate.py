# brainrender 3D renders of the Allen Mouse CCFv3 (25 um, via BrainGlobe): coloured region meshes,
# point clouds sampled from real CCF annotation voxels, and a sliced view.
# brainrender builds the scene (atlas meshes, colours); the final frame is drawn with a plain vedo Plotter
# without depth peeling, because software-GL offscreen rendering blanks translucent meshes when peeling is on.
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import numpy as np, brainrender, vedo
brainrender.settings.OFFSCREEN=True; brainrender.settings.SHOW_AXES=False
from brainrender import Scene
from brainglobe_atlasapi import BrainGlobeAtlas
vedo.settings.use_depth_peeling=False
def draw(scene, name, title, azimuth=0, elevation=0, roll=0, zoom=1.2, cut=None, pts=()):
    objs=[]
    for a in scene.actors:
        m=a._mesh; c=m.properties.GetColor(); al=m.properties.GetOpacity()
        f=vedo.Mesh([m.vertices, m.cells]).c(c).alpha(al).lighting("plastic")
        if a.name=="root": f.c("#d9d9d9").alpha(.12 if cut is None else .35)
        if cut is not None: f=f.cut_with_plane(origin=cut[0], normal=cut[1])
        objs.append(f)
    objs += [vedo.Points(p, r=6, c=c).alpha(.9) for p,c in pts]
    p=vedo.Plotter(offscreen=True, size=(1600,1200), bg="white")
    p.show(*objs, vedo.Text2D(title, pos="top-center", s=1.3, font="Calco"), interactive=False, camera=None)
    cam=p.camera; p.reset_camera(); cam.Azimuth(azimuth); cam.Elevation(elevation); cam.Roll(roll); cam.Zoom(zoom); p.renderer.ResetCameraClippingRange()
    p.render(); p.screenshot(name); p.close(); scene.close()
regs={"Isocortex":"#9ecae1","HIP":"#fb6a4a","STR":"#74c476","TH":"#fdae6b","HY":"#9e9ac8","CB":"#fdd0a2","MB":"#a1d99b","OLF":"#fa9fb5"}
# CCF axes: x=AP (anterior->posterior), y=DV (dorsal->ventral), z=ML
s=Scene(atlas_name="allen_mouse_25um")
for r,c in regs.items(): s.add_brain_region(r, color=c, alpha=.45 if r=="Isocortex" else .95)
draw(s, "v1_regions_3quarter.png", "Allen CCFv3 major divisions (brainrender)", azimuth=-35, elevation=25, roll=180, zoom=1.3)
A=BrainGlobeAtlas("allen_mouse_25um"); rng=np.random.default_rng(0)
s=Scene(atlas_name="allen_mouse_25um"); cols={"CA1":"#e41a1c","CA3":"#377eb8","DG":"#4daf4a","SUB":"#984ea3"}; pts=[]
for r,c in cols.items():
    s.add_brain_region(r, color=c, alpha=.25)
    m=A.get_structure_mask(A.structures[r]["id"]); idx=np.argwhere(m>0); idx=idx[rng.choice(len(idx), min(1500,len(idx)), replace=False)]
    xyz=idx*25.0; xyz[:,2]*=-1  # brainrender meshes use -ML on z
    pts.append((xyz, c)); del m
draw(s, "v2_hippocampus_points.png", "Hippocampal subfields: meshes + CCF voxels (CA1/CA3/DG/SUB)", azimuth=-60, elevation=30, roll=180, zoom=1.6, pts=pts)
s=Scene(atlas_name="allen_mouse_25um")
for r,c in {**regs,"CP":"#31a354","LH":"#ef3b2c","fiber tracts":"#bdbdbd"}.items(): s.add_brain_region(r, color=c, alpha=1)
ctr=s.root._mesh.center_of_mass(); ctr[0]=7600
draw(s, "v3_coronal_cut.png", "Coronal cut at AP 7.6 mm (thalamus / hippocampus)", azimuth=-60, elevation=15, roll=180, zoom=1.3, cut=(ctr,(1,0,0)))
