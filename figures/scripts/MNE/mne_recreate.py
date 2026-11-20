# MNE-Python on the PhysioNet EEG Motor Movement/Imagery dataset (EEGBCI; subject 1, imagery runs 6/10/14, ~8 MB):
# raw-trace browser figure, event-related (de)synchronisation time-frequency maps at C3/Cz/C4,
# and mu/beta-band topomaps for imagined hands vs feet.
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, mne
from mne.datasets import eegbci
mne.set_log_level("WARNING")
fs=eegbci.load_data(1,[6,10,14],path=os.path.abspath("../_data/mne"),update_path=False)
raw=mne.concatenate_raws([mne.io.read_raw_edf(f,preload=True) for f in fs]); eegbci.standardize(raw)
raw.set_montage(mne.channels.make_standard_montage("standard_1005")); raw.set_eeg_reference("average"); raw.filter(1.,40.)
raw.annotations.rename(dict(T1="hands",T2="feet"))
fig=raw.plot(duration=10,n_channels=24,scalings=dict(eeg=60e-6),show=False,title="EEGBCI S001 imagery (hands/feet)",show_scrollbars=False)
fig.set_size_inches(12,7); fig.savefig("v1_raw_browser.png",dpi=120); plt.close(fig)
ev,eid=mne.events_from_annotations(raw,event_id=dict(hands=2,feet=3))
ep=mne.Epochs(raw,ev,eid,tmin=-1,tmax=4,picks=("C3","Cz","C4"),baseline=None,preload=True)
freqs=np.arange(4,36); tfr=ep.compute_tfr("multitaper",freqs=freqs,n_cycles=freqs/2,use_fft=True,return_itc=False,average=False,decim=2)
tfr.crop(-.5,4).apply_baseline((-1 if False else -.5,0),mode="percent")
fig,axs=plt.subplots(2,3,figsize=(13,6.5),sharex=True,sharey=True)
for r,cond in enumerate(["hands","feet"]):
    av=tfr[cond].average()
    for c,ch in enumerate(["C3","Cz","C4"]):
        av.plot([ch],axes=axs[r,c],cmap="RdBu_r",vlim=(-1,1.5),colorbar=c==2,show=False,title=None)
        axs[r,c].axvline(0,c="k",lw=.8,ls="--"); axs[r,c].set_title(f"{cond} imagery | {ch}",fontsize=10)
fig.suptitle("ERD/ERS (% change from baseline), multitaper TFR"); fig.tight_layout(); fig.savefig("v2_erds_tfr.png",dpi=130); plt.close(fig)
ep2=mne.Epochs(raw,ev,eid,tmin=.5,tmax=3.5,baseline=None,preload=True)
fig,axs=plt.subplots(2,3,figsize=(11,7))
for r,(band,(lo,hi)) in enumerate({"mu 8-12 Hz":(8,12),"beta 16-26 Hz":(16,26)}.items()):
    P={c:ep2[c].compute_psd(fmin=lo,fmax=hi).get_data().mean(axis=(0,2)) for c in ["hands","feet"]}
    vmax=max(P["hands"].max(),P["feet"].max())*1e12
    for k,c in enumerate(["hands","feet"]): mne.viz.plot_topomap(P[c]*1e12,ep2.info,axes=axs[r,k],show=False,cmap="viridis",vlim=(0,vmax),contours=4); axs[r,k].set_title(f"{c}: {band}")
    d=10*np.log10(P["hands"]/P["feet"]); m=np.abs(d).max(); mne.viz.plot_topomap(d,ep2.info,axes=axs[r,2],show=False,cmap="RdBu_r",vlim=(-m,m),contours=4); axs[r,2].set_title(f"hands - feet (dB), {band}")
fig.suptitle("Band-power topographies, imagined movement (EEGBCI S001)"); fig.tight_layout(); fig.savefig("v3_band_topomaps.png",dpi=130); plt.close(fig)
